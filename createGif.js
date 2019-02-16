const getPixels = require("get-pixels")
const GIFEncoder = require("gifencoder");
const sizeOf = require("image-size");
const fs = require("fs");
const { createCanvas, loadImage } = require('canvas');

const addToGif = (cutting, encoder, ctx, dimensions, images, counter = 0) => {
  loadImage(images[counter]).then((image) => {
    ctx.drawImage(image, cutting.x, cutting.y, dimensions.width, dimensions.height, 0, 0, dimensions.width, dimensions.height);
    encoder.addFrame(ctx);
    if (counter === images.length - 1) {
      encoder.finish();
    } else {
      addToGif(cutting, encoder, ctx, dimensions, images, ++counter);
    }
  });
}

const start = async () => {
  const outputFolder = "./output/";
  if (fs.existsSync(outputFolder)) {
    if (!fs.existsSync(__dirname+"/gif/")) {
      fs.mkdirSync(__dirname+"/gif/");
    }
    const data = {
      "prefix":"",
      "quality":10,
      "delay":250,
      "repeat":0,
      "x":0,
      "y":0,
      "width":0,
      "height":0
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
      let realDimensions = {
        width:dimensions.width,
        height:dimensions.height
      };
      if(data["width"]!==0){
        realDimensions.width = parseInt(data["width"]);
      }
      if(data["height"]!==0){
        realDimensions.height = parseInt(data["height"]);
      }
      const encoder = new GIFEncoder(realDimensions.width, realDimensions.height);
      const d = new Date();
      const file = fs.createWriteStream(__dirname+"/gif/"+data["prefix"]+"-"+d.getTime()+".gif");
      encoder.createReadStream().pipe(file);

      encoder.start();
      encoder.setRepeat(data["repeat"]);
      encoder.setQuality(data["quality"]);
      encoder.setDelay(data["delay"]);

      const canvas = createCanvas(realDimensions.width, realDimensions.height);
      const ctx = canvas.getContext('2d');

      const cutting = {
        x:parseInt(data["x"]),
        y:parseInt(data["y"])
      }
      addToGif(cutting, encoder, ctx, realDimensions, pics);
      console.log("Finished");
    } else {
      console.log("There are no images with that prefix");
    }
  } else {
    console.log("There are no images");
  }
}

start();
