const http = require('http');
const express = require('express');
const socketio = require('socket.io');

const app = express();

const clientPath = `${__dirname}/../client`;
console.log(`clientPath: ${clientPath}`);

app.use(express.static(clientPath));



const server = http.createServer(app);

const io = socketio(server);

io.on('connection', (sock) => {
    console.log('Someone connected');
    sock.emit('message', 'Hi, you are connected');
});

server.on('error', (err) => {
    console.error('Server error:', err);
});

server.listen(8080, () => {
    console.log('Started on 8080');
});