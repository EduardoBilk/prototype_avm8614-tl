const os = require('os');
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const networkInterfaces = os.networkInterfaces();
const port = 3000;

let artistId = null;

const app = express();
const server = http.createServer(app);
app.use(express.static('public'));
const io = socketIo(server, {
    cors: {
    origin: '*',
  }
});

io.on('connection', (socket) => {
  console.info('New client connected: ', socket.id);

  socket.on('update', (data) => {
    if (data.isArtist) {
      artistId = data.id;
    }
    socket.broadcast.emit('update', data);
  });

  socket.on('sendMessage', (data) => {
    socket.to(data.to).emit('receiveMessage', data);
  });

  socket.on('disconnect', () => {
    console.info('Client disconnected', socket.id);
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
