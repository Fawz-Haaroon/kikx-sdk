import Service from "./Service.js";

// Runs functions in os service in backend
export default class OSService extends Service {
  constructor(app) {
    super(app, "os");
  }

  // { data, error } result
  func = (name, { args = [], options = {} } = {}) =>
    this.request("run", {
      method: "POST",
      body: {
        name,
        args,
        options
      }
    });

  // Execute
  run = (name, { args = [], options = {} } = {}) =>
    this.fetch("run", {
      method: "POST",
      body: {
        name,
        args,
        options
      }
    });

  // ---------------------------------------------------------
  // Methods
  // ---------------------------------------------------------

  // Get username
  username = () => this.run("username");

  // Get environment variable
  getenv = (key, defaultValue = null) =>
    this.run("getenv", {
      args: [key, defaultValue]
    });

  // Set environment variable
  setenv = (key, value) =>
    this.run("setenv", {
      args: [key, value]
    });

  // Unset environment variable
  unsetenv = key =>
    this.run("unsetenv", {
      args: [key]
    });

  // Get complete environment
  environment = () => this.run("environment");

  // Get OS information
  info = () => this.run("info");
}
