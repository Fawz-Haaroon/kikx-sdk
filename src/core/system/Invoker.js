export default class Invoker {
  constructor(app) {
    this.app = app;
  }

  // Invoke
  _invoke = (action, payload = {}) =>
    this.app.system.request("invoke", {
      method: "POST",
      body: {
        action,
        payload
      }
    });

  // Open App
  openApp = (name, { args = [], query = {} } = {}) =>
    this._invoke("openApp", {
      name,
      args,
      query
    });

  // Action
  action = (name, options = {}) => this._invoke("action", { name, options });

  // Share Item
  share = item => this.action("share", { item });

  // Change ui wallpaper (accepts: url, /files...path)
  setWallpaper = url => this.action("set-wallpaper", { url });

  // Change app theme in ui
  setTheme = name => this.action("set-theme", { name });
}
