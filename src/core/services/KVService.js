import Service from "./Service.js";

export default class KVService extends Service {
  constructor(app) {
    super(app, "kv");

    this.setFetchType();
  }

  // Get collection info
  info = () => this.api("info");

  // Dump data
  dump = () => this.api("dump");

  // Get value by key
  get = key =>
    this.api("get", {
      params: { key }
    });

  // Set key/value
  set = (key, value) =>
    this.api("set", {
      method: "POST",
      body: { key, value }
    });

  // Check if key exists
  exists = key =>
    this.api("exists", {
      params: { key }
    });

  // Get existing value or set default value
  getOrSet = (key, value) =>
    this.api("get-set", {
      method: "POST",
      body: { key, value }
    });

  // Remove and return value
  pop = key =>
    this.api("pop", {
      method: "DELETE",
      params: { key }
    });

  // Persist collection
  save = () =>
    this.api("save", {
      method: "POST"
    });

  // Reset collection
  reset = () =>
    this.api("reset", {
      method: "POST"
    });
}
