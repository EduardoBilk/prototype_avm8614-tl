let img;
let eye;
let squareSize;
let targetSize;
let isHovering = false;
let hoverStartTime;
let animationStartTime;
let others = {};
let isArtist = false;
let name;
let socket;
let aspectRatio;

const mesagesList = [];
const CONSTANTS = {
    MAX_ARTISTS_ALLOWED:1,
    SERVER_URL:'http://192.168.2.241:3000',
    HOVER_TIME_THRESHOLD: 2500,
    ANIMATION_DURATION: 2000 
}
const IMAGES = ['splitting_mata_clark.jpg'];
const randomImgIndex = Math.floor(Math.random() * IMAGES.length);

function preload() {
  img = loadImage(IMAGES[randomImgIndex]);
  eye = loadImage('noun-eye.svg');
  artistEye = loadImage('noun-eye-artist.svg');
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  aspectRatio = img.width / img.height;
  CONSTANTS.MAX_SQUARE_HEIGHT = windowHeight * 0.8;
  CONSTANTS.MIN_SQUARE_HEIGHT = windowHeight * 0.2;
  squareSize = CONSTANTS.MIN_SQUARE_HEIGHT;
  targetSize = squareSize;
  socket = io.connect(CONSTANTS.SERVER_URL);

  socket.on('update', (data) => {
    if (!data.id) {
      return;
    }
    others[data.id] = data;
    if (data.isArtist) {
      createResponseForm(data.id);
    }
  });

  socket.on('receiveMessage', (data) => {
   addMessage(data);
  });

  socket.on('clientDisconnected', (clientId) => {
    delete others[clientId];
    removeResponseForm(clientId);
  });

  loadState();
}

function draw() {
  background(249, 249, 249);
  imageMode(CENTER);

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
  let displayWidth, displayHeight;
  if (aspectRatio > 1) {
    displayWidth = squareSize;
    displayHeight = squareSize / aspectRatio;
  } else {
    displayWidth = squareSize * aspectRatio;
    displayHeight = squareSize;
  }
  image(img, width/2, height/2, displayWidth, displayHeight);
  for (let clientId in others) {
    const isOtherHovering = others[clientId].isHovering;
    let pos = others[clientId].position;
    if (isOtherHovering) {
      drawEye(others[clientId]);
    }else {
      drawCross(others[clientId]);
    }
    if (others[clientId].isArtist) {
      updateMessagesDisplay(clientId);
    }
  }
}

function drawCross(other) {
  const {x, y} = other.position;
  strokeWeight(3);
  if (other.isArtist) {
      stroke('#002fa6');
  } else {
      stroke(0);
  }
  line(x - 10, y, x + 10, y);
  line(x, y - 10, x, y + 10);
}

function drawEye(other) {
  const {x, y} = other.position;
  if (other.isArtist) {
    image(artistEye, x, y, 35, 35);
  }else {
    image(eye, x, y, 35, 35);
  }
}

function sendData() {
  socket.emit('update', { 
    id: socket.id,
    position: {
      x: mouseX, 
      y: mouseY 
    }, 
    name, 
    isHovering, 
    isArtist });
}

function loadState() {
  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);
  isArtist = urlParams.has('art_')
  if (isArtist) {
    name = urlParams.get('name') ||'Artist';
  } else {
    name = urlParams.get('name') || 'Annonymous';
  }
}

function sendMessage(id) {
  const message= document.getElementById(`messageInput_${id}`).value;
  if (!message) {
    return;
  }
  document.getElementById(`messageInput_${id}`).value = '';
  socket.emit('sendMessage', { id: socket.id, to: id, name, message });
  addMessage({ id: socket.id, to: id, name, message });
} 

function addMessage(data) {
  mesagesList.push(data);
  if (mesagesList.length > 6) {
    mesagesList.shift();
  }
  if (data.id === socket.id) {
    createResponseForm(data.to);
    updateMessagesDisplay(data.to);
  } else {
    createResponseForm(data.id);
    updateMessagesDisplay(data.id);
  }
}

function updateMessagesDisplay(id) {
  if (!document.getElementById(`messageForm_${id}`)) {
    return;
  }
  const messagesContainer = document.getElementById(`messages_${id}`);
  messagesContainer.innerHTML = '';
  const idMesagesList = mesagesList.filter(
    (message) => message.id === id || message.to === id
  );
  idMesagesList.forEach((message) => {
    const messageElement = document.createElement('div');
    messageElement.innerHTML = `<b>${message.name}</b>: ${message.message}`;
    messagesContainer.appendChild(messageElement);
  });
}

function createResponseForm(id) {
  if (!id) {
    return;
  }
  const formContainer = document.getElementById('formWrapper');

  if (document.getElementById(`messageForm_${id}`)) {
    return;
  }
  if (Object.values(others).filter((other) => other.isArtist).length > CONSTANTS.MAX_ARTISTS_ALLOWED ||
    id === socket.id) {
    return;
  }
  if (socket.id === id) {
    return;
  }
  const responseForm = document.createElement('form');
  responseForm.id = `messageForm_${id}`;
  responseForm.className = 'responseForm';
  responseForm.innerHTML = `
  <div>
    <p>${getResponseFormHeader(id)}</p>
    <div id="messages_${id}"></div>
  </div>
  `;
  const inputWrapper = document.createElement('div');
  inputWrapper.className = 'inputWrapper';

  const messageInput = createMessageInput(id);
  const sendMessageButton = createSendMessageButton(id);

  inputWrapper.appendChild(messageInput);
  inputWrapper.appendChild(sendMessageButton);

  responseForm.appendChild(inputWrapper);
  formContainer.appendChild(responseForm);
}

function createMessageInput(id) {
  const messageInput = document.createElement('input');
  messageInput.id = `messageInput_${id}`;
  messageInput.className = 'messageInput';
  messageInput.placeholder = 'Message';
  messageInput.addEventListener('keyup', function(e) {
    e.preventDefault();
    if (e.keyCode === 13) {
      sendMessage(id);
    }
  });
  return messageInput;
}

function createSendMessageButton(id) {
  const sendMessageButton = document.createElement('button');
  sendMessageButton.id = 'sendMessageButton';
  sendMessageButton.className = 'sendMessageButton';
  sendMessageButton.addEventListener('click', function(e) {
    e.preventDefault();
    sendMessage(id);
  });
  return sendMessageButton;
}
  
function removeResponseForm(id) {
  const formContainer = document.getElementById('formWrapper');
  const responseForm = document.getElementById(`messageForm_${id}`);
  if (!responseForm) {
    return;
  }
  formContainer.removeChild(responseForm);
}

function getResponseFormHeader(id) {
  const data = others[id];
  if (isArtist) {
    return `${data.name} t\'écrie une message:`;
  } else {
    return 'L\'artiste est entré dans la salle, dites bonjour.';
  }
}
