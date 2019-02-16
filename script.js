const remote = require('electron').remote;
const html2canvas = require("html2canvas");
const fs = require("fs");

window.onload=function(){
  html2canvas(document.body,{allowTaint:true}).then((canvas) => {
    const base64 = canvas.toDataURL().replace(/^data:image\/png;base64,/, "");
    const regex = /(?:[\w-]+\.)+[\w-]+/;
    const d = new Date();
    const output = __dirname+"/output/"+regex.exec(document.URL)+"-"+d.getTime()+".png";
    fs.writeFile(output, base64, 'base64', function(err) {
      remote.getCurrentWindow().close();
    });
  });
}
