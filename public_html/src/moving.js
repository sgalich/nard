// Game physics - Checkers moving algorithms

// TODO: Make dragability optionable - ???

// TESTS:
// TODO: TEST: cursor: grab on field/checker when click/drag - ???

var allowedMoves;
var allowedFields;
const CHECKEROVERLAP = 4.5;
const color = '1';
const fields = document.getElementsByClassName('field');
const checkers = document.getElementsByTagName('checker');
// This is for clicking and dragging
var mouseDownCoordinates = [];
var isCheckerSelectedAtFirst = true;
var shift = checkers[0].getBoundingClientRect().width / 2;
var draggingChecker = null;


///////////
// UTILS //
///////////

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

// Create a dragging checker
function createADraggingChecker() {
    draggingChecker = document.createElement('checker');   // Create a checker
    draggingChecker.setAttribute('color', color);
    draggingChecker.classList.add('dragging');
    draggingChecker.style.left = `${x - shift}px`;
    draggingChecker.style.top = `${y - shift}px`;
    draggingChecker.classList.add('selected');
    document.body.appendChild(draggingChecker);    // Place checker inside the field
    console.log(draggingChecker);
};

// Checks whether a node is a field (returns this node) or not (returns null)
function getFieldClicked(node) {
    if (node.nodeName === 'CHECKER') {
        return node.parentNode;
    } else if (node.classList.contains('field')) {
        return node;
    };
    return;
};

// Finds the id of the field with selected checker or returns null
function findIdFrom() {
    let selectedChecker = document.getElementsByClassName('selected')[0];
    if (selectedChecker) {
        return selectedChecker.parentNode.getAttribute('id');
    };
    return;
};

// Checks if a field is owned by a player
function isMyField(field) {
    if (field.lastChild && field.lastChild.getAttribute('color') === color) return true;
    return false;
};

// Check whether it is allowed step or not
// Function must be called when we already have a selected checker reafy to step
function isItAllowedStep(idFrom, idTo) {
    if (!idFrom || !idTo) return;
    let allowedIds = allowedFields.get(idFrom);
    if (!allowedIds) {
        return false;
    } else if (!allowedIds.includes(idTo)) {
        return false;
    };

    // TODO: Make a step cancellation !


    return true
};

// Place a checker into a new field
function placeChecker(idFrom, idTo) {
    let checker = document.getElementById(idFrom).lastChild;
    let newField = document.getElementById(idTo);
    // Restrict steps that are not allowed
    if (!isItAllowedStep(idFrom, idTo)) return;
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
};

// Highlight allowed fields
function highlightAllowedFields(fieldFrom) {
    removeHighlightFromAllFields();
    let allowedIds = allowedFields.get(fieldFrom.getAttribute('id'));
    if (!allowedIds) return;
    allowedIds.forEach((allowedId) => {
        document.getElementById(allowedId).classList.add('allowed');
    });
};

// Remove a highlight from all of the fields
function removeHighlightFromAllFields() {
    let highlightedFields = document.getElementsByClassName('allowed');
    while (highlightedFields.length) highlightedFields[0].classList.remove('allowed');
};

// Hover/Select the upper checker at the field
function makeCheckerAt(field, effect) {
    unmakeAllCheckers(effect);    // Remove this effect from any other checkers
    let choosenChecker = field.lastChild;
    if (choosenChecker) {
        choosenChecker.classList.add(effect);
    };
};

// Unhover/Unselect the upper checker at the field
function unmakeAllCheckers(effect) {
    let checkersEffected = document.getElementsByClassName(effect);
    while (checkersEffected.length) checkersEffected[0].classList.remove(effect);
};


/////////////////////
// EVENT FUNCTIONS //
/////////////////////

// HOVER

// Mouse enters the field
function mouseEntersField(e) {
    let selectedChecker = document.getElementsByClassName('selected')[0];
    if (!selectedChecker) {
        if (isMyField(this)) {
            highlightAllowedFields(this);
            makeCheckerAt(this, 'hovered');
            // this.style.cursor = 'grab';
        };
    };
};

// Mouse leaves the field
function mouseLeavesField(e) {
    let selectedChecker = document.getElementsByClassName('selected')[0];
    if (!selectedChecker) {
        if (isMyField(this)) {
            removeHighlightFromAllFields();
            unmakeAllCheckers('hovered');
        };
    };
};


// CLICK & DRAG

// Util adds a new ghost checker which actually player drags
function addDragEventListeners(checker, x, y) {
    createADraggingChecker();

    // Make the selected checker transparent
    checker.classList.add('transparent');

    // Listen to the mouse moves
    document.addEventListener('mousemove', mouseMovesWhenClicked);
    document.addEventListener('touchmove', mouseMovesWhenClicked);
};

// Mouse down
// Select a checker from a field we allowed to make a step
function mouseClicksField(e) {
    e.preventDefault();
    // Save mouse click coordinates
    mouseDownCoordinates.push({x: e.pageX, y: e.pageY});
    // Check whether the event was on a field or not
    let field = getFieldClicked(e.target);
    if (!field) return;
    let selectedChecker = document.getElementsByClassName('selected')[0];
    // Just selected a new field to start a step
    if (!selectedChecker) {
        if (isMyField(field)) {
            // removeHoverEffectAtAllowedFields();    // TODO: test - do we need it?
            makeCheckerAt(field, 'selected');
            highlightAllowedFields(field);
            addDragEventListeners(field.lastChild, e.pageX, e.pageY);
        };
    // Trying to make a step or select another checker
    } else if (selectedChecker) {
        let idFrom = selectedChecker.parentNode.getAttribute('id');
        let idTo = field.getAttribute('id');
        // If it is a valid move => make a step
        if (isItAllowedStep(idFrom, idTo)) {
            placeChecker(idFrom, idTo);
            unmakeAllCheckers('selected');
            removeHighlightFromAllFields();
        // Select a checker again
        } else if (field.lastChild) {
            // Select the same checker
            // TODO: test - SElect the same checker => selection removes or not?? Do we need it?
            // Now: unselect current checker
            if (selectedChecker === field.lastChild) {
                // Check is it an another attempt to drag => make drag, then unselect
                // or it is an unchecking click => unselect the checker
                isCheckerSelectedAtFirst = false;
                addDragEventListeners(field.lastChild, e.pageX, e.pageY);
            // Select another checker
            } else if (isMyField(field)) {
                unmakeAllCheckers('selected');
                highlightAllowedFields(field);
                makeCheckerAt(field, 'selected');
                addDragEventListeners(field.lastChild, e.pageX, e.pageY);
            };
        // An empty field
        } else {
            unmakeAllCheckers('selected');
        };         
    };
};

// Mouse moves when clicked
function mouseMovesWhenClicked(e) {
    function moveChecker(pageX, pageY) {
        draggingChecker.setAttribute('style', `transform: translate(${pageX - shift}px, ${pageY - shift}px);`);
        draggingChecker.setAttribute('style', `-webkit-transform: translate(${pageX - shift}px, ${pageY - shift}px);`);
    };
    e.preventDefault();
    // TODO: disable page scroll when dragging a checker
    moveChecker(e.pageX, e.pageY);
};

// Mouse up
function mouseUp(e) {
    e.preventDefault();
    // Remove transparency from the transparent checker
    let transparentChecker = document.getElementsByClassName('transparent')[0];
    if (transparentChecker) transparentChecker.classList.remove('transparent');
    // Remove a dragging ghost checker from the board
    if (draggingChecker) draggingChecker.remove();
    // movingChecker = null;
    let fieldTo = getFieldClicked(document.elementFromPoint(e.pageX, e.pageY));
    // Out of any field => unselect
    if (!fieldTo) {
        unmakeAllCheckers('selected');
        removeHighlightFromAllFields();
        return;
    };
    let idFrom = findIdFrom();
    let idTo = fieldTo.getAttribute('id');
    // If not a valid step
    if (!isItAllowedStep(idFrom, idTo)) {
        // If checker the same 
        if (!(isCheckerSelectedAtFirst && idFrom === idTo)) {
            unmakeAllCheckers('selected');
            removeHighlightFromAllFields();
            isCheckerSelectedAtFirst = true;
        };
    // A valid step => place a checker
    } else {
        placeChecker(idFrom, idTo);
        unmakeAllCheckers('selected');
        removeHighlightFromAllFields();
    };
    // Stop tracking mouse movements
    document.removeEventListener('mousemove', mouseMovesWhenClicked);
};


/////////////////////////////////////
// ACTIVATING THE EVENT FUNCTIONNS //
/////////////////////////////////////

// Prevent some default page behavior
document.ondragstart = function() {
    return false;
};

// Add events to highlight allowed steps
function addHoverNClickEvents() {
    // Hover events
    for (field of fields) {
        field.addEventListener('mouseenter', mouseEntersField);
        field.addEventListener('mouseleave', mouseLeavesField);
    };
    // Call click / drag & drop events
    document.addEventListener('mousedown', mouseClicksField);
    document.addEventListener('mouseup', mouseUp);
    document.addEventListener("touchstart", mouseClicksField);
    document.addEventListener("touchend", mouseUp);
};

// Remove events to highlight allowed steps
function removeHoverNClickEvents() {
    // Hover events
    for (field of fields) {
        field.removeEventListener('mouseenter', mouseEntersField);
        field.removeEventListener('mouseleave', mouseLeavesField);
    };
    // Call click / drag & drop events
    document.removeEventListener('mousedown', mouseClicksField);
    document.removeEventListener('mouseup', mouseUp);
    document.removeEventListener("touchstart", mouseClicksField);
    document.removeEventListener("touchend", mouseUp);
};


///////////////////
// PLAYER'S TURN //
///////////////////

// The main function that let player to make a move
function letPlayerToMakeHisTurn() {
    addHoverNClickEvents();



    // // Restrict any other steps when the move is done
    // removeHoverNClickEvents();
};


///////////////
// TEST ONLY //
///////////////

// THIS OBJECT WILL GET HERE FROM THE SERVER
// let's dice are 3-1
// let move_1 = new Map();
// let move_2 = new Map();
// let move_3 = new Map();
// move_1.set(1, 5);
// move_2.set(1, 2);
// move_3.set(12, 15);
// allowedMoves = [
//     [move_1],
//     [move_2, move_3],
// ];
// let's dice are 5-5
let step_1 = new Map();
let step_2 = new Map();
let step_3 = new Map();
let step_4 = new Map();
let step_5 = new Map();
let step_6 = new Map();
// step_1.set(1, 6);
// step_2.set(6, 11);
// step_3.set(11, 16);
// step_4.set(16, 21);
// step_5.set(12, 17);
// step_6.set(17, 22);
step_1.set(1, 21);    // 5 * 4 (idFrom = 1)
step_2.set(1, 16);    // 5 * 3 (idFrom = 1)
step_3.set(1, 11);    // 5 * 2 (idFrom = 1)
step_4.set(12, 17);   // 5 * 2 (idFrom = 12)
step_5.set(12, 22);   // 5 * 1 (idFrom = 12)
// Сначала ищем все steps, затем объединяем их. Ищем сначала -
// какие фишки могут походить разом весь move
// затем перебираем варианты, когда часть хода одна фишка, часть - другая...
allowedMoves = [
    [step_1],            // 5 * 4
    [step_2, step_4],    // 5 * 3 + 5 * 1
    [step_3, step_5]     // 5 * 2 + 5 * 2
];
// allowedMoves = [
//     [ Map { 1 => 5 } ],
//     [ Map { 1 => 2 }, Map { 12 => 15 } ]
// ]



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



allowedFields = allowedMovesToAllowedFields();



letPlayerToMakeHisTurn();


