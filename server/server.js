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

// var domain = 'https://onlinenard.com/';    // Truly domain
var domain = 'localhost:8081/';
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

// Generate a pseudo link to share with a friend
function ganerateSharePage(length) {
    let sharePage = '';
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
        let newChar = characters.charAt(Math.floor(Math.random() * charactersLength));
        sharePage += newChar;
    }
    return sharePage;
};

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
function removeFromWaitingFriends(playerId) {
    // Object.entries(waitingFriends).forEach((item) => { console.log(item)    });
    Object.entries(waitingFriends).forEach(([sharePage, friends]) => {
        if (friends.inviter.player.id === playerId) {
            delete waitingFriends[sharePage];
            return;
        }; 
    });
};

// Get a cookie value by it's name
function getCook(cookies, cookiename) {
    cookies = cookies.split('; ');
    for (cook of cookies) {
        [name, value] = cook.split('=');
        if (name === cookiename) {
            return value;
        };
    };
    return;
};


// function SharePage(url, cookie, value) {
//     return function(req, res, next) {
//       if (req.url == url) {
//         res.cookie(cookie, value);
//       }
//       next();
//     }
//   }
// app.use(attach_cookie('/index.html', 'mycookie', 'value'));


// const cookieParser = require('cookie-parser');
// var session = require('cookie-session')({ secret: 'secret' });

// app.use(cookieParser);
// app.use(session);











// const cookieParser = require('cookie-parser');
// app.use(cookieParser());




// Set a cookie in order to identify a user
// app.use(function (req, res, next) { 
//     console.log('09341ubg3r9ugb34!!!!');
//     // check if client sent cookie
//     if (req.cookies === undefined || req.cookies.cookieName === undefined) {
//       tabId = uuid.v5(
//             uuid.v1(Date.now()),
//             uuid.v4()
//         );
//       res.cookie('tabId', tabId, { maxAge: 900000, httpOnly: false });
//       console.log('cookie created successfully', tabId);
//     } else {
//       // yes, cookie was already present 
//       console.log('cookie exists', cookie);
//     } 
//     next(); // <-- important!
//   });





//   app.get('/', (req,res)=>{
//     console.log('09341ubg3r9ugb34!!!!');
//     // read cookies
//     console.log(req.cookies) 

//     let options = {
//         maxAge: 1000 * 60 * 15, // would expire after 15 minutes
//         httpOnly: true, // The cookie only accessible by the web server
//         signed: true // Indicates if the cookie should be signed
//     }

//     // Set cookie
//     res.cookie('cookieName', 'cookieValue', options) // options is optional
//     res.send('')

// });








// app.get('/', (req,res)=>{
//     console.log('09341ubg3r9ugb34!!!!');
//     // read cookies
//     console.log(req.cookies) 

//     let options = {
//         maxAge: 1000 * 60 * 15, // would expire after 15 minutes
//         httpOnly: true, // The cookie only accessible by the web server
//         signed: true // Indicates if the cookie should be signed
//     }

//     // Set cookie
//     res.cookie('cookieName', 'cookieValue', options) // options is optional
//     res.send('')

// });







const server = http.createServer(app);


const io = socketio(server);

// Match two players that are on site but do not play yet





// Trying to get session for a socket





// var sessionStore = new express.session.MemoryStore();
// var SessionSockets = require('session.socket.io');
// const cookieParser = require('cookie-parser');
// app.use(cookieParser());
// app.use(express.session({store: sessionStore, secret: "mysecret"}));
// sessionSockets = new SessionSockets(io, sessionStore, cookieParser);
// sessionSockets.on('connection', function (err, socket, session) {
//     console.log(session);
// });



// var Session = require('express-session'),
//     // SessionStore = require('session-file-store')(Session);
//     session = Session({
//     //   store: new SessionStore({ path: './tmp/sessions' }),
//       secret: 'pass',
//       resave: true,
//       saveUninitialized: true
//     });
// io.use(function(socket, next) {
//     // console.log(socket);
//   session(socket.handshake, {}, next);
// });




// io.sockets.on('connection', function (socket) {
//     let userId = socket.handshake;    
//     console.log(userId);
// });





// SESSION WORKS FOR BROWSER, NOT FOR TABS
// var session = require("express-session")({
//     secret: "my-secret",
//     resave: true,
//     saveUninitialized: true
// });
// var sharedsession = require("express-socket.io-session");
// app.use(session);
// io.use(sharedsession(session, {
//     autoSave:true
// })); 




app.use(express.static(clientPath));
// io.on('reconnect', (socket) => {
//     console.log('reconnected');
// });


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
                if (gm.p1.player.id === player.id) {
                    console.log('p1! The game is found!');
                    // inherit all the player instance from previous socket
                    socket.player = gm.p1.player;
                    gm.p1 = socket;    // replace a player with a new one with another socket
                    gm.placeInTheGame(socket);
                } else if (gm.p2.player.id === player.id) {
                    console.log('p2! The room is found');
                    // inherit all the player instance from previous socket
                    socket.player = gm.p2.player;
                    gm.p2 = socket;    // replace a player with a new one with another socket
                    gm.placeInTheGame(socket);
                };
            });
            // If the socket is in a waitingRandom we hide a play button, show 'await'
            if (waitingRandom[player.game] && waitingRandom[player.game].player.id === player.id) {
                socket.emit('pressPlayButton');
            };
            // If socket is in waitingFriends - remove it from here
            removeFromWaitingFriends(playerId)
        };

        // Player changes a game type: nard / backgammon
        socket.on('changeGame', (prevGame, currGame) => {
            player.game = currGame;
            console.log(`${player.id} wants to play ${player.game} with ${player.rival}`);
            removeFromWaitingRandom(socket, prevGame)
        });

        // Player changes a rival type: random / friend
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
        let sharePage = getCook(socket.request.headers.cookie, 'sharePage');
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

        // Generate friend's link
        socket.on('generateFriendsLink', () => {
            var sharePage = ganerateSharePage(8);
            socket.emit('setFriendsLink', domain + sharePage);
            // Add the socket to the waitingFriends
            waitingFriends[sharePage] = {
                inviter: socket,
                invitee: null,
            };
            // Redirect an invetee to the main page
            app.get(`/${sharePage}`, function(req, res, next) {
                res.cookie('sharePage', sharePage, { expires: false, httpOnly: false });
                res.redirect('/');
            });
        });

        // Start the game with a friend



        // // Remove both friends' sockets from the waitingFriends
        // removeFromWaitingFriends(socket);



        // MATCH FRIENDS AND PLACE THEM IN THE GAME !!!













        // Chat
        // socket.on('hint', (text) => {             // RECIEVE
        //     console.log('Someone send this: ', text);
        //     io.emit('hint', text);                       // SEND TO ALL
        // });






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

    // console.log(socket.player);




    
    // console.log(io.sockets.clients());




    // console.log(socket.handshake.session);
    
    // console.log('0000', socket.handshake.headers.cookie);
    // console.log('0000', socket.handshake.session);




    // SESSION WORKS FOR BROWSER, NOT FOR TABS
    // if (socket.handshake.session.userdata === undefined) {
    //     socket.handshake.session.userdata = uuid.v5(
    //         uuid.v1(Date.now()),
    //         uuid.v4()
    //     );
    //     socket.handshake.session.save();
    // };





    // console.log('0000', session);
    // console.log('1111', socket.handshake.session.userdata);
    
    










    
















    // socket.emit('hint', 'Hi, you are connected');    // SEND TO SINGLE CLIENT
    
    


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
