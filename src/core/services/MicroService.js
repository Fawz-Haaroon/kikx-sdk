import Service from "./Service.js";

export default class MicroService extends Service {
  constructor(app) {
    super(app, "micro");
  }
  // List App Services
  list = () => this.request("list");
  // Start service
  start = name => this.request("start", "POST", { name });
  // Get output
  output = uid => this.request(`output?uid=${uid}`);
  // Send input to service
  send = (uid, data) =>
    this.request("send", "POST", {
      uid,
      data
    });
  // Stop service by uid
  stop = uid => this.request(`stop?uid=${uid}`);
  // Stop all app services
  stopAll = uid => this.request("stop-all");
}
