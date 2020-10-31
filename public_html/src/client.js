const socket = io();
var game = 'nard';
var rival = 'random';
var wait = false;


var dice;
var board;
var allowedSteps;
var moves = [];    // all moves
var stepsMade;    // part of the last move - steps that are made in this move


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
    socket.emit('changeGame', 'backgammon', game);
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
    socket.emit('changeGame', 'nard', game);
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
    document.getElementById('start-back').classList.add('hide');
    document.getElementById('start-modal').classList.add('hide');
    
    
    // console.log(document.getElementsByClassName('selected'));
    
    
    [].forEach.call(document.getElementsByClassName('selected'), (el) => {
        el.classList.remove('selected');
    });
    // console.log('hided start modal and deleted all selected');

    // console.log(document.getElementsByClassName('selected'));

};


// BOARD SCREEN

// const CHECKEROVERLAP = 5.5

// // Place one checker at certain field by id
// function createChecker(id, color) {
//     let field = document.getElementById(id);
//     let checker = document.createElement('checker');   // Create a checker
//     // checker.setAttribute('draggable', 'true');    // make it draggable
//     // checker.classList.add('draggable');
//     // checker.classList.add('hvr-grow');    // hvr-ripple-out
//     checker.setAttribute('color', color);
//     // checker.style.visibility = "visible"
//     let checkersInField = field.children.length;
//     if (field.classList.contains('top')) {
//         checker.setAttribute('style', `top: calc(${checkersInField} * ${CHECKEROVERLAP}%);`);
//     } else {
//         checker.setAttribute('style', `bottom: calc(${checkersInField} * ${CHECKEROVERLAP}%);`);
//     };
//     field.appendChild(checker);    // Place checker inside the field
//     board[id] += color;
// };

// Render checkers
function renderCheckers(board, invert=1) {
    // Clear all previous checkers
    for (let i = 0; i < 25; i++) {
        document.getElementById(i).innerHTML = '';    // clear the field
    };
    // Place new checkers from the board variable
    Object.entries(board).forEach((field) => {
        for (let i = 0; i < Math.abs(field[1]); i++) {
            createChecker(field[0], invert * Math.sign(field[1]));
        };
    });
};
socket.on('renderCheckers', renderCheckers);

// allowMovingCheckers is from moving.js
// socket.on('allowMovingCheckers', allowMovingCheckers);

// restrictMovingCheckers is from moving.js
// socket.on('restrictMovingCheckers', restrictMovingCheckers);

// Render dice after they are rolled on the server
socket.on('renderDice',
    function renderDice(dice) {
    
        console.log('dice', dice);


        // let diceBox = document.getElementById('diceBox');
        // diceBox.innerHTML = '';    // Clear all previous dice
        // let die1 = document.createElement('die');   // Create a die
        // let die2 = document.createElement('die');   // Create a die
        // die1.setAttribute('result', dieRes1);
        // die2.setAttribute('result', dieRes2);
        // diceBox.appendChild(die1);
        // diceBox.appendChild(die2);



        document.getElementById('die1').setAttribute('result', dice[0].val);
        document.getElementById('die2').setAttribute('result', dice[1].val);
        document.getElementById('die3').setAttribute('result', dice[2].val);
        document.getElementById('die4').setAttribute('result', dice[3].val);


    }
);
// socket.on('renderDice', renderDice);

// Print a hint
function printHint(hint) {
    let diceBox = document.getElementById('hint');
    diceBox.innerHTML = '';    // Clear the previous hint
    diceBox.innerHTML = hint;
};
socket.on('printHint', printHint);

// Print message in chat
// function printHint(hint) {
//     // document.getElementById('hint').innerHTML = null;    // clear
//     // document.getElementById('hint').innerHTML = hint;    // write
//     let time = new Date;
//     hint = time.getHours() + ':' + time.getMinutes() + ' ' + hint;
//     const parent = document.getElementById('hint');
//     const el = document.createElement('p');
//     el.innerHTML = hint;
//     parent.appendChild(el);
//     parent.scrollTop = parent.scrollHeight;
// };

// Send message from a player in chat
// const onFormSubmitted = (e) => {
//     e.preventDefault();
//     const input = document.querySelector('#chat');
//     const text = input.value;
//     input.value = '';
//     console.log(text);
//     socket.emit('hint', text);
// };


// ON THE PAGE

// Choose a game: nard or backgammon
document.getElementById('game-nard').onclick = gameIsNard;    // a nard
document.getElementById('game-backgammon').onclick = gameIsBackgammon;    // a backgammon

// Choose a rival: random or friend
document.getElementById('start-play-btn').classList.add('show');    // By default the friend's link is invisible 
document.getElementById('rival-friend').onclick = rivalIsFriend;    // a friend
document.getElementById('rival-random').onclick = rivalIsRandom;    // a random


// TO THE SERVER

// Send to the server an info about connection session (tabId)
let player = socket.player || {
    id: sessionStorage.getItem('tabId'),
    game: game,
    rival: rival
};
socket.emit('connected', player);

// Play button is pressed
document.getElementById('start-play-btn').onclick = pressPlayButton;

// Roll dice by click
// Temp function REMOVE IT !
// document.getElementById('diceBox').addEventListener('click', (e) => {
//     console.log('dice rolled!');
//     socket.emit('roll_dice');
// }, false);

//  Chat
// document
//     .querySelector('#chat-form')
//     .addEventListener('submit', onFormSubmitted);


// FROM THE SERVER

// Set a generated on the server tabId
socket.on('setTabId', function (tabId) {
    sessionStorage.setItem('tabId', String(tabId));
});

// Hide PLAY button
socket.on('pressPlayButton', pressPlayButton);

// Set a friend's link
socket.on('setFriendsLink', function(sharePage) {
    // document.getElementById('start-friends-link').innerHTML = sharePage;
    document.getElementById('start-friends-link').value = sharePage;
});

socket.on('hideStartModal', hideStartModal);





// Reconnection
socket.on('user-reconnected', function (username) {
    console.log(username + ' just reconnected');
});