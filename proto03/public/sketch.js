let img;
let eye;
let squareSize;
let targetSize;
let isHovering = false;
let hoverStartTime;
let animationStartTime;
let others = {};
let isArtist = false;
let name = 'Annonymous'
let socket;
const CONSTANTS = {
    MAX_ARTISTS_ALLOWED:1,
    SERVER_URL:'http://192.168.2.241:3000',
    HOVER_TIME_THRESHOLD: 3000,
    ANIMATION_DURATION: 2000 
}
const IMAGES = ['cats_and_wine.png', 'south_christmas.png'];
const randomImgIndex = Math.floor(Math.random() * IMAGES.length);

function preload() {
  img = loadImage(IMAGES[randomImgIndex]);
  eye = loadImage('noun-eye-4498360.svg');
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  CONSTANTS.MAX_SQUARE_HEIGHT = windowHeight * 0.8;
  CONSTANTS.MIN_SQUARE_HEIGHT = windowHeight * 0.2;
  squareSize = CONSTANTS.MIN_SQUARE_HEIGHT;
  targetSize = squareSize;
  socket = io.connect(CONSTANTS.SERVER_URL);
  socket.on('update', (data) => {
    others[data.id] = data;
  });
  socket.on('clientDisconnected', (clientId) => {
    delete others[clientId];
  });
  loadState();
}

function draw() {
  background(249, 249, 249); // Nice orange pastel tone
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
  sendData();

  squareSize = lerp(squareSize, targetSize, 0.1); // Smooth transition
  image(img, width/2, height/2, squareSize, squareSize);
  for (let clientId in others) {
      const isOtherHovering = others[clientId].isHovering;
      let pos = others[clientId].position;
      if (isOtherHovering) {
          drawEye(pos.x, pos.y);
      }else {
          drawCross(pos.x, pos.y);
      }
  }
}

function drawCross(x, y) {
  strokeWeight(3);
  line(x - 10, y, x + 10, y);
  line(x, y - 10, x, y + 10);
}

function drawEye(x, y) {
  image(eye, x, y, 30, 30);
}

function sendData() {
  socket.emit('update', { id: socket.id, position: { x: mouseX, y: mouseY }, isHovering, isArtist });
}

function loadState() {
  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);
  isArtist = urlParams.has('art_')
  name = urlParams.get('name');
}

