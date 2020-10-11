const socket = io();
var game = 'nard';
var rival = 'random';
var wait = false;

// START SCREEN

// Show play / await / link
// for PLAY button / await a random rival / friend's link
function showInStartFooter(el) {
    if (el === 'play') {
        document.getElementById('start-play-btn').classList.add('show');
        document.getElementById('start-await-random-rival').classList.remove('show');
        document.getElementById('start-play-link').classList.remove('show');
    } else if (el === 'await') {
        document.getElementById('start-await-random-rival').classList.add('show');
        document.getElementById('start-play-btn').classList.remove('show');
        document.getElementById('start-play-link').classList.remove('show');
    } else if (el === 'link') {
        document.getElementById('start-play-link').classList.add('show');
        document.getElementById('start-await-random-rival').classList.remove('show');
        document.getElementById('start-play-btn').classList.remove('show');
    };
};

// Game - nard
function gameIsNard() {
    game = 'nard';
    socket.emit('changeGame', game);
    // Highlight
    document.getElementById('game-backgammon').classList.remove('selected');
    document.getElementById('game-nard').classList.add('selected');
    wait = false;
    if (rival === 'random') {
        showInStartFooter('play');    // show play button again
    };
};

// Game - backgammon
function gameIsBackgammon() {
    game = 'backgammon';
    socket.emit('changeGame', game);
    // Highlight
    document.getElementById('game-nard').classList.remove('selected');
    document.getElementById('game-backgammon').classList.add('selected');
    wait = false;
    if (rival === 'random') {
        showInStartFooter('play');    // show play button again
    };
};

// Rival - a friend
function rivalIsFriend() {
    // Do nothing if the button is already active
    let friendButton = document.getElementById('rival-friend');
    if (friendButton.classList.contains('selected')) {
        return;
    };
    rival = 'friend';
    socket.emit('changeRival', rival);
    document.getElementById('rival-random').classList.remove('selected');
    friendButton.classList.add('selected');
    socket.emit('generateFriendsLink');    // Generate a friend's link
    showInStartFooter('link');
    wait = true;
};

// Rival - a rival guy
function rivalIsRandom() {
    // Do nothing if the button is already active
    let randomButton = document.getElementById('rival-random');
    if (randomButton.classList.contains('selected')) {
        return;
    };
    rival = 'random';
    socket.emit('changeRival', rival);
    document.getElementById('rival-friend').classList.remove('selected');
    randomButton.classList.add('selected');
    showInStartFooter('play');
};

// PLAY button is clicked
function pressPlayButton() {
    showInStartFooter('await');
    socket.emit('play');
    wait = true;
};

// Copy friend's link to clipboard by clicking the copy-icon
document.getElementById('copy-icon')
    .addEventListener('mousedown', function() {
        let friendsLink = document.getElementById('start-friends-link');
        friendsLink.focus();
        friendsLink.select();
        try {
            document.execCommand('copy');
        } catch (err) {
            console.error('Failed to copy by the copy-icon', err);
    };
});

// Hide a start modal
function hideStartModal() {
    document.getElementById('start-wrapper').classList.add('hide');
};


// BOARD SCREEN

// Place one checker at certain field by id
function createChecker(id, color) {
    let field = document.getElementById(id);
    let checker = document.createElement('checker');   // Create a checker
    checker.setAttribute('draggable', 'true');    // make it draggable
    // checker.setAttribute('class', 'unselected');    // make it selectable
    checker.classList.add('unselected');
    // checker.classList.add('hvr-grow');    // hvr-ripple-out
    checker.setAttribute('color', color);
    checker.style.visibility = "visible"
    let checkersInField = field.children.length;
    if (field.classList.contains('top')) {
        checker.setAttribute('style', `top: calc(${checkersInField} * ${CHECKEROVERLAP}%);`);
    } else {
        checker.setAttribute('style', `bottom: calc(${checkersInField} * ${CHECKEROVERLAP}%);`);
    };
    field.appendChild(checker);    // Place checker inside the field
    board[id] += color;
};

// Render checkers
function renderCheckers(board) {
    Object.entries(board).forEach((field) => {
        for (let i = 0; i < Math.abs(field[1]); i++) {
            createChecker(field[0], Math.sign(field[1]));
        };
    });
};

// Print message in chat
function printHint(hint) {
    // document.getElementById('hint').innerHTML = null;    // clear
    // document.getElementById('hint').innerHTML = hint;    // write
    let time = new Date;
    hint = time.getHours() + ':' + time.getMinutes() + ' ' + hint;
    const parent = document.getElementById('hint');
    const el = document.createElement('p');
    el.innerHTML = hint;
    parent.appendChild(el);
    parent.scrollTop = parent.scrollHeight;
};

// Send message from a player in chat
const onFormSubmitted = (e) => {
    e.preventDefault();
    const input = document.querySelector('#chat');
    const text = input.value;
    input.value = '';
    console.log(text);
    socket.emit('hint', text);
};













// ON THE PAGE

// Set a tabId - session identificator

// Choose a game: nard or backgammon
document.getElementById('game-nard').onclick = gameIsNard;    // a nard
document.getElementById('game-backgammon').onclick = gameIsBackgammon;    // a backgammon

// Choose a rival: random or friend
document.getElementById('start-play-btn').classList.add('show');    // By default the friend's link is invisible 
document.getElementById('rival-friend').onclick = rivalIsFriend;    // a friend
document.getElementById('rival-random').onclick = rivalIsRandom;    // a random




// TO THE SERVER

// Send to the server an info about connection session (tabId)
let player = {
    id: sessionStorage.getItem('tabId'),
    game: game,
    rival: rival
}
socket.emit('connected', player);

// Play button is pressed
// document.getElementById('start-play-btn').onclick = () => {socket.emit('play')};
// Press PLAY button
document.getElementById('start-play-btn').onclick = pressPlayButton;


// Get tabId in order to identify user
// var tabId= sessionStorage.getItem('tabId');
// if (tabId === null) {
//     socket.emit('newTabId');
// };

// Roll dice by click
// Temp function REMOVE IT !
document
    .getElementsByClassName('diceBox')[0]
    .addEventListener('click', (e) => {
        console.log('dice rolled!');
        socket.emit('roll_dice');
    }, false);

document
    .querySelector('#chat-form')
    .addEventListener('submit', onFormSubmitted);





// FROM THE SERVER

// // Set a generated on the server tabId
// socket.on('setTabId', function (tabId) {
//     sessionStorage.setItem('tabId', String(tabId));
// });

// Set a generated on the server tabId
socket.on('setTabId', function (tabId) {
    sessionStorage.setItem('tabId', String(tabId));
});

// Set a friend's link
socket.on('setFriendsLink', function(sharePage) {
    // document.getElementById('start-friends-link').innerHTML = sharePage;
    document.getElementById('start-friends-link').value = sharePage;
});

socket.on('hideStartModal', hideStartModal);
socket.on('hint', printHint);

// Render checkers
socket.on('renderCheckers', renderCheckers);

// Render dice after them are rolled from the server
socket.on('renderDice', renderDice);

// Reconnection
socket.on('user-reconnected', function (username) {
    console.log(username + ' just reconnected');
});





// socket.on('start', startGame);
// // socket.on('start', startGame);

// var peer = new Peer();


// var id1;
// console.log(peer)
// peer.on('open', function(id) {
//     console.log('My peer ID is: ' + id);
//     id1 = id;
// });
// peer.on('connection', function(conn) {
//     console.log(conn);
// });




// var conn = peer.connect(id1);
// conn.on('open', function() {
//     // Receive messages
//     conn.on('data', function(data) {
//         console.log('Received', data);
//     });

//     // Send messages
//     conn.send('Hello!');
// });


