import { request as apiRequest } from "../Api.js";

export default class Service {
  constructor(app, name) {
    this.app = app;
    this.serviceName = name;
    this.baseURL = `/service/${this.serviceName}`;

    this._apiType = "request";
  }
  
  setRequestType() {
    this._apiType = "request";
  }

  setFetchType() {
    this._apiType = "fetch";
  }

  api = (...args) =>
    this._apiType === "request" ? this.request(...args) : this.fetch(...args);

  request = (
    endpoint,
    {
      method = "GET",
      body = undefined,
      params = {},
      headers = {},
      ...options
    } = {}
  ) => {
    Object.assign(headers, { "kikx-app-id": this.app.getAppID() });
    const url = this.app.getUrl(`${this.baseURL}/${endpoint}`);

    return apiRequest(url, {
      method,
      body,
      params,
      headers,
      ...options
    });
  };

  fetch = async (...args) => {
    const { data, error } = await this.request(...args);

    if (error) {
      throw new Error(error.detail || "Error fetching data");
    }

    return data;
  };

  health = () => this.fetch("health");
}
