let img;
let squareSize;
let targetSize;
let isHovering = false;
let hoverStartTime;
let animationStartTime;
const CONSTANTS = {}
const IMAGES = ['cats_and_wine.png', 'south_christmas.png'];
const randomImgIndex = Math.floor(Math.random() * IMAGES.length);

function preload() {
  img = loadImage(IMAGES[randomImgIndex]);
}

function setup() {
  createCanvas(windowWidth, windowHeight);

  CONSTANTS.MAX_SQUARE_HEIGHT = windowHeight * 0.8;
  CONSTANTS.MIN_SQUARE_HEIGHT = windowHeight * 0.2;
  CONSTANTS.HOVER_TIME_THRESHOLD = 3000;
  CONSTANTS.ANIMATION_DURATION = 2000; 
  squareSize = CONSTANTS.MIN_SQUARE_HEIGHT;
  targetSize = squareSize;
}

function draw() {
  background('#FFD1B9'); // Nice orange pastel tone
  imageMode(CENTER);

  // Check for mouse hover
  if (mouseX > width/2 - squareSize/2 && mouseX < width/2 + squareSize/2 &&
      mouseY > height/2 - squareSize/2 && mouseY < height/2 + squareSize/2) {
    if (!isHovering) {
      isHovering = true;
      hoverStartTime = millis();
    } else if (millis() - hoverStartTime > CONSTANTS.HOVER_TIME_THRESHOLD) { 
      targetSize = windowHeight * 0.8;
    }
  } else {
    if (isHovering) {
      isHovering = false;
      animationStartTime = millis();
    }
    if (millis() - animationStartTime < CONSTANTS.ANIMATION_DURATION) {
      let progress = (millis() - animationStartTime) / CONSTANTS.ANIMATION_DURATION;
      targetSize = lerp(targetSize, CONSTANTS.MIN_SQUARE_HEIGHT, progress);
    } else {
      targetSize = CONSTANTS.MIN_SQUARE_HEIGHT;
    }
  }

  squareSize = lerp(squareSize, targetSize, 0.1); // Smooth transition
  image(img, width/2, height/2, squareSize, squareSize);
}
