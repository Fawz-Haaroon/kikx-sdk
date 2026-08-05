import Service from "./Service.js";

export default class OSService extends Service {
  constructor(app) {
    super(app, "os");
  }
  // { data, error } result
  func = (name, { args = [], options = {} }) =>
    this.request("run", "POST", { name, args, options });
  // Output / Error result
  exec = (name, { args = [], options = {} }) =>
    this.fetch("run", "POST", { name, args, options });
}
