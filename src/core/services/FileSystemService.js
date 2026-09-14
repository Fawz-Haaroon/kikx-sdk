import Service from "./Service.js";

export default class FileSystemService extends Service {
  constructor(app) {
    super(app, "fs");
  }

  // List files by limit & sorting -1 for all files
  listFiles = (
    directory,
    {
      offset = 0,
      limit = -1,
      sort = "name",
      asc = true,
      thumbnails = false
    } = {}
  ) =>
    this.api("list", {
      params: { directory, offset, limit, sort, asc, thumbnails }
    });

  // Get thumbnail
  thumbnail = filename =>
    this.api("thumbnail", {
      params: { filename }
    });

  // Read file
  readFile = filename =>
    this.api("read", {
      params: { filename }
    });

  // Write file
  writeFile = (filename, content, { mode = "write", ensureDir = false } = {}) =>
    this.api("write", {
      method: "POST",
      body: { filename, content, mode, ensure_dir: ensureDir }
    });

  // Append to file
  appendFile = (filename, content) =>
    this.writeFile(filename, content, { mode: "append" });

  // Delete file
  deleteFile = filename =>
    this.api("delete", {
      method: "DELETE",
      params: { filename }
    });

  // Upload file
  uploadFile = (file, dest) => {
    const formData = new FormData();
    formData.append("files", file);

    return this.api("upload", {
      method: "POST",
      body: formData,
      params: { dest }
    });
  };

  // Download file
  downloadFile = path =>
    this.api("download", {
      params: { path }
    });

  // Upload files
  uploadFiles = (files, dest) => {
    const formData = new FormData();

    files.forEach(file => formData.append("files", file));

    return this.api("upload", {
      method: "POST",
      body: formData,
      params: { dest }
    });
  };

  // Create File
  createFile = filename =>
    this.api("create_file", {
      method: "POST",
      body: { filename }
    });

  // Create directory
  createDirectory = dirname =>
    this.api("create_directory", {
      method: "POST",
      body: { dirname }
    });

  // Delete directory
  deleteDirectory = dirname =>
    this.api("delete_directory", {
      method: "DELETE",
      params: { dirname }
    });

  // Delete list
  deleteList = paths =>
    this.api("delete-list", {
      method: "POST",
      body: { paths }
    });

  // Rename
  rename = (source, new_name) =>
    this.api("rename", {
      method: "POST",
      body: { source, new_name }
    });

  // Info
  info = path =>
    this.api("info", {
      params: { path }
    });

  // Copy
  copy = (source, dest) =>
    this.api("copy", {
      method: "POST",
      body: { source, dest }
    });

  // Copy File
  copyFile = (source, dest, { override = false } = {}) =>
    this.request("copy-file", {
      method: "POST",
      body: { source, dest, override }
    });

  // Move
  move = (source, dest) =>
    this.api("move", {
      method: "POST",
      body: { source, dest }
    });

  // Expose path for serve files
  expose = (path, expires = null) =>
    this.api("expose", {
      method: "POST",
      body: { path, expires }
    });

  // Remove Expose
  removeExpose = uid =>
    this.api("expose", {
      method: "DELETE",
      params: { uid }
    });

  // Clear Expose
  clearExpose = () => this.api("clear-expose");

  // Get file url
  getServeUrl = (uid, path = "", absolute = false) => {
    const url = `${this.baseURL}/serve/${uid}/${encodeURIComponent(path)}`;

    return absolute ? this.app.getUrl(url) : url;
  };

  // Get full file url
  getServeAbsUrl = (uid, path = "") => this.getServeUrl(uid, path, true);

  // Get serve file
  getServeFile = (uid, path = "") =>
    this.api(`serve/${uid}/${encodeURIComponent(path)}`);
}
