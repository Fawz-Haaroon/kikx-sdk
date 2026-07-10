import Handler from "../Handler.js";

class AppTask {
  constructor(cmd, handler, func, once = true) {
    this.cmd = cmd;
    this.func = func;
    this.handler = handler;

    this.running = false;
    this.taskID = null;

    this.once = once;
    this.completed = false;

    this.handler?.onData(data => {
      if (data.status === "ended") {
        this.running = false;
        this.completed = true;
      }
    });
  }

  async init({
    noSudo = false,
    allowCommands = false,
    outputMode = "send"
  } = {}) {
    if (this.taskID) throw Error("Task already Created");

    const { data, error } = await this.func("tasks.create_task", {
      args: [`${this.cmd}`.trim()],
      options: {
        no_sudo: noSudo,
        allow_commands: allowCommands,
        output_mode: outputMode
      }
    });

    if (error) throw Error(error.detail);

    this.taskID = data.id;

    return data;
  }

  async __run() {
    if (!this.taskID) throw Error("Task not initialized call 'init' first");

    if (this.once && this.completed)
      throw Error("Task (Once) already completed");

    this.running = true;

    const { error, data } = await this.func("tasks.run_task", {
      args: [],
      options: {
        task_id: this.taskID,
        handler_id: this.handler ? this.handler.handlerID : null
      }
    });

    if (error) {
      this.running = false;
      throw Error(error.detail);
    }

    return data;
  }

  async run() {
    if (this.running) throw Error("Task already running");

    this.running = true;

    return await this.__run();
  }

  async send(input) {
    if (!this.taskID || !input) throw Error("No input or task error");

    await this.func("tasks.send_input", {
      args: [this.taskID, input]
    });
  }

  async command(event, payload = {}) {
    return await this.func("tasks.task_command", {
      args: [this.taskID, event],
      options: { payload }
    });
  }

  async getInfo(event, payload = {}) {
    return await this.func("tasks.get_task_info", {
      args: [this.taskID]
    });
  }

  async getSavedOutput() {
    return await this.func("tasks.get_task_output", {
      args: [this.taskID]
    });
  }

  on(callback) {
    this.handler?.onData(callback);
  }

  _kill(remove = false) {
    return this.func("tasks.kill", {
      args: [this.taskID],
      options: { remove }
    });
  }

  async kill() {
    return await this._kill();
  }
}

export default class AppTasks {
  constructor(app) {
    if (!app) {
      throw Error("AppTasks must require KikxApp, KikxAppClient");
    }

    this.app = app;
  }

  runFunc = (name, options) => {
    return this.app.func(name, options);
  };

  createTask(cmd, once = true) {
    if (!this.app.func) {
      throw Error("KikxAppClient is required as app to create task");
    }

    const handler = this.app.createHandler();

    return new AppTask(cmd, handler, this.runFunc, once);
  }

  // Kill & Clear task and handler
  async clearTask(task) {
    await task._kill(true);

    this.app.removeHandler(task.handler.handlerID);
  }

  //
  async doTask(cmd, callback) {
    const task = this.createTask(cmd);
    await task.init();

    task.on(data => {
      callback({ data, task });
    });

    return await task.__run();
  }

  // Checks every delayCheck(ms) = 5 seconds
  // if no output then gets taskInfo
  // checks if completed then returns data
  // Runs task with save mode and return data, error
  async runSaveTask(cmd, callback = null, delayCheck = 5000) {
    const task = this.createTask(cmd);

    return new Promise(resolve => {
      let timer;
      let finished = false;

      const cleanup = async () => {
        clearTimeout(timer);
        await this.clearTask(task);
      };

      const fail = async error => {
        if (finished) return;

        finished = true;
        await cleanup();

        resolve({
          data: null,
          error: error instanceof Error ? error : new Error(String(error))
        });
      };

      const complete = async () => {
        if (finished) return;

        finished = true;

        try {
          const { data, error } = await task.getSavedOutput();

          await cleanup();

          if (error) {
            return resolve({
              data: null,
              error: new Error(error.detail)
            });
          }

          resolve({
            data: data || [],
            error: null
          });
        } catch (err) {
          await cleanup();

          resolve({
            data: null,
            error: err
          });
        }
      };

      const resetWatchdog = () => {
        if (finished) return;

        clearTimeout(timer);

        timer = setTimeout(async () => {
          if (finished) return;

          try {
            const { data, error } = await task.getInfo();

            if (finished) return;

            if (error) {
              return await fail(new Error(error.detail));
            }

            if (data.completed) {
              if (data.error_text) {
                return await fail(new Error(data.error_text));
              }

              return await complete();
            }

            resetWatchdog();
          } catch (err) {
            return await fail(err);
          }
        }, delayCheck);
      };

      (async () => {
        try {
          await task.init({
            outputMode: callback ? "*" : "save"
          });

          resetWatchdog();

          task.on(async ({ status, output }) => {
            if (finished) return;

            if (callback) {
              try {
                callback({ status, output });
              } catch {
                // Ignore callback errors
              }
            }

            if (status === "error") {
              return await fail(output);
            }

            if (status === "ended") {
              return await complete();
            }

            // Refresh watchdog only while task is active.
            resetWatchdog();
          });

          await task.__run();
        } catch (err) {
          await fail(err);
        }
      })();
    });
  }

  // Long polling task
  async runTaskPolling(cmd, delayCheck = 5000) {
    const task = new AppTask(cmd, null, this.runFunc, true);

    try {
      await task.init({
        outputMode: "save"
      });

      await task.__run();

      while (true) {
        const { data, error } = await task.getInfo();

        if (error) {
          throw new Error(error.detail);
        }

        if (data.completed) {
          const result = await task.getSavedOutput();

          if (result.error) {
            throw new Error(result.error.detail);
          }

          return {
            returncode: data.returncode,
            stdout: result.data || [],
            stderr: data.error_text
          };
        }

        await new Promise(resolve => setTimeout(resolve, delayCheck));
      }
    } finally {
      await task._kill(true);
    }
  }

  // Quick task with input
  quickRun(cmd, { noSudo = false, input = [], timeout = 0 } = {}) {
    return this.app.func("tasks.quick_run", {
      timeout,
      args: [cmd.trim()],
      options: {
        no_sudo: noSudo,
        input_args: input
      }
    });
  }
}
