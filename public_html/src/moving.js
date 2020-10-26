// Game physics - Checkers moving algorithms

// TESTS:
// TODO: TEST: cursor: grab on field/checker when click/drag - ???


var allowedFields;
const CHECKEROVERLAP = 4.5;
var color = '1';
const fields = document.getElementsByClassName('field');
const checkers = document.getElementsByTagName('checker');
// This is for clicking and dragging
var mouseDownCoordinates = [];
var isCheckerSelectedAtFirst = true;
var shift = checkers[0].getBoundingClientRect().width / 2;
var ghostChecker = null;
var playersMoves = {
    '1': [],
    '-1': []
};
var valToMove;    // the amount sum of steps to make
var valMoved = 0;    // initial move counter

///////////////////////////////////
// This we will get from the server
var allowedMoves;
var allowedSteps;
// var die1;
// var die2;
// var die3;
// var die4;
///////////////////////////////////


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

// Create a dragging ghost checker
function createGhostChecker(x, y) {
    ghostChecker = document.createElement('checker');   // Create a checker
    ghostChecker.setAttribute('color', color);
    ghostChecker.classList.add('ghost');
    ghostChecker.style.left = `${x - shift}px`;
    ghostChecker.style.top = `${y - shift}px`;
    ghostChecker.classList.add('selected');
    document.body.appendChild(ghostChecker);    // Place checker inside the field
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

// Get the center point of the field
function getFieldCenter(field) {
    let fieldCoordinates = field.getBoundingClientRect();
    let x = fieldCoordinates.left + fieldCoordinates.width / 2;
    let y = fieldCoordinates.top + fieldCoordinates.height / 2;
    return [x, y];
};

// Counts the distance between two points, like ([34, 34] & [234, 323])
function countDistanceBetween(a, b) {
    return ((b[0] - a[0]) ** 2 + (b[1] - a[1]) ** 2) ** 0.5;
};

// Chooses a field that is the closest to the mouse position
function chooseTheClosestField(fieldFrom, x, y) {
    let idFrom = fieldFrom.getAttribute('id');
    var theClosestField = fieldFrom;
    var distance = countDistanceBetween(getFieldCenter(fieldFrom), [x, y]);
    let allowedIds = allowedFields.get(idFrom);
    if (!allowedIds) return theClosestField;
    allowedIds.forEach((fieldId) => {
        let field = document.getElementById(fieldId);
        let newDistance = countDistanceBetween(getFieldCenter(field), [x, y]);
        if (newDistance < distance) {
            theClosestField = field;
            distance = newDistance;
        };
    });
    return theClosestField;
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

// Checks if a field is owned by a rival
function isRivalsField(field) {
    if (field.lastChild && field.lastChild.getAttribute('color') !== color) return true;
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
    // Add cancellation move
    // allowedSteps.push(
    //     new Map().set(idTo, idFrom)
    // );
    playersMoves[color].push(new Map().set(idFrom, idTo));
    rearrangeAllowedFields();
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

// Animate checker that was dragged
function animatePlacingChecker(xFrom, yFrom) {


    // https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/transitionend_event
    // ghostChecker.addEventListener('transitionrun', function() {
    //     console.log('transitionrun');
    //   });
      
    //   ghostChecker.addEventListener('transitionstart', function() {
    //     console.log('transitionstart');
    //   });
      
    //   ghostChecker.addEventListener('transitioncancel', function() {
    //     console.log('transitioncancel'); 
    //   }); 
      
    //   ghostChecker.addEventListener('transitionend', function() {
    //     console.log('transitionend');
    //     ghostChecker.remove();
    //   });

    
    
    ghostChecker.remove();

    
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
    createGhostChecker(x, y);
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
    // Do nothing if it was not left click
    if (e.which === 2 || e.which === 3) return;
    // Save mouse click coordinates
    mouseDownCoordinates.push({x: e.pageX, y: e.pageY});
    // Check whether the event was on a field or not
    let field = getFieldClicked(e.target);
    if (!field) return;
    let selectedChecker = document.getElementsByClassName('selected')[0];
    // Just selected a new field to start a step
    if (!selectedChecker) {
        if (isMyField(field)) {
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
        ghostChecker.setAttribute('style', `transform: translate(${pageX - shift}px, ${pageY - shift}px);`);
        ghostChecker.setAttribute('style', `-webkit-transform: translate(${pageX - shift}px, ${pageY - shift}px);`);
    };
    e.preventDefault();
    // TODO: MEDIUM: disable page scroll when dragging a checker
    moveChecker(e.pageX, e.pageY);
};

// Mouse up
function mouseUp(e) {
    e.preventDefault();
    // Do nothing if it was not left click
    if (e.which === 2 || e.which === 3) return;
    let idFrom = findIdFrom();
    // Do nothing if it is not a player's field
    if (!idFrom) return;
    let fieldFrom = document.getElementById(idFrom);

    // Place the checker at the closest valid field
    let fieldTo = chooseTheClosestField(fieldFrom, e.pageX, e.pageY);
    // Place the checker to the field
    let idTo = fieldTo.getAttribute('id');
    // TODO: LOW: Make this if's chain easier !
    // If not a valid step
    if (!isItAllowedStep(idFrom, idTo)) {
        // If checker the same => return it back to fieldFrom
        if (!(isCheckerSelectedAtFirst && idFrom === idTo)) {
            unmakeAllCheckers('selected');
            removeHighlightFromAllFields();
            isCheckerSelectedAtFirst = true;
        };
    // A valid step => place a checker
    } else {
        placeChecker(idFrom, idTo);
        removeHighlightFromAllFields();
        unmakeAllCheckers('selected');
    };

    // Remove a dragging ghost checker from the board
    if (ghostChecker) animatePlacingChecker(e.pageX, e.pageY);
    // Remove transparency from the transparent checker
    let transparentChecker = document.getElementsByClassName('transparent')[0];
    if (transparentChecker) transparentChecker.classList.remove('transparent');


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

// Restrict a right mouse click on the board
document.getElementById('board').addEventListener('contextmenu', (e) => {
    e.preventDefault();
});

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
    document.addEventListener('touchstart', mouseClicksField);
    document.addEventListener('touchend', mouseUp);
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
    document.removeEventListener('touchstart', mouseClicksField);
    document.removeEventListener('touchend', mouseUp);
};






/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

////////////////
// IN DEVELOP //
////////////////

// ALL OF THIS BELOW SUPPOSED TO BE COUNTED ON THE SERVER !!!!!!!!1

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////







// Returns an 4-length array with dice to step
// function getDice() {
//     die3 = die4 = (die1 === die2) ? die1 : undefined;
//     return [die1, die2, die3, die4];
// };

// Counts the sum of player's steps
function setValMoved() {
    valMoved = 0;
    playersMoves[color].forEach((step) => {
        step = step.entries().next().value;
        let idFrom = Number(step[0]);
        let idTo = Number(step[1]);
        valMoved += idTo - idFrom;
    });
};

// Counts the sum of getDice()
function setValToMove() {
    valToMove = getDice().filter((die) => {
        return Boolean(die);
    }).reduce((total, num) => {return total + num});
};

// Checks whether it is allowed step
// TODO: MEDIUM: Think about different name for this func & that - "isItAllowedStep"
function isStepAllowed(idFrom, die) {
    let idTo = idFrom + die;
    let fieldTo = document.getElementById(String(idTo));
    if (
        idTo <= 24
        && valMoved !== die
        && !isRivalsField(fieldTo) 
        && die <= (valToMove - valMoved)
    ) {
        return true;
    };
    return false;
};

 // Add reversed steps for steps that are already made by a player
function addCancelSteps() {
    if (!allowedSteps.length) return;
    playersMoves[color].forEach((step) => {
        let [idFrom, idTo] = step.entries().next().value;
        allowedSteps.push(new Map().set(Number(idTo), Number(idFrom)));
    });
};

// Filter allowed steps with the rules
function filterAllowedSteps() {
    // Add an ability to cancel the last step (if the move is not completed)
    addCancelSteps();



    // TODO: HIGH: 6 подряд перед самой первой фишкой соперника? - запретить такой ход.
    // TODO: HIGH: с головы сколько раз? - реализовать логику (с учетом первого хода)
    
    // TODO: HIGH: Все на поле для выкидывания? - разработать свою логику тут.

};


// Get all possible steps according to the board situation
// returns [
//     Map {1 => 6},
//     Map {1 => 11},
//     Map {1 => 16},
//     Map {1 => 21},
//     Map {12 => 17},
//     Map {12 => 22}
// ]
function rearrangeAllowedSteps() {
    allowedSteps = [];
    // If not doubles
    if (die1 !== die2) {
        for (field of fields) {
            if (!isMyField(field)) continue;
            let idFrom = Number(field.getAttribute('id'));
            let sumIsAllowed = false;
            // Check a step by the die1
            if (isStepAllowed(idFrom, die1)) {
                allowedSteps.push(new Map().set(idFrom, idFrom + die1));
                sumIsAllowed = true;
            };
            // Check a step by the die2
            if (isStepAllowed(idFrom, die2)) {
                allowedSteps.push(new Map().set(idFrom, idFrom + die2));
                sumIsAllowed = true;
            };
            // Check a step by the die1 + die2
            if (sumIsAllowed && isStepAllowed(idFrom, die1 + die2)) {
                allowedSteps.push(new Map().set(idFrom, idFrom + die1 + die2));
            };
        };
    // If doubles
    } else {
        for (field of fields) {
            if (!isMyField(field)) continue;
            let idFrom = Number(field.getAttribute('id'));
            // Check a step by one die
            if (isStepAllowed(idFrom, die1)) {
                allowedSteps.push(new Map().set(idFrom, idFrom + die1));
                // Check a step by doubled die
                if (isStepAllowed(idFrom, die1 * 2)) {
                    allowedSteps.push(new Map().set(idFrom, idFrom + die1 * 2));
                    // Check a step by tripled die
                    if (isStepAllowed(idFrom, die1 * 3)) {
                        allowedSteps.push(new Map().set(idFrom, idFrom + die1 * 3));
                        // Check a step by quadrupled die
                        if (isStepAllowed(idFrom, die1 * 4)) {
                            allowedSteps.push(new Map().set(idFrom, idFrom + die1 * 4));
                        };
                    };
                };
            };
        };
    };
    filterAllowedSteps();
};

// The main function that arranges allowed steps
// Gathers all possible steps for each of the field
// Map {"1" => ["6", "11", "16", "21"], "12" => ["17", "22"]}
function rearrangeAllowedFields() {


    // TODO: SUPERHIGH!!! Remake it with a board obj


    setValToMove();
    setValMoved();
    allowedFields = new Map();
    rearrangeAllowedSteps();
    allowedSteps.forEach((step) => {
        step = step.entries().next().value;
        let idFrom = String(step[0]);
        let idTo = String(step[1]);
        if (allowedFields.has(idFrom)) {
            allowedFields.get(idFrom).push(idTo);
        } else {
            allowedFields.set(idFrom, [idTo]);
        };
    });
    // Restrict any other steps when the move is done
    if (!allowedFields.size) {
        changeTurn();
    };
};


function changeTurn() {
    removeHoverNClickEvents();
    playersMoves[color] = [];
    color = String(-color);
    rollDice();
    letMeMakeMyStep();
};


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
// [die1, die2] = [5, 5];
// let step_1 = new Map();
// let step_2 = new Map();
// let step_3 = new Map();
// let step_4 = new Map();
// let step_5 = new Map();
// let step_6 = new Map();
// step_1.set(1, 6);
// step_2.set(6, 11);
// step_3.set(11, 16);
// step_4.set(16, 21);
// step_5.set(12, 17);
// step_6.set(17, 22);
// step_1.set(1, 21);    // 5 * 4 (idFrom = 1)
// step_2.set(1, 16);    // 5 * 3 (idFrom = 1)
// step_3.set(1, 11);    // 5 * 2 (idFrom = 1)
// step_4.set(12, 17);   // 5 * 2 (idFrom = 12)
// step_5.set(12, 22);   // 5 * 1 (idFrom = 12)
// Сначала ищем все steps, затем объединяем их. Ищем сначала -
// какие фишки могут походить разом весь move
// затем перебираем варианты, когда часть хода одна фишка, часть - другая...




// + Нужна функция, которая сворачивает steps пользователя
// пример - [ Map { 1 => 5 }, Map { 5 => 9 }] должен сохраняться как [ Map { 1 => 9 } ]
// allowedMoves = [
//     [step_1],            // 5 * 4
//     [step_2, step_4],    // 5 * 3 + 5 * 1
//     [step_3, step_5]     // 5 * 2 + 5 * 2
// ];
// allowedMoves = [
//     [ Map { 1 => 5 } ],
//     [ Map { 1 => 2 }, Map { 12 => 15 } ]
// ]


// Рассчитываем все элементарные steps, а потом их свернутые версии
// allowedSteps = [
//     // Simple steps
//     // The checker from field 1
//     new Map().set(1, 6),
//     new Map().set(6, 11),
//     new Map().set(11, 16),
//     new Map().set(16, 21),
//     // The checker from field 1
//     new Map().set(12, 17),
//     new Map().set(17, 22),
//     // Complementary steps
//     // idFrom = 1
//     new Map().set(1, 11),
//     new Map().set(1, 16),
//     new Map().set(1, 21),
//     new Map().set(6, 16),
//     new Map().set(6, 21),
//     new Map().set(11, 21),
//     // idFrom = 12
//     new Map().set(12, 22),
// ]
// Перебираем каждое поле и если оно нашего цвета получаем idTo
// проверяем - поле с idTo чужое? (написать зеркальную функцию, проверяющую это)
// если свое - ...



// This must be copied when a player makes his moves !!!
// how to copy in js - Object.assign([], allowedMoves[i])
// Say after a player has made a move 1:2, the only 12:15 move is remained
// So for now a player has only 12:15 move to make
// or he can cancel his move 1:2 - make 2:1 move
// playersMoves = [
//     [
//         {12: 15}
//     ],
//     [
//         {2: 1}
//     ]
// ]






/////////////
// MY STEP //
/////////////

// function letMeMakeMyStep() {
//     rearrangeAllowedFields();
//     addHoverNClickEvents();
// };

///////////////////
// PLAYER'S TURN //
///////////////////

// The main function that let player to make a move
function letMeMakeMyStep() {
    rearrangeAllowedFields();
    addHoverNClickEvents();
};



// [die1, die2] = [1, 1];

document.getElementById('diceBox').onclick = () => {
    die1 = Math.floor(Math.random() * 6) + 1;
    die2 = Math.floor(Math.random() * 6) + 1;     
    rollDice();
    letMeMakeMyStep();
};

// letMeMakeMyStep();



// TODO: HIGH: Make normal rules to make steps
// TODO: HIGH: Add a move completely without a cancellation
// TODO: MEDIUM: Make a step cancellation ability!
// TODO: MEDIUM: Add some animation to a checkers moving


