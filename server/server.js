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
console.log(sharePage);
app.get(`/${sharePage}`, function(req, res){
    console.log('YES !!!!!!!1');
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





app.use(express.static(clientPath));








// const cookieParser = require('cookie-parser');
// app.use(cookieParser());


// // RETURN EMPTY PAGE
// app.get('/', function (req, res) {
//     res.cookie('myCookie', 'looks good');
//     // var cookies = parseCookies(req);
//     console.log('cook OK');
//     res.end('HI! HUJ BLYAD');
//     // return res.sendFile(clientPath);
//     // next();
// });
// app.use(express.static(clientPath));




// set a cookie
// app.use(function (req, res, next) {
    
    
//     console.log('09341ubg3r9ugb34!!!!');



//     // check if client sent cookie
//     var cookie = req.cookies.cookieName;
//     if (cookie === undefined) {
//       // no: set a new cookie
//       var randomNumber=Math.random().toString();
//       randomNumber=randomNumber.substring(2,randomNumber.length);
//       res.cookie('cookieName',randomNumber, { maxAge: 900000, httpOnly: true });
//       console.log('cookie created successfully');
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

// Match two players that are on site but do not play yet
let waitingPlayer = null;
io.on('connection', (socket) => {
    



    
    // let static middleware do its job
    app.use(express.static(clientPath));
    // console.log(socket.client.conn.id);
    // console.log(socket.username);



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





    // Generate a new tabId
    socket.on('newTabId', () => {
        let tabId = uuid.v5(
            uuid.v1(Date.now()),
            uuid.v4()
        );
        socket.emit('setTabId', tabId);
    });

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
