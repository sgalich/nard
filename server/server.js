const http = require('http');
const express = require('express');
const socketio = require('socket.io');


const Nard = require('./nard');


// const randomColor = require('randomcolor');
// const createBoard = require('./create-board');
// const createCooldown = require('./create-cooldown');

const app = express();
const clientPath = `${__dirname}/../public_html`;
console.log(`serving static from ${clientPath}`);
app.use(express.static(clientPath));


const server = http.createServer(app);


const io = socketio(server);


var game;

// Match two players that are on site but do not play yet
let waitingPlayer = null;
io.on('connection', (socket) => {
    if (waitingPlayer) {
        // start a game
        // [socket, waitingPlayer].forEach((player) => {player.emit('hint', 'Game is starting.')});
        socket.emit('hint', 'GAme starts');
        waitingPlayer.emit('hint', 'Game starts');
        game =new Nard(waitingPlayer, socket);
        waitingPlayer = null;
    } else {
        waitingPlayer = socket;
        waitingPlayer.emit('hint', 'Waiting for a rival...');
    };







    // socket.emit('hint', 'Hi, you are connected');    // SEND TO SINGLE CLIENT
    
    
    // Chat
    socket.on('hint', (text) => {             // RECIEVE
        console.log('Someone send this: ', text);
        io.emit('hint', text);                       // SEND TO ALL
    });

    // Roll dice
    socket.on('roll_dice', (socket) => {
        game.rollDice();
        // io.emit('dice_rolled', rollDice());
    });

});







// socket.on('message', 'Hi, you are connected');
//   const color = randomColor();

//   // increase number to have cooldown between turns
//   const cooldown = createCooldown(10);

//   const onTurn = ({ x, y }) => {
//     if (cooldown()) {
//       io.emit('turn', { x, y, color });
//       const playerWin = makeTurn(x, y, color);

//       if (playerWin) {
//         sock.emit('message', 'YOU WIN');
//         io.emit('message', 'new round');
//         clear();
//         io.emit('board');
//       }
//     }
//   };

//   // Disabled, until the client side is injection-proof
//     sock.on('message', (text) => io.emit('message', text));
//   sock.on('turn', onTurn);

//   sock.emit('board', getBoard());





server.on('error', (err) => {
  console.error('Server error:', err);
});

server.listen(8081, () => {
  console.log('server started on 8081');
});
