import Service from "./services/Service.js";
import { generateUUID } from "../utils/uuid.js";

// Alert
class Alert {
  constructor(app) {
    this.app = app;
    this.uid = generateUUID();

    this._sticky = false;
    this._silent = false;
    this._priority = "normal";
    this._label = null;
    this._extra = {};
  }
  setSticky(v = true) {
    this._sticky = Boolean(v);
    return this;
  }
  setSilent(v = true) {
    this._silent = Boolean(v);
    return this;
  }
  setPriority(v = "normal") {
    if (!["less", "normal", "high"].includes(v)) {
      throw new Error(`Invalid priority option: ${v}`);
    }
    this._priority = v;
    return this;
  }
  setExtra(k, v) {
    this._extra[k] = v;
    return this;
  }
  setIsCode(v = true) {
    this.setExtra("isCode", Boolean(v));
    return this;
  }
  setLabel(label = null) {
    this._label = label;
    return this;
  }
  show(message, type = "info") {
    return this.app.system._alert({
      type,
      message,
      uid: this.uid,
      label: this._label,
      extra: this._extra,
      silent: this._silent,
      sticky: this._sticky,
      priority: this._priority
    });
  }
  hide() {
    return this.show("");
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
  alert = (message, { type = "info", priority = "normal" } = {}) => {
    return this._alert({ message, type, priority });
  };
  // Create alert instance
  createAlert() {
    return new Alert(this.app);
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
