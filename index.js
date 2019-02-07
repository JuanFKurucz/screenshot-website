const { app, BrowserWindow } = require("electron");
const fs = require("fs");
const pdf = require('pdf-poppler');

let win;

const closeAndClean = () => {
  win.webContents.session.clearCache(function(){
    win.close();
    app.quit();
  });
}

const convertPdf = (file,url) => {
  var regex = /(?:[\w-]+\.)+[\w-]+/;
  const d = new Date();
  let opts = {
    format: 'jpeg',
    out_dir: __dirname+"/output/",
    out_prefix: regex.exec(url)+"-"+d.getTime(),
    page: null
  };
  pdf.convert(file, opts).finally(()=>{
    fs.unlinkSync(file);
    closeAndClean();
  })
};

const start = () => {
  if (!fs.existsSync(__dirname+"/tmp/")) {
    fs.mkdirSync(__dirname+"/tmp/");
  }
  if (!fs.existsSync(__dirname+"/output/")) {
    fs.mkdirSync(__dirname+"/output/");
  }

  const data = {
    "url":""
  };
  process.argv.forEach(function (val, index, array) {
    const d=val.split("=");
    if(d.length==2 && data.hasOwnProperty(d[0].toLowerCase())){
      data[d[0].toLowerCase()]=d[1];
    }
  });
  if(data.hasOwnProperty("url")){
    createWindow(data["url"]);
  } else {
    closeAndClean();
  }
};

const createWindow = (url) => {
  win = new BrowserWindow({ width: 800, height: 600 });
  win.loadURL(url);
  const pdfFile = __dirname+"/tmp/print.pdf";
  win.webContents.on("did-finish-load", () => {
    win.webContents.printToPDF({}, (error, data) => {
      if (error) throw error;
      fs.writeFile(pdfFile, data, (error) => {
        if (error) throw error;
        convertPdf(pdfFile,url);
      });
    });
  });
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
