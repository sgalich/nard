const http = require('http');
const express = require('express');
const socketio = require('socket.io');
const Nard = require('./nard');
const uuid = require('uuid');
const { Console } = require('console');
var cookie = require("cookies");
const app = express();
const clientPath = `${__dirname}/../public_html`;
console.log(`serving static from ${clientPath}`);
const server = http.createServer(app);
const io = socketio(server);

var PORT = 443;
var domain = 'https://onlinenard.com/';    // Truly domain
//var domain = `http://localhost:${PORT}/`;

// rooms = {
//     nard: [Game(socket1, socket2), Game(socket1, socket2), ...],
//     backgammon: [Game(socket1, socket2), Game(socket1, socket2), ...]
// }
var rooms = {
    nard: [],
    backgammon: []
}
var waitingRandom;    // a socket, that is awaiting for a rival

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
    // if (typeof cookies !== "string") {return};    // why not String ??!
    if (!cookies) return;
    for (cook of cookies.split('; ')) {
        [name, value] = cook.split('=');
        if (name === cookiename) return value;
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
            // If socket is in waitingFriends - remove it from here
            removeFromWaitingFriendsBySocket(player.id);
        };

        // Player changes a rival type to a random
        socket.on('rival_random', () => {
            // socket.player.rival = rival;
            console.log(`${player.id} wants to play ${player.game} with ${player.rival}`);
            // Remove the socket from the waitingFriends
            removeFromWaitingFriends(socket.player.sharePage);
        });

        // Start the game with a random rival
        socket.on('play', () => {
            console.log('play', player.id);
            if (waitingRandom && waitingRandom.player.id !== socket.player.id) {
                console.log('game starts');
                rooms[player.game].push(new Nard(waitingRandom, socket));
                waitingRandom = null;     
            } else {
                waitingRandom = socket;
            };
        });

        // Set redirection preferences for the generated share link
        socket.on('rival_friend', (sharePage) => {
            // Clean waitingRandom if it is the socket
            if (waitingRandom && waitingRandom.player.id === player.id) {
                waitingRandom = null;
            };
            // Add the socket to the waitingFriends
            waitingFriends[sharePage] = {
                inviter: socket,
                invitee: null,
            };
            // Redirect an invetee to the main page
            app.get(`/${sharePage}`, function(req, res, next) {
                res.cookie('sharePage', sharePage, {expires: false, httpOnly: false});
                res.redirect('/');
            });
        });

        // Start the game with a friend. Socket = invitee
        // I cannot access sharePage inside the socket,
        // So I wrote it as a cookie and now I'm gonna check this cookie
        // After matching the friends we need to clear this cookie
        let sharePage = getCookVal(socket.request.headers.cookie, 'sharePage');
        let inviter = waitingFriends[sharePage];

        console.log('sharePage', sharePage);
        console.log('socket.request.headers.cookie', socket.request.headers.cookie);
        // console.log('waitingFriends', waitingFriends);

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

        ////////////////////////////////////////////////////////
        // THE GAME
        socket.on('moveIsDone', (moves, board) => {
            let game = findAGameForSocket(socket.player);
            game.board = board;
            game.moves = moves;
            game.makeTurn();
        });
        ////////////////////////////////////////////////////////

        // User is disconnected - remove the user from waitingRandom and from rooms (?)
        socket.on('disconnect', function() {
            // Remove disconnected socket from the waitingRandom
            if (waitingRandom && waitingRandom.player.id === player.id) {
                waitingRandom = null;
            };
            // Remove disconnected socket from all of his rooms after ??? time of disconnection
            // Or do what?
            // Show the rival info about his rival's disconnection and show him time.
            // ???
            // Send to his opponent a message about their rival disconnection
            // ...
        });

        socket.on('tryingToMakeAStep', (allowedSteps, idFrom, idTo) => {
            console.log('allowedSteps', allowedSteps);
            console.log('idFrom', idFrom);
            console.log('idTo', idTo);
        });

        socket.on('allowedFieldsFromIdTo', (allowedFieldsFromIdTo) => {
            console.log('allowedFieldsFromIdTo', allowedFieldsFromIdTo);
        })


    });
});

server.on('error', (err) => {
    console.error('Server error:', err);
});

server.listen(PORT, () => {
    console.log(`server started on ${domain}`);
});
