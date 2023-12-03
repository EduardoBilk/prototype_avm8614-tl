const os = require('os');
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const networkInterfaces = os.networkInterfaces();
const port = 3000;

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
