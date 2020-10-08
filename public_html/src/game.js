const CHECKEROVERLAP = 5.5
var die1;    // random result from die1
var die2;    // random result from die2
var turn;    // -1 or 1 (for 'black' or 'white') - who is moving checkers now
var wait;    // 1 or -1 (for 'white' or 'black') - who is awaiting now
var turn4User;    // turn for user as black/white or yellow/blue, etc.
var winner;
var allPossibleMoves;    // Object {fieled id with checker: [field ids where is allowed to make a move]},
var roundN;    // round number
const board = {};
    // 1: '0',    <--    fieldId: '<count><color>', i.e. '1b'/'2a'


// color = -1 / 1 for black / white


// THE MAIN FUNCTION TO START A GAME
var startGame = function () {
    placeChackers();
};




// Nessesary changes when it's going to be next round
function nextRound() {
    [turn4User, turn, wait] = (die1 < die2) ? ['yellow', 1, -1] : ['blue', -1, 1];
    printHint(`Black: ${die1}, White: ${die2}, ${turn} are first!`);
}

// Place one checker at certain field by id
function createChecker(color, id) {
    const field = document.getElementById(id);
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

// 3.0 Place checkers
function placeChackers() {
    
    // Fill the const board with zeroes
    (function initBoard() {
        for (let i = 1; i < 25; i++) {
            board[i] = 0;
        };
    }());

    for (let i = 0; i < 15; i++) {
        createChecker(-1, 1);    // -1 - black
        createChecker(1, 13);    // 1 - white
    };
};

// 3. The Game functions
function play() {
    // while (winner == undefined) {
    //     round();
    // };
    round();
};




// create a move func
// call this func when useer is making move suggestions
// then in move func see: what move does user suggest?
// is it valid color?
// is it legal?
//    - dice?
//    - ...









function round() {
    rollDice();
    printHint(`${turn4User}\'s turn<br>${die1} : ${die2}`);
    // Find all possible moves
    // findAllPossibleMoves();
    
    
    
    
    
    // while (die1 != null && die2 != null) {
        // console.log(die1, die2);
        // if there is not possible moves
        // or player has done his moves    =>     die1 = null; die2 = null;
        // Player need to make all moves
    // };
    // Round finished, rival's turn



    // turn = (turn == 'black') ? 'white' : 'black';
    // printHint(`Turn: ${turn}`);
};

// Find all possible moves
function findAllPossibleMoves() {

    // 1. Get the fields FROM we can move the checkers
    // count checkers!!!
    let fromFields = new Set();
    document.querySelectorAll(`[color=${turn}]`).forEach(el => {
        fromFields.add(el.parentElement.id);
    });
    console.log(fromFields);

    // 2. Get the fields TO where we can move the checkers
    let toFields = new Set();
    document.querySelectorAll(`[color=${wait}]`).forEach(el => {
        fromFields.add(el.parentElement.id);
    });

    /// FIND ALL BOARD - MAKE AN OBJECT !!!

    // 1. find all fields with turn color
    let turnsFields = [];
    // 
    // 2. find all moves for each field
    // .Duplicates?
};



















// HANDLERS

function printHint(hint) {
    // document.getElementById('hint').innerHTML = null;    // clear
    // document.getElementById('hint').innerHTML = hint;    // write
    time = new Date;
    hint = time.getHours() + ':' + time.getMinutes() + ' ' + hint;
    const parent = document.getElementById('hint');
    const el = document.createElement('p');
    el.innerHTML = hint;
    parent.appendChild(el);
    parent.scrollTop = parent.scrollHeight;
};








// Checker selection & moving
var fields = document.getElementsByClassName('field');
for (field of fields) {
    field.addEventListener('mousedown', function() {
        
        // If it is highlighted field => move checker
        // else: ...

        // Selected field to make a move
        if (this.classList.contains('marked')) {    // if it is allowed to make this move
            let movingChecker = document.getElementsByClassName('selected')[0];
            // Place the checker correctly inside the target
            let checkersInNewField = this.children.length;
            // If the checker goes back to it's field, then move it under the new place
            if (movingChecker.parentNode === this) {
                checkersInNewField -= 1;
            }
            movingChecker.style.removeProperty('top');
            movingChecker.style.removeProperty('bottom');
            if (this.classList.contains('top')) {
                movingChecker.setAttribute('style', `top: calc(${checkersInNewField} * ${CHECKEROVERLAP}%);`);
            } else {
                movingChecker.setAttribute('style', `bottom: calc(${checkersInNewField} * ${CHECKEROVERLAP}%);`);
            };
            this.appendChild(movingChecker);
            unselectAllCheckers();
        } else {    // Selected a checker to think about a move
            unselectAllCheckers();
            let activeChecker = this.lastChild;
            if (activeChecker != null) {
                checkerSelected(activeChecker);
            };
        };
    });
};

// Select a checker
function checkerSelected(checker) {
    checker.classList.add('selected');
    let selectedId = Number(checker.parentNode.id);
    highlightAllPossibleMoves(selectedId);
};

// find all possible moves for all checkers for the move
// ...
// ...


// Highlight all possible moves
function highlightAllPossibleMoves(selectedId) {
    allPossibleMoves = [
        document.getElementById((selectedId + die1) % 24),
        document.getElementById((selectedId + die2) % 24),
        document.getElementById((selectedId + die1 + die2) % 24)
    ];
    // Add new fields if there is duplicate dice

    // // Think about it
    // if (move1 == move2) {

    // };
    allPossibleMoves.filter(field => field != null);
    for (let i = 0; i < allPossibleMoves.length; i++) {
        // let fieldToMoveOn = allPossibleMoves[i]
        // DO NOT ALLOW TO MOVE IF:

        allPossibleMoves[i].classList.add('marked');

        
    };
};

// Unselect all the selected checkers if they exist
var unselectAllCheckers = function() {
    let selectedChecker = document.getElementsByClassName('selected')[0];
    if (selectedChecker != undefined) {
        selectedChecker.classList.remove('selected');
        unmarkMarkedFields();
    };
};

// Unmark selected fields
function unmarkMarkedFields() {
    let markedFields = document.getElementsByClassName('marked');
    while (markedFields.length != 0) {
        markedFields[0].classList.remove('marked');
    };
};








// WORKING DRAGGING ALGORITHM
// TODO: Remake it with mouseclick
(function() {
    let movingChecker = null;

    // Start dragging
    function dragstart(e) {
        // Set the movingChecker object
        unselectAllCheckers();
        movingChecker = e.target.parentNode.lastChild;
        checkerSelected(movingChecker);
    };
    document.addEventListener('dragstart', dragstart, false);
    document.addEventListener('ondragstart', dragstart);


    // Show dragging checker
    function showDraggingChecker(e) {
        let selectedChecker = document.getElementsByClassName('selected')[0];
        if (selectedChecker != undefined) {
            selectedChecker.style.transform = 'translateY('+(e.clientY-80)+'px)';
            selectedChecker.style.transform += 'translateX('+(e.clientX-100)+'px)';
        };       
    };
    // document.addEventListener('mousemove', showDraggingChecker, false);


    //dragover event to allow the drag by preventing its default
    //ie. the default action of an element is not to allow dragging 
    document.addEventListener('dragover', function(e) {
        if(movingChecker) {
            e.preventDefault();
        }
    }, false);  

    //drop event to allow the element to be dropped into valid targets
    document.addEventListener('drop', function(e) {
        e.preventDefault();
        var NewField = null;
        if (e.target.classList.contains('field')) {
            NewField = e.target;
        } else if (e.target.tagName === 'CHECKER') {
            NewField = e.target.parentNode;
        } else {
            return;
        };
        // Reject operation if the field contains checkers w/ the opposite color
        let checkerColor = movingChecker.getAttribute('color')
        if (NewField.lastChild && NewField.lastChild.getAttribute('color') != checkerColor) {
            return;
        }; 
        // Place the checker correctly inside the target
        let checkersInNewField = NewField.children.length;
        // If the checker goes back to it's field, then move it under the new place
        if (movingChecker.parentNode === NewField) {
            checkersInNewField -= 1;
        }
        movingChecker.style.removeProperty('top');
        movingChecker.style.removeProperty('bottom');
        if (NewField.classList.contains('top')) {
            movingChecker.setAttribute('style', `top: calc(${checkersInNewField} * ${CHECKEROVERLAP}%);`);
        } else {
            movingChecker.setAttribute('style', `bottom: calc(${checkersInNewField} * ${CHECKEROVERLAP}%);`);
        };
        NewField.appendChild(movingChecker);
        unselectAllCheckers();
    }, false);
    
    //dragend event to clean-up after drop or abort
    //which fires whether or not the drop target was valid
    document.addEventListener('dragend', function(e) {
        movingChecker = null;
    }, false);
})();









// module.exports.startGame = startGame;
// startGame();
