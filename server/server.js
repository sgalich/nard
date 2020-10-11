const http = require('http');
const express = require('express');
const socketio = require('socket.io');


const Nard = require('./nard');

const uuid = require('uuid');

// const randomColor = require('randomcolor');
// const createBoard = require('./create-board');
// const createCooldown = require('./create-cooldown');

const app = express();
const clientPath = `${__dirname}/../public_html`;
console.log(`serving static from ${clientPath}`);

var domain = 'https://onlinenard.com/';    // Truly domain
// var domain = 'localhost:8081';
// var domain = clientPath;
 

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
    return domain + sharePage;
};

// Redirect to the page with the game
var sharePage = ganerateSharePage(8);
app.get(`/${sharePage}`, function(req, res){
    console.log('Redirected');
    res.redirect('/');
});






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
var game;
var rooms = {};
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


var players = {}
var rooms = []
let waitingPlayer = null;

app.use(express.static(clientPath));
io.on('reconnect', (socket) => {
    console.log('reconnected');
});


io.on('connection', (socket) => {
    // socket.player = null;



    // ?????
    // New socket with an old player.id => WHAT SHOULD WE DO ???
    // ?????


    // Identify a client as a player
    // Get tabId as in user ID as soon as this user connected
    // Or set it manually if it is a new user without tabId yet
    socket.on('connected', (player) => {
        socket.player = player;

        // If there is not player.id, so it is a new user
        // We need to set a new tabId in his session storage
        if (player.id === null) {
            player.id = setNewPlayerId(socket);
        };

        // Player changes a game type: nard / backgammon
        socket.on('changeGame', (game) => {
            player.game = game;
            console.log(`${player.id} wants to play ${player.game} with ${player.rival}`);
            
            // AND BLOCK A RIVAL FINDING ALGORITHM

        });

        // Player changes a rival type: random / friend
        socket.on('changeRival', (rival) => {
            player.rival = rival;
            console.log(`${player.id} wants to play ${player.game} with ${player.rival}`);
            
            // AND BLOCK A RIVAL FINDING ALGORITHM

        });






        // Start the game with a random rival
        socket.on('play', () => {
            console.log('play', player.id);
            console.log(socket);







                // START A GAME WITH THE FIRST PEER
            if (waitingPlayer) {
                // start a game
                // [socket, waitingPlayer].forEach((player) => {player.emit('hint', 'Game is starting.')});
                socket.emit('hint', 'GAme starts');
                waitingPlayer.emit('hint', 'Game starts');
                game = new Nard(waitingPlayer, socket);
                waitingPlayer = null;
            } else {
                waitingPlayer = socket;
                waitingPlayer.emit('hint', 'Waiting for a rival...');
            };


        });














        console.log(`${player.id} wants to play ${player.game} with ${player.rival}`);

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
    
    










    



    // START A GAME WITH THE FIRST PEER
    if (waitingPlayer) {
        // start a game
        // [socket, waitingPlayer].forEach((player) => {player.emit('hint', 'Game is starting.')});
        socket.emit('hint', 'GAme starts');
        waitingPlayer.emit('hint', 'Game starts');
        game = new Nard(waitingPlayer, socket);
        waitingPlayer = null;
    } else {
        waitingPlayer = socket;
        waitingPlayer.emit('hint', 'Waiting for a rival...');
    };







    // Generate friend's link
    socket.on('generateFriendsLink', () => {
        var sharePage = ganerateSharePage(8);
        socket.emit('setFriendsLink', sharePage);
    });




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
