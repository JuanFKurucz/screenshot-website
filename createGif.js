const getPixels = require("get-pixels")
const GifEncoder = require("gif-encoder");
const sizeOf = require("image-size");
const fs = require("fs");

const addToGif = (gif, images, counter = 0) => {
  getPixels(images[counter], function(err, pixels) {
    gif.addFrame(pixels.data);
    gif.read();
    if (counter === images.length - 1) {
      gif.finish();
    } else {
      addToGif(gif, images, ++counter);
    }
  })
}

const start = () => {
  const outputFolder = __dirname+"/output/";
  if (fs.existsSync(outputFolder)) {
    if (!fs.existsSync(__dirname+"/gif/")) {
      fs.mkdirSync(__dirname+"/gif/");
    }
    const data = {
      "prefix":"",
      "quality":100,
      "delay":250
    };

    process.argv.forEach(function (val, index, array) {
      const d=val.split("=");
      if(d.length==2 && data.hasOwnProperty(d[0].toLowerCase())){
        data[d[0].toLowerCase()]=d[1];
      }
    });

    let pics = [];
    let dimensions = null;
    fs.readdirSync(outputFolder).forEach(file => {
      if(file.indexOf(data["prefix"])===0){
        pics.push(outputFolder+file);
        if(dimensions === null){
          dimensions = sizeOf(outputFolder+file);
        }
      }
    });

    if(pics.length){
      const gif = new GifEncoder(dimensions.width, dimensions.height);
      const d = new Date();
      const file = fs.createWriteStream(__dirname+"/gif/"+data["prefix"]+"-"+d.getTime()+".gif");
      gif.pipe(file);
      gif.setQuality(data["quality"]);
      gif.setDelay(data["delay"]);
      gif.writeHeader();
      addToGif(gif, pics);
    } else {
      console.log("There are no images with that prefix");
    }
  } else {
    console.log("There are no images");
  }
}

start();
