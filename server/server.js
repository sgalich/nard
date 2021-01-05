// TODO: LOW: Add a database support (https://sequelize.org/master/)
// TODO: LOW: Add a chat (https://www.rabbitmq.com)


const http = require('http');
const express = require('express');
const socketio = require('socket.io');


const Nard = require('./nard');

const uuid = require('uuid');
const { Console } = require('console');
var cookie = require("cookies");

// const randomColor = require('randomcolor');
// const createBoard = require('./create-board');
// const createCooldown = require('./create-cooldown');

const app = express();
const clientPath = `${__dirname}/../public_html`;
console.log(`serving static from ${clientPath}`);
const server = http.createServer(app);
const io = socketio(server);

// var domain = 'https://onlinenard.com/';    // Truly domain
var domain = 'localhost:3000/';
// var domain = clientPath;
 
// rooms = {
//     nard: [Game(socket1, socket2), Game(socket1, socket2), ...],
//     backgammon: [Game(socket1, socket2), Game(socket1, socket2), ...]
// }
var rooms = {
    nard: [],
    backgammon: []
}

// waitingRandom = {
//     nard: socket,
//     backgammon: socket
// };
var waitingRandom = {
    nard: null,
    backgammon: null
};

// waitingFriends = {
//     'LWCqJTyv': {
//          inviter: socket,
//          invitee: null
//      },
//     'XUZFdcGH': {
//          inviter: socket,
//          invitee: null
//      },
//     ...
// };
var waitingFriends = {};


// UTILS FUNCTIONS
        
// Generate a new tabId
function setNewPlayerId(socket) {
    let tabId = uuid.v5(
        uuid.v1(Date.now()),
        uuid.v4()
    );
    socket.emit('setTabId', tabId);
    return tabId;
};

// // Generate a pseudo link to share with a friend
// function ganerateSharePage(length) {
//     let sharePage = '';
//     var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
//     var charactersLength = characters.length;
//     for (var i = 0; i < length; i++) {
//         let newChar = characters.charAt(Math.floor(Math.random() * charactersLength));
//         sharePage += newChar;
//     }
//     return sharePage;
// };

// Remove the socket from the previous room
function removeFromWaitingRandom(socket, game=null) {
    game = (game) ? game : socket.player.game;
    if (
        waitingRandom[game]
        && waitingRandom[game].player.id === socket.player.id
    ) {
        waitingRandom[game] = null;
    };
};

// Remove the entry from waitingFriends by sharePage
function removeFromWaitingFriends(sharePage) {
    delete waitingFriends[sharePage];
};

// Remove the entry from waitingFriends by Socket
function removeFromWaitingFriendsBySocket(playerId) {
    // Object.entries(waitingFriends).forEach((item) => { console.log(item)    });
    Object.entries(waitingFriends).forEach(([sharePage, friends]) => {
        if (friends.inviter.player.id === playerId) {
            delete waitingFriends[sharePage];
            return;
        }; 
    });
};

// Get a cookie value by it's name
function getCookVal(cookies, cookiename) {
    if (typeof cookies !== String) { return };
    cookies = cookies.split('; ');
    for (cook of cookies) {
        [name, value] = cook.split('=');
        if (name === cookiename) {
            return value;
        };
    };
    return;
};

// Find a game for the socket
function findAGameForSocket(player) {
    for (game of rooms[player.game]) {
        if (player.id === game.players[0].player.id || player.id === game.players[1].player.id) {
        return game;
        };
    };
    return;
};

app.use(express.static(clientPath));

io.on('reconnect', (socket) => {
    console.log('reconnected');
});

io.on('connection', (socket) => {

    // Identify a client as a player
    // Get tabId as in user ID as soon as this user connected
    // Or set it manually if it is a new user without tabId yet
    socket.on('connected', (player) => {
        socket.player = player;

        // 1. Identify a user
        // If there is not player.id, so it is a new user
        // We need to set a new tabId in his session storage
        if (socket.player.id === null) {
            socket.player.id = setNewPlayerId(socket);
        } else {
            // If a known user returns we put him back to his game if it exists
            // Find a room for this player where he is from
            console.log('WELCOME BACK TO: ', player.id);
            rooms[player.game].forEach((gm) => {
                if (gm.players[0].player.id === player.id) {
                    console.log('p0! The game is found!');
                    // inherit all the player instance from previous socket
                    socket.player = gm.players[0].player;
                    gm.players[0] = socket;    // replace a player with a new one with another socket
                    gm.placeInTheGame(0);
                } else if (gm.players[1].player.id === player.id) {
                    console.log('p1! The room is found');
                    // inherit all the player instance from previous socket
                    socket.player = gm.players[1].player;
                    gm.players[1] = socket;    // replace a player with a new one with another socket
                    gm.placeInTheGame(1);
                };
            });
            // If the socket is in a waitingRandom we hide a play button, show 'await'
            if (waitingRandom[player.game] && waitingRandom[player.game].player.id === player.id) {
                socket.emit('pressPlayButton');
            };
            // If socket is in waitingFriends - remove it from here
            removeFromWaitingFriendsBySocket(player.id);
        };

        // Player changes a game type: nard / backgammon
        // TODO: Deprecate it!
        socket.on('changeGame', (prevGame, currGame) => {
            player.game = currGame;
            console.log(`${player.id} wants to play ${player.game} with ${player.rival}`);
            removeFromWaitingRandom(socket, prevGame);
        });

        // Set redirection preferences for the generated share link
        socket.on('sharePageGenerated', (sharePage) => {
            // Add the socket to the waitingFriends
            waitingFriends[sharePage] = {
                inviter: socket,
                invitee: null,
            };
            // Redirect an invetee to the main page
            app.get(`/${sharePage}`, function(req, res, next) {
                res.cookie('sharePage', sharePage, { expires: false, httpOnly: false });
                res.redirect('/');    // TODO: Remove blinking start-modal window
            });
        });
        // Generate friend's link

        // socket.on('generateFriendsLink', () => {
        //     var sharePage = ganerateSharePage(8);
        //     socket.emit('setFriendsLink', domain + sharePage);
        //     // Add the socket to the waitingFriends
        //     waitingFriends[sharePage] = {
        //         inviter: socket,
        //         invitee: null,
        //     };
        //     // Redirect an invetee to the main page
        //     app.get(`/${sharePage}`, function(req, res, next) {
        //         res.cookie('sharePage', sharePage, { expires: false, httpOnly: false });
        //         res.redirect('/');    // TODO: Remove blinking start-modal window
        //     });
        // });
        
        // Player changes a rival type: random / friend
        // TODO: Deprecate it!
        socket.on('changeRival', (rival) => {
            socket.player.rival = rival;
            console.log(`${player.id} wants to play ${player.game} with ${player.rival}`);
            if (socket.player.rival === 'friend') {
                removeFromWaitingRandom(socket);
            } else if (socket.player.rival === 'random') {
                // Remove the socket from the waitingFriends
                removeFromWaitingFriends(socket.player.sharePage);
            };
        });

        // Start the game with a random rival
        socket.on('play', () => {
            console.log('play', player.id);
            let waitingRival = waitingRandom[player.game];
            if (waitingRival && waitingRival.player.id !== socket.player.id) {
                console.log('game starts');
                rooms[player.game].push(new Nard(waitingRival, socket));
                waitingRandom[player.game] = null;     
            } else {
                waitingRandom[player.game] = socket;
            };
        });

        // Start the game with a friend. Socket = invitee
        // I cannot access sharePage inside the socket,
        // So I wrote it as a cookie and now I'm gonna check this cookie
        // After matching the friends we need to clear this cookie
        let sharePage = getCookVal(socket.request.headers.cookie, 'sharePage');
        let inviter = waitingFriends[sharePage];
        // Check for inviter existing in order not to clear that cookie
        if (sharePage && inviter) {
            rooms[player.game].push(
                new Nard(
                    waitingFriends[sharePage].inviter,
                    socket,
                    waitingFriends[sharePage].inviter.player.game
                )
            );
            delete waitingFriends[sharePage];
            removeFromWaitingFriends(sharePage);
            console.log(`Successfully matched two friends from link ${sharePage}`);
        };
        if (waitingFriends[sharePage]) { console.log('FAILED TO MATCH FRIENDS !!!') };




        // Chat
        // socket.on('hint', (text) => {             // RECIEVE
        //     console.log('Someone send this: ', text);
        //     io.emit('hint', text);                       // SEND TO ALL
        // });




        ////////////////////////////////////////////////////////
        // THE GAME
        socket.on('moveIsDone', (moves, board) => {
            let game = findAGameForSocket(socket.player);
            game.board = board;
            
            
            console.log('moves[0].steps', moves[0].steps);
            
            
            game.moves = moves;
            game.makeTurn();
        });
        ////////////////////////////////////////////////////////



        // User is disconnected - remove the user from waitingRandom and from rooms (?)
        socket.on('disconnect', function() {
            // Remove disconnected socket from the waitingRandom
            if (waitingRandom[player.game] && waitingRandom[player.game].player.id === player.id) {
                waitingRandom[player.game] = null;
            };
            // Remove disconnected socket from all of his rooms after ??? time of disconnection
            // Or do what?
            // Show the rival info about his rival's disconnection and show him time.
            // ???
            // Send to his opponent a message about their rival disconnection
            // ...
        });
    });
});

server.on('error', (err) => {
  console.error('Server error:', err);
});

server.listen(3000, () => {
  console.log('server started on 3000');
});