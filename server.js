const os = require('os');
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const networkInterfaces = os.networkInterfaces();
const port = 3000;

const app = express();
const server = http.createServer(app);
app.use(express.static('public'));
const io = socketIo(server, {
    cors: {
    origin: '*',
  }
});

io.on('connection', (socket) => {
  let artistId = null;
  console.log('New client connected');

  socket.on('update', (data) => {
    if (data.isArtist) {
      console.log('Artist connected', socket.id);
      artistId = socket.id;
    }
    socket.broadcast.emit('update', data);
  });

  socket.on('sendMessage', (message) => {
    console.log('Message:', message);
    console.log('Artist:', artistId);
    socket.to(artistId).emit('receiveMessage', message);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected');
    io.emit('clientDisconnected', socket.id);
  });
});

server.listen(port, () => {
  console.log(`Listening on http://${getIP()}:${port}`);
});

function getIP () {
    let ip = 0
    for (const interface in networkInterfaces) {
        networkInterfaces[interface].forEach((details) => {
            if (details.family === 'IPv4' && !details.internal) {
                ip = details.address;
            }
        });
    }
    return ip;
}
