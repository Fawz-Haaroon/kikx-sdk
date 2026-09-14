class AppInstaller {
  constructor(app) {
    this.app = app;

    this.appData = null;
    this.isGithub = false;
  }

  // ----------------------------------------
  // Info
  // ----------------------------------------

  getTempID = () => this.appData?.temp_id;

  getPreviewUrl = file =>
    this.app.getUrl(
      `${this.app.system.baseURL}/kpm/preview/${this.getTempID()}/${encodeURIComponent(file)}`
    );

  // ----------------------------------------
  // Prepare local package
  // ----------------------------------------

  prepare = async file => {
    if (this.appData) {
      return this.appData;
    }

    const formData = new FormData();
    formData.append("file", file);

    const { data, error } = await this.app.system.request("kpm/prepare-local", {
      method: "POST",
      body: formData
    });

    if (error) {
      throw new Error(error.detail);
    }

    this.appData = data;
    this.isGithub = false;

    return data;
  };

  // from storage path
  storage = async path => {
    if (this.appData) {
      return this.appData;
    }

    const { data, error } = await this.app.system.request(
      "kpm/prepare-storage",
      {
        method: "POST",
        params: { path }
      }
    );

    if (error) {
      throw new Error(error.detail);
    }

    this.appData = data;
    this.isGithub = false;

    return data;
  };

  // ----------------------------------------
  // Prepare Github package
  // ----------------------------------------

  github = async (url, tag = null) => {
    if (this.appData) {
      return this.appData;
    }

    const { data, error } = await this.app.system.request(
      "kpm/prepare-github",
      {
        method: "POST",
        params: {
          url,
          tag
        }
      }
    );

    if (error) {
      throw new Error(error.detail);
    }

    this.appData = data;
    this.isGithub = true;

    return data;
  };

  // ----------------------------------------
  // Install
  // ----------------------------------------

  install = async () => {
    if (!this.appData) {
      throw new Error("No prepared installation session");
    }

    const { data, error } = await this.app.system.request(
      "kpm/confirm-install",
      {
        method: "POST",
        params: {
          temp_id: this.getTempID()
        }
      }
    );

    if (error) {
      throw new Error(error.detail);
    }

    return data;
  };
}

export default class Kpm {
  constructor(app) {
    this.app = app;

    // Named/reusable installers
    this._installers = new Map();
  }

  // ----------------------------------------
  // Create
  // ----------------------------------------

  createInstaller = () => {
    return new AppInstaller(this.app);
  };

  // ----------------------------------------
  // Get installer
  // ----------------------------------------

  getInstaller = name => {
    if (!name) {
      return this.createInstaller();
    }

    if (!this._installers.has(name)) {
      this._installers.set(name, this.createInstaller());
    }

    return this._installers.get(name);
  };

  // ----------------------------------------
  // Remove installer
  // ----------------------------------------

  removeInstaller = name => {
    if (!name) {
      return;
    }

    this._installers.delete(name);
  };

  // ----------------------------------------
  // Clear installers
  // ----------------------------------------

  clearInstallers = () => {
    this._installers.clear();
  };

  // ----------------------------------------
  // Installer count
  // ----------------------------------------

  get installerCount() {
    return this._installers.size;
  }

  // ----------------------------------------
  // Installed apps
  // ----------------------------------------

  getInstalledApps = () => this.app.system.request("kpm/installed-apps");

  // ----------------------------------------
  // App info
  // ----------------------------------------

  getAppInfo = name =>
    this.app.system.request("kpm/app-info", {
      params: { name }
    });

  // ----------------------------------------
  // Uninstall app
  // ----------------------------------------

  uninstallApp = async (name, keepData = false) => {
    const { data, error } = await this.app.system.request("kpm/uninstall", {
      params: {
        app_name: name,
        keep_data: keepData
      }
    });

    if (error) {
      throw new Error(error.detail);
    }

    return data;
  };
}
