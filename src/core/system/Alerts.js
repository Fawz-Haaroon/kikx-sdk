import { generateUUID } from "../../utils/uuid.js";

class Alert {
  constructor(_alert) {
    this._alert = _alert;
    this.uid = generateUUID();

    this.onclick = null;

    this._sticky = false;
    this._silent = false;
    this._priority = "normal";
    this._label = null;
    this._extra = {};
  }

  // ----------------------------------------
  // Configuration
  // ----------------------------------------

  setSticky(value = true) {
    this._sticky = Boolean(value);
    return this;
  }

  setSilent(value = true) {
    this._silent = Boolean(value);
    return this;
  }

  setPriority(priority = "normal") {
    if (!["less", "normal", "high"].includes(priority)) {
      throw new Error(`Invalid priority option: ${priority}`);
    }

    this._priority = priority;

    return this;
  }

  setLabel(label = null) {
    this._label = label;
    return this;
  }

  setExtra(key, value) {
    this._extra[key] = value;
    return this;
  }

  setIsCode(value = true) {
    return this.setExtra("isCode", Boolean(value));
  }

  // ----------------------------------------
  // Actions
  // ----------------------------------------

  onClick(callback) {
    this.onclick = callback;
    return this;
  }

  show(message, type = "info") {
    return this._alert({
      uid: this.uid,
      type,
      message,
      label: this._label,
      extra: {
        ...this._extra
      },
      silent: this._silent,
      sticky: this._sticky,
      priority: this._priority
    });
  }

  hide() {
    return this.show("");
  }
}

export default class Alerts {
  constructor(app) {
    this.app = app;

    // All currently owned alerts
    this.alerts = new Map();

    this.app.onMessage("alert:click", this._onAlertClick);

    this.destroyed = false;
  }

  // ----------------------------------------
  // Events
  // ----------------------------------------

  _onAlertClick = ({ uid }) => {
    const alert = this.alerts.get(uid);

    if (alert) {
      alert.onclick?.();
    }
  };

  // ----------------------------------------
  // Create
  // ----------------------------------------

  createAlert() {
    if (this.destroyed) {
      throw new Error("Alerts has been destroyed");
    }

    const alert = new Alert(this.app.system._alert);

    this.alerts.set(alert.uid, alert);

    return alert;
  }

  // ----------------------------------------
  // Quick Alert
  // ----------------------------------------

  alert(message, { type = "info", priority = "normal" } = {}) {
    return this.system.alert(message, { type, priority });
  }

  // ----------------------------------------
  // Remove one
  // ----------------------------------------

  clearAlert(alert) {
    if (!alert) {
      return;
    }

    this.alerts.delete(alert.uid);

    try {
      alert.hide();
    } catch {
      // Ignore alert cleanup errors
    }
  }

  // ----------------------------------------
  // Remove everything
  // ----------------------------------------

  clearAll() {
    const alerts = this.alerts.values();

    this.alerts.clear();

    for (const alert of alerts) {
      try {
        alert.hide();
      } catch {
        // Ignore alert cleanup errors
      }
    }
  }

  // ----------------------------------------
  // Alert count
  // ----------------------------------------

  get size() {
    return this.alerts.size;
  }

  // ----------------------------------------
  // Destroy
  // ----------------------------------------

  cleanup() {
    if (this.destroyed) {
      return;
    }

    this.app.offMessage("alert:click", this._onAlertClick);

    this.destroyed = true;

    this.clearAll();
  }

  destroy() {
    return this.cleanup();
  }
}
