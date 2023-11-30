let img;
let squareSize;
let targetSize;
let isHovering = false;
let hoverStartTime;
let animationStartTime;
const animationDuration = 2000; // 2 seconds

function preload() {
  img = loadImage('cats_and_wine.png'); // Load the image
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  squareSize = windowHeight * 0.2;
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
    } else if (millis() - hoverStartTime > 3000) { // 3 seconds
      targetSize = windowHeight * 0.8;
    }
  } else {
    if (isHovering) {
      isHovering = false;
      animationStartTime = millis();
    }
    if (millis() - animationStartTime < animationDuration) {
      let progress = (millis() - animationStartTime) / animationDuration;
      targetSize = lerp(windowHeight * 0.8, windowHeight * 0.2, progress);
    } else {
      targetSize = windowHeight * 0.2;
    }
  }

  squareSize = lerp(squareSize, targetSize, 0.1); // Smooth transition
  image(img, width/2, height/2, squareSize, squareSize);
}
