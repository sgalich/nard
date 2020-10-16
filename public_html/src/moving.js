// Game physics - Checkers moving algorithms

// Define dragability for the checkers
// TODO: Make it optionable - turn on / turn off (for turn / awaiting rival's turn)
var allowedMoves;
const CHECKEROVERLAP = 4.5;

// UTILS







// TEST ONLY
// let's dice are 3-1
// allowedMoves = [
//     [
//         {1: 5}
//     ],
//     [
//         {1: 2}, {12: 15}
//     ],
// ];
let move_1 = new Map();
let move_2 = new Map();
let move_3 = new Map();
move_1.set(1, 5);
move_2.set(1, 2);
move_3.set(12, 15);
allowedMoves = [
    [move_1],
    [move_2, move_3],
];
// > [
//      [ Map { 1 => 5 } ],
//      [ Map { 1 => 2 }, Map { 12 => 15 } ]
//   ]


// let a user to make only allowed moves and cancel his' move
//
// This must be copied when a player makes his moves !!!
// how to copy in js - Object.assign([], allowedMoves[i])
// Say after a player has made a move 1:2, the only 12:15 move is remained
// So for now a player has only 12:15 move to make
// or he can cancel his move 1:2 - make 2:1 move
playersMoves = [
    [
        {12: 15}
    ],
    [
        {2: 1}
    ]
]





// Unmark selected fields
// function unmarkMarkedFields() {
//     let markedFields = document.getElementsByClassName('marked');
//     while (markedFields.length != 0) {
//         markedFields[0].classList.remove('marked');
//     };
// };



// This function transforms allowedMoves to allowedFields
// [ [ Map { 1 => 5 } ], [ Map { 1 => 2 }, Map { 12 => 15 } ] ]
// This transforms into this object for highlighting allowed fields
// let allowedFields = {
//     '1' => ['2', '5'],
//     '12' => ['15']
// };
// NB: allowedMoves has Numbers as ids, allowedFields has Strings as ids !
function allowedMovesToAllowedFields() {
    let allowedFields = new Map;
    allowedMoves.forEach((move) => {
        move.forEach((step) => {
            step = step.entries().next().value;
            let idFrom = String(step[0]);
            let idTo = String(step[1]);
            if (allowedFields.has(idFrom)) {
                allowedFields.get(idFrom).push(idTo);
            } else {
                allowedFields.set(idFrom, [idTo]);
            };
        });
    });
    return allowedFields;
};
var allowedFields = allowedMovesToAllowedFields();




// Make fields highlighted after HOVER
// we have allowedMoves:
// let's dice are 3-1
// allowedMoves = [
// > [ [ Map { 1 => 5 } ], [ Map { 1 => 2 }, Map { 12 => 15 } ] ]

// var fieldTo;    // recommended field for being highlighted

// Mouse enters the field
// var mouseenterField;
// var mouseleaveField;





// UTILS

// Highlight allowed fields
function highlightAllowedFields(fieldFrom) {
    removeHighlightFromAllFields();
    let idFrom = fieldFrom.getAttribute('id');
    allowedFields.get(idFrom).forEach((allowedId) => {
        document.getElementById(allowedId).classList.add('allowed');
    });
};

// Remove a highlight from all of the fields
function removeHighlightFromAllFields() {
    let effect = 'allowed';
    let highlightedFields = document.getElementsByClassName(effect);
    while (highlightedFields.length) highlightedFields[0].classList.remove(effect);
};

// Hover/Select the upper checker at the field
function makeCheckerAt(field, effect) {
    unmakeAllCheckers(effect);    // Remove this effect from any other checkers
    let choosenChecker = field.lastChild;
    if (choosenChecker) choosenChecker.classList.add(effect);
};

// Unhover/Unselect the upper checker at the field
function unmakeAllCheckers(effect) {
    let checkersEffected = document.getElementsByClassName(effect);
    while (checkersEffected.length) checkersEffected[0].classList.remove(effect);
};





//////////////////////
// EVENT FUNCTIONNS //
//////////////////////


// HOVER



// Mouse enters the field
function mouseEntersField(e) {
    highlightAllowedFields(this);
    makeCheckerAt(this, 'hovered');
};

// Mouse leaves the field
function mouseLeavesField(e) {
    let idFrom = this.getAttribute('id');
    let selectedChecker = document.getElementsByClassName('selected')[0];
    if (!selectedChecker) {
        allowedFields.get(idFrom).forEach((allowedId) => {
            document.getElementById(allowedId).classList.remove('allowed');
        });
    };
    // Remove the upper checker's highlight 
    let checkerToHover = this.lastChild;
    if (checkerToHover) checkerToHover.classList.remove('hovered');
};





// CLICK
var idFrom = null;

// Select a checker from field we allowed to make a step
function mouseClicksFieldFrom(e) {
    removeHoverEffectAtAllowedFields();
    highlightAllowedFields(this);
    makeCheckerAt(this, 'selected');
    // Add events for clicking other fields
    idFrom = this.getAttribute('id');
    allowedFields.get(idFrom).forEach((allowedId) => {
        document.getElementById(allowedId).addEventListener('click', mouseClicksFieldTo);
    });
};

// Select a checker from a field we allowed to make a step
function mouseClicksFieldTo(e) {
    // Check if it is allowed field or not
    let allowedIds = allowedFields.get(idFrom);
    let thisId = this.getAttribute('id');
    if (!allowedIds.includes(thisId)) return;
    // Place checker
    let selectedChecker = document.getElementsByClassName('selected')[0];
    placeChecker(selectedChecker, this);
    // Remove this listener from the allowed fields
    allowedFields.get(idFrom).forEach((allowedId) => {
        document.getElementById(allowedId).removeEventListener('click', mouseClicksFieldTo);
    });
    unmakeAllCheckers('selected');
    idFrom = null;
};



/// !!!!!!!!!1
// REMAKE IT WITH ALLOWEDFIELDS
// you cannot select a checker if you cannot make a step from this field...
// !!!!

// function fieldClick(e) {
//     let idFrom = this.getAttribute('id');
//     if ([...allowedFields.keys()].includes(idFrom)) {
//         selectCheckerOnThe(this);
//     };

    // let selectedChecker = document.querySelector('checker.selected');
    // if (selectedChecker) {
    //     placeChecker(selectedChecker, this);
    // } else {
    //     let idFrom = this.getAttribute('id');
    //     if ([...allowedFields.keys()].includes(idFrom)) {
    //         selectCheckerOnThe(this);
    //     };
    // };
// };










// Add events to highlight allowed steps
function addAllowedFields() {
    for (item of allowedFields.entries()) {
        let idFrom = String(item[0]);
        let fieldFrom = document.getElementById(idFrom);
        fieldFrom.addEventListener('mouseenter', mouseEntersField);
        fieldFrom.addEventListener('mouseleave', mouseLeavesField);
        fieldFrom.addEventListener('click', mouseClicksFieldFrom);
    };
};

// Remove events to highlight allowed steps
function removeHoverEffectAtAllowedFields() {
    for (item of allowedFields.entries()) {
        let idFrom = String(item[0]);
        let fieldFrom = document.getElementById(idFrom);
        fieldFrom.removeEventListener('mouseenter', mouseEntersField);
        fieldFrom.removeEventListener('mouseleave', mouseLeavesField);
        // fieldFrom.removeEventListener('click', mouseClicksField);
    };
};


addAllowedFields();
// removeAllowedFields()


// Place a checker into a new field
function placeChecker(checker, newField) {

    // Restrict steps that not allowed
    let fromId = checker.parentNode.getAttribute('id');
    let toId = newField.getAttribute('id');
    if (!allowedFields.get(fromId).includes(toId)) return;



    // Change allowedFields here !!!!
    removeHoverEffectAtAllowedFields()




    let move_1 = new Map();
    move_1.set(1, 6);
    allowedMoves = [
        [move_1]
    ];
    






    // Place the checker correctly inside the target
    let checkersInNewField = newField.children.length;
    // If the checker goes back to it's field, then move it under the new place
    if (checker.parentNode === newField) {checkersInNewField -= 1};
    // Place the checker correctly in his field
    checker.style.removeProperty('top');
    checker.style.removeProperty('bottom');
    if (newField.classList.contains('top')) {
        checker.setAttribute('style', `top: calc(${checkersInNewField} * ${CHECKEROVERLAP}%);`);
    } else {
        checker.setAttribute('style', `bottom: calc(${checkersInNewField} * ${CHECKEROVERLAP}%);`);
    };
    newField.appendChild(checker);
    unmakeAllCheckers('selected');
};






// DOES NOT USE
// HOVER => highlight the last checker if it exists
// function fieldHover(e) {
//     // Check if it is allowed for player to make moves
//     // Cancel the previous hover
//     let hoveredChecker = document.getElementsByClassName('hovered')
//     for (checker of hoveredChecker) {
//         checker.classList.remove('hovered');
//     };
//     // Set a new hover
//     let checkerToHover = this.lastChild;
//     if (checkerToHover) {
//         checkerToHover.classList.add('hovered')
//     };
// };

// CLICK => move selected checker or select the field's last checker




























// DRAG

// WORKING DRAG: MOBILE + WEB !!!
// TODO: show a ghost correctly on WEb

// For each checker...
// let checkers = document.getElementsByTagName('checker');
// [].forEach.call(checkers, (checker) => {
// });

var draggingChecker = null;

// Select the last checker if it exists
function selectChecker(field) {
    unselectAllCheckers();
    let movingChecker = field.lastChild;
    if (movingChecker) {movingChecker.classList.add('selected')};
};

// Dragstart
function dragstart(e) {
    e.dataTransfer.setData('text/plain',null);
    e.target.style.opacity = .75;
    unselectAllCheckers();
    draggingChecker = e.target.parentNode.lastChild;
    selectChecker(e.target.parentNode);
    e.dataTransfer.dropEffect = "copy";
};

// Dragover
function dragover(e) {
    if(draggingChecker) {
        e.preventDefault();
    };
};


// Drop
function drop(e) {
    e.preventDefault();
    let newField = null;
    if (e.target.classList.contains('field')) {
        newField = e.target;
    } else if (e.target.tagName === 'CHECKER') {
        newField = e.target.parentNode;
    } else {
        return;
    };
    // Reject operation if the field contains checkers w/ the opposite color
    let checkerColor = draggingChecker.getAttribute('color')
    if (newField.lastChild && newField.lastChild.getAttribute('color') != checkerColor) {
        return;
    };
    placeChecker(draggingChecker, newField);
};


// Dragend
function dragend(e) {
    draggingChecker = null;
};








    // TOUCH
    // ... 




    // SWIPE

    // Working swipe
    // function detectswipe(el,func) {
    //     swipe_det = new Object();
    //     swipe_det.sX = 0; swipe_det.sY = 0; swipe_det.eX = 0; swipe_det.eY = 0;
    //     var min_x = 30;  //min x swipe for horizontal swipe
    //     var max_x = 30;  //max x difference for vertical swipe
    //     var min_y = 50;  //min y swipe for vertical swipe
    //     var max_y = 60;  //max y difference for horizontal swipe
    //     var direc = "";
    //     let checkers = document.getElementsByTagName('checker');
    //     for (ele of checkers) {
    //         ele.addEventListener('touchstart',function(e){
    //             var t = e.touches[0];
    //             swipe_det.sX = t.screenX; 
    //             swipe_det.sY = t.screenY;
    //         },false);
    //         ele.addEventListener('touchmove',function(e){
    //             e.preventDefault();
    //             var t = e.touches[0];
    //             swipe_det.eX = t.screenX; 
    //             swipe_det.eY = t.screenY;    
    //         },false);
    //         ele.addEventListener('touchend',function(e){
    //             //horizontal detection
    //             if ((((swipe_det.eX - min_x > swipe_det.sX) || (swipe_det.eX + min_x < swipe_det.sX)) && ((swipe_det.eY < swipe_det.sY + max_y) && (swipe_det.sY > swipe_det.eY - max_y) && (swipe_det.eX > 0)))) {
    //             if(swipe_det.eX > swipe_det.sX) direc = "r";
    //             else direc = "l";
    //             }
    //             //vertical detection
    //             else if ((((swipe_det.eY - min_y > swipe_det.sY) || (swipe_det.eY + min_y < swipe_det.sY)) && ((swipe_det.eX < swipe_det.sX + max_x) && (swipe_det.sX > swipe_det.eX - max_x) && (swipe_det.eY > 0)))) {
    //             if(swipe_det.eY > swipe_det.sY) direc = "d";
    //             else direc = "u";
    //             }
            
    //             if (direc != "") {
    //             if(typeof func == 'function') func(el,direc);
    //             }
    //             direc = "";
    //             swipe_det.sX = 0; swipe_det.sY = 0; swipe_det.eX = 0; swipe_det.eY = 0;
    //         },false);  
    //         };
    //     };
    // function myfunction(el,d) {
    //     alert("you swiped on element with id '"+el+"' to "+d+" direction");
    // };
    // detectswipe('an_element_id',myfunction);









    // These are universal:
    // 'touchstart'
    // "touchmove"
    // "touchend"
    // "touchcancel"

    // https://github.com/Bernardo-Castilho/dragdroptouch
    // https://github.com/timruffles/mobile-drag-drop
    // drag = https://developer.mozilla.org/en-US/docs/Web/API/DataTransfer/dropEffect


    // These are bad:
    // "dragstart"
    // "dragenter"
    // "dragleave"

// Get the color of checkers on the field => -1 / 0 / 1 (blue, none, red)
function getFieldColor(field) {
    let checker = field.lastChild;
    if (checker) return Number(checker.getAttribute('color'));
    return 0;
};

// Allow a player with color <color> to move his checkers
var allowMovingCheckers = function(color) {

    var fields = document.getElementsByClassName('field');
    for (field of fields) {
        let fieldColor = getFieldColor(field);
        // If it is rival's field => make all checker's here undraggable
        if (fieldColor === -1 * color) {
            rivalsCheckers = field.children;
            [].forEach.call(rivalsCheckers, (checker) => {
                checker.setAttribute('draggable', 'false');
            });
        } else {
            // field.addEventListener('mouseover', fieldHover);
            // field.addEventListener('mousedown', fieldClick);
        };
    };
    document.addEventListener('dragstart', dragstart);
    document.addEventListener('dragover', dragover);
    document.addEventListener('drop', drop);
    document.addEventListener('dragend', dragend);
};

// Restrict a player moving checkers
var restrictMovingCheckers = function() {
    
    // Call all this functions above
    var fields = document.getElementsByClassName('field');
    for (field of fields) {
        // field.removeEventListener('mouseover', fieldHover);
        // field.removeEventListener('mousedown', fieldClick);
    };

    document.removeEventListener('dragstart', dragstart);
    document.removeEventListener('dragover', dragover);
    document.removeEventListener('drop', drop);
    document.removeEventListener('dragend', dragend);

};



allowMovingCheckers(1);

// setTimeout(
//     restrictMovingCheckers(),
//     10000
// );







// module.exports.startGame = startGame;
// startGame();
