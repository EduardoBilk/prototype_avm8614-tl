const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
app.use(express.static('public'));
const io = socketIo(server);

io.on('connection', (socket) => {
  console.log('New client connected');

  socket.on('update', (data) => {
    socket.broadcast.emit('update', data);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected');
    io.emit('clientDisconnected', socket.id);
  });
});

server.listen(3000, () => {
  console.log('Listening on port 3000');
});

