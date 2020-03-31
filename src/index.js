const { app, BrowserWindow } = require("electron");
const fs = require("fs");
const path = require("path");

let win;

const closeAndClean = () => {
  win.webContents.session.clearCache(function() {
    win.close();
    app.quit();
  });
};

const start = () => {
  baseFolder = path.resolve(__dirname, "..");
  if (!fs.existsSync(baseFolder + "/tmp/")) {
    fs.mkdirSync(baseFolder + "/tmp/");
  }
  if (!fs.existsSync(baseFolder + "/output/")) {
    fs.mkdirSync(baseFolder + "/output/");
  }

  const data = {
    url: ""
  };
  process.argv.forEach(function(val, index, array) {
    const d = val.split("=");
    if (d.length == 2 && data.hasOwnProperty(d[0].toLowerCase())) {
      data[d[0].toLowerCase()] = d[1];
    }
  });
  if (data.hasOwnProperty("url")) {
    createWindow(data["url"]);
  } else {
    closeAndClean();
  }
};

const createWindow = url => {
  win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: __dirname + "/script.js",
      webSecurity: false,
      allowRunningInsecureContent: true
    }
  });
  win.loadURL(url);
  win.on("closed", () => {
    win = null;
  });
};

app.on("ready", () => {
  start();
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (win === null) {
    start();
  }
});
