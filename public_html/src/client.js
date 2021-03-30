const socket = io();
var game = 'nard';
var rival = 'random';


// Render checkers
function renderCheckers(board, color) {
    // Clear all previous checkers
    for (let i = 0; i < 25; i++) {
        document.getElementById(i).innerHTML = '';    // clear the field
    };
    board = (color === -1) ? getReversedBoard(board) : board;
    // Place new checkers from the board variable
    for (field of Object.entries(board)) {
        for (let i = 0; i < Math.abs(field[1]); i++) {
            // createChecker(...field);
            let fieldColor = Math.abs(field[1]) / field[1];
            createChecker(field[0], fieldColor);
        };
    };
};
socket.on('renderCheckers', renderCheckers);

// Render dice after they are rolled on the server
socket.on('renderDice',
    function renderDice(diceS) {
        dice = diceS;
        document.getElementById('die1').setAttribute('val', dice[0].val);
        document.getElementById('die2').setAttribute('val', dice[1].val);
        document.getElementById('die3').setAttribute('val', dice[2].val);
        document.getElementById('die4').setAttribute('val', dice[3].val);
    }
);

// Print a hint
function printHint(hint) {
    let diceBox = document.getElementById('hint');
    diceBox.innerHTML = '';    // Clear the previous hint
    diceBox.innerHTML = hint;
};
socket.on('printHint', printHint);

// The main function that let player to make a move
socket.on('letMeMakeMyStep',
    function letMeMakeMyStep(colorServ, movesServ, boardServ) {
        console.log('letMeMakeMyStep');
        colorN = colorServ;
        color = String(colorN);
        moves = movesServ;
        board = (colorN > 0) ? boardServ : getReversedBoard(boardServ);
        rearrangeAllowedSteps();
        console.log('allowedSteps', allowedSteps);
    }
);

// The move is done and we send this info to the server
function moveIsDone() {
    // if (!isMoveFinished) {
    //     // If the move is cancelled
    //     rearrangeAllowedSteps();
    //     return;
    // };
    let universalBoard = (colorN > 0) ? board : getReversedBoard(board);
    socket.emit(
        'moveIsDone',
        moves,
        universalBoard
    );
};

////////////////////////
//  SERVER => CLIENT  //
////////////////////////

function emit(command, ...args) {
    socket.emit(command, ...args);
};

// Send to the server an info about connection session (tabId)
let player = socket.player || {
    id: sessionStorage.getItem('tabId'),
    game: game,
    rival: rival
};
socket.emit('connected', player);

// Set a generated on the server tabId
socket.on('setTabId', function (tabId) {
    sessionStorage.setItem('tabId', String(tabId));
});

socket.on('hideStartModal', hideStartModal);

// Reconnection
socket.on('user-reconnected', function (username) {
    console.log(username + ' just reconnected');
});
