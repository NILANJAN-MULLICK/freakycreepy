// Experiement using TensorFlow & COCO-SSD

const loadNewImage = document.getElementById('toggle');
const run = document.getElementById('run');
const app = document.getElementById('app');
const loader = document.getElementById('loader');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const assetUrl = 'https://assets.codepen.io/1290466';
const imgSize = 1000;
const canvasOffset = 20;

const imgUrls = [
  `${assetUrl}/dog+on+sofa.jpg?width=${imgSize}`,
  `${assetUrl}/dogs-eat-bananas.jpg?width=${imgSize}`,
  `${assetUrl}/tennis.jpg?height=${imgSize}`,
  `${assetUrl}/motorbike-min.jpg?width=${imgSize}`,
  `${assetUrl}/zebra.jpg?width=${imgSize}`,
  `${assetUrl}/street.jpg?width=${imgSize}`,
  `${assetUrl}/elephants.jpg?height=${imgSize}`,
  `${assetUrl}/computer.jpg?width=${imgSize}`,
  `${assetUrl}/broccoli.jpg?height=${imgSize}`
];

let img;
let modelPromise;
let model;
let imgIndex = 0;

window.onload = async () => {
  modelPromise = cocoSsd.load({base: 'mobilenet_v2'});
  model = await modelPromise;
  img = new Image();
  img.crossOrigin = 'anonymous';
  img.src = imgUrls[imgIndex];
  img.onload = () => drawImage(img);
  loader.style.display='none';
  app.style.display='block';
};

const drawImage = (img) => {
  canvas.width = img.width + canvasOffset*2;
  canvas.height = img.height + canvasOffset*2;
  ctx.drawImage(img, canvasOffset, canvasOffset, img.width, img.height);
};

loadNewImage.onclick = () => {
  if(imgIndex < imgUrls.length - 1) {
    imgIndex += 1;
  } else {
    imgIndex = 0;
  }
  img.src = imgUrls[imgIndex];
  img.onload = () => drawImage(img);
  run.disabled = false;
};

run.onclick = async () => {
  const predictions = await model.detect(img);
  const formattedPredictions = formatPrediction(predictions);
 
  if (formattedPredictions === []) {
    console.log('no object recognised in this image');
    run.disabled = true;
    return;
  };
 
  for (let i = formattedPredictions.length - 1; i >= 0; i--) {
    drawResult(formattedPredictions[i]);
  }
  
  run.disabled = true;
};

const formatPrediction = (predictions) => {
  return predictions.map(prediction => {
    return {
      label: prediction.class,
      confidence: prediction.score,
      x: prediction.bbox[0],
      y: prediction.bbox[1],
      width: prediction.bbox[2],
      height: prediction.bbox[3]
    }
  });
};

const randomHSL = () => 
  `hsla(${~~(360 * Math.random())}, 100%, 40%, 1)`;

const drawResult = ({
  x, 
  y, 
  width, 
  height, 
  label, 
  confidence
}) => {
  const text = `${label} ${confidence > 0.75 ? '👍' : '🤔'}`;
  const colour = randomHSL();
  ctx.beginPath();
  ctx.font = '12px Arial';
  ctx.strokeStyle = colour;
  ctx.lineWidth = 2;
  ctx.strokeRect(x + canvasOffset, y + canvasOffset, width, height);
  ctx.fillStyle = colour;
  const textSize = ctx.measureText(text).width;
  ctx.rect(x + canvasOffset - 1, y + canvasOffset - 20, textSize + 12, 20);
  ctx.fill();
  ctx.fillStyle = 'white';
  ctx.fillText(text, x + canvasOffset + 5, y + canvasOffset - 5);
  ctx.closePath();
};