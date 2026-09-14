class KikxConfig {
  constructor(config = {}) {
    const { apiUrl, wsUrl, appID } = config || {};

    this.customApiUrl = apiUrl;
    this.customWsUrl = wsUrl;
    this.customAppID = appID || window.location.pathname.split("/")[2] || null;
  }

  // Get AppID
  getAppID = () => this.customAppID;

  // Configure custom API URLs
  configureUrls(options = {}) {
    const { apiUrl, wsUrl, appID } = options;

    if (apiUrl) this.customApiUrl = apiUrl;
    if (wsUrl) this.customWsUrl = wsUrl;
    if (appID) this.customAppID = appID;
  }

  // Get default base URL
  getDefaultBase = () => {
    const { protocol, hostname, port } = window.location;
    return `${protocol}//${hostname}${port ? `:${port}` : ""}`;
  };

  // Get API URL
  getApiUrl = () => this.customApiUrl || this.getDefaultBase();

  // Get WebSocket URL
  getWsUrl = () => {
    if (this.customWsUrl) return this.customWsUrl;

    const { protocol, hostname, port } = window.location;
    return `${protocol === "https:" ? "wss:" : "ws:"}//${hostname}${port ? `:${port}` : ""}`;
  };

  // Get full API URL with endpoint
  getUrl = (end = "") => `${this.getApiUrl()}${end.startsWith("/") ? end : `/${end}`}`;
}

export default KikxConfig;