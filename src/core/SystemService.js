import Service from "./services/Service.js";
import { generateUUID } from "../utils/uuid.js";

// Alert
class Alert {
  constructor(app) {
    this.app = app;
    this.uid = generateUUID();
  }
  show(message) {
    return this.app.system._alert({
      uid: this.uid,
      silent: true,
      priority: "high",
      message
    });
  }
}

export default class SystemService extends Service {
  constructor(app) {
    super(app, "system");
  }
  // /info
  appInfo = () => this.fetch("info/app");
  // Get app names in list
  getAppsList = (extra = false) => this.fetch(`info/apps-list?extra=${extra}`);
  // Sessions
  sessionsInfo = () => this.request("info/sessions");
  // Close Sessions
  closeSession = sessionID =>
    this.request(`info/session/close/${sessionID}`, "POST");
  // Alert
  _alert = payload => this.fetch("alert", "POST", payload);
  // Alert Message
  alert = (
    message,
    {
      type = "info",
      delay = 0,
      priority = "normal",
      silent = false,
      extra = {}
    } = {}
  ) => {
    return this._alert({ message, type, delay, priority, silent, extra });
  };
  //
  createAlert(payload) {
    return new Alert(this.app, payload);
  }
  // App function x
  appFunc = (name, config) =>
    this.request("app/func", "POST", { name, config });
  // Close app by itself
  closeApp = () => this.fetch("close-app", "POST");
  // Invoke an action
  invoke = (action, payload = {}) =>
    this.request("invoke", "POST", { action, payload });
}
