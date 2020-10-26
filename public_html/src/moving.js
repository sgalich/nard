// Game physics - Checkers moving algorithms

// TESTS:
// TODO: TEST: cursor: grab on field/checker when click/drag - ???


var allowedFields;
// const CHECKEROVERLAP = 4.5;
const fields = document.getElementsByClassName('field');
const checkers = document.getElementsByTagName('checker');
// This is for clicking and dragging
var mouseDownCoordinates = [];
var isCheckerSelectedAtFirst = true;
var shift = checkers[0].getBoundingClientRect().width / 2;
var ghostChecker = null;
var valToMove;    // the amount sum of steps to make // TODO: MEDIUM: Deprecate it !
var valMoved = 0;    // initial move counter // TODO: MEDIUM: Deprecate it !
var remainedValToStep;
var stepsMade; 
var diceMade;
///////////////////////////////////
// This we will get from the server
var allowedMoves;
var allowedSteps;
var color = '1';
var colorN = Number(color);
var moves = [];   // all moves
// var die1;
// var die2;
// var die3;
// var die4;
///////////////////////////////////


///////////
// UTILS //
///////////


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

// Remove a step from stepsMade
function registerCancelStep(idFromCancelled, idToCancelled) {
    for (let i = 0; i < stepsMade.length; i++) {
        let [idFrom, idTo] = stepsMade[i].entries().next().value;
        // Find a step that is cancelled
        if (idFromCancelled === idTo) {
            // If it is cancelled fully => delete this whole step
            if (idFrom === idToCancelled) {
                stepsMade.splice(i, 1);
            // If it is changed => change this move
            } else {
                stepsMade[i].set(idFrom, idToCancelled);
            };
        };
    };
};

///////////////////////////////////////////////////////////////////////////////////////////////
// PLACE CHECKER FUNCTION //
///////////////////////////////////////////////////////////////////////////////////////////////

// Place a checker into a new field
function placeChecker(idFrom, idTo) {
    let checker = document.getElementById(idFrom).lastChild;
    let newField = document.getElementById(idTo);
    // Restrict steps that are not allowed
    if (!isItAllowedStep(idFrom, idTo)) return;    
    // Place the checker correctly inside the target
    // let checkersInNewField = newField.children.length;
    let checkersInFieldTo = Math.abs(board[idTo]);
    // If the checker goes back to it's field, then move it under the new place
    if (checker.parentNode === newField) {checkersInNewField -= 1};
    // Place the checker correctly in his field under another checkers
    checker.style.removeProperty('top');
    checker.style.removeProperty('bottom');
    if (newField.classList.contains('top')) {
        checker.setAttribute('style', `top: calc(${checkersInFieldTo} * ${CHECKEROVERLAP}%);`);
    } else {
        checker.setAttribute('style', `bottom: calc(${checkersInFieldTo} * ${CHECKEROVERLAP}%);`);
    };
    newField.appendChild(checker);
    // Register this step
    if (idFrom < idTo) {
        moves[moves.length - 1].steps.push(new Map().set(idFrom, idTo));
    // If it is cancel step
    } else if (idFrom > idTo) {
        // TODO: HIGH: Add cancel moves for: [6, 1] 1 => 6. Allow cancel 6 => 2 (not only 6 => 1)
        registerCancelStep(idFrom, idTo);
        console.log('cancel', stepsMade);
        console.log('cancel', moves);
    };

    
    board[idFrom] -= color;
    board[idTo] += color;
    // Arrange new steps
    rearrangeAllowedFields();
};

///////////////////////////////////////////////////////////////////////////////////////////////

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





// Rearrange stepsMade, diceMade, remainedValToStep
function resetGlobalVariables() {
    // Set stepsMade
    stepsMade = moves[moves.length - 1].steps;    // For convinience
    // Set diceMade
    diceMade = [];
    let valMoved = 0;
    stepsMade.forEach((step) => {
        let [idFrom, idTo] = step.entries().next().value;
        diceMade.push(idTo - idFrom);
        valMoved += idTo - idFrom;
    });
    // Set remainedValToStep
    let valToMove = getDice().filter((die) => {
        return Boolean(die);
    }).reduce((total, num) => {return total + num});
    remainedValToStep = valToMove - valMoved;
};

// Checks whether it is allowed step
// TODO: MEDIUM: Think about different name for this func & that - "isItAllowedStep"
function isStepAllowed(idFrom, die) {
    let idTo = idFrom + die;
    if (
        idTo <= 24
        && ((colorN > 0) === (board[idTo] >= 0))    // if the fieldTo is mine or empty
        && (die <= remainedValToStep)    // for doubles
    ) {
        return true;
    };
    return false;
};

 // Add reversed steps for steps that are already made by a player
function addCancelSteps() {
    if (!allowedSteps.length) return;
    stepsMade.forEach((step) => {
        let [idFrom, idTo] = step.entries().next().value;
        allowedSteps.push(new Map().set(idTo, idFrom));
        // Additional cancellations for big steps when the are double dice
        if (die1 === die2 && idTo - idFrom > die1) {    // i.e. 1 => 16
            microCancelStep = die1;
            while (microCancelStep < idTo - idFrom) {    // i.e. 5 < 16 - 1
                allowedSteps.push(new Map().set(idTo, idTo - microCancelStep));
                microCancelStep += die1;
            };
        };
    });
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
    resetGlobalVariables();

    // TODO: HIGH: 6 подряд перед самой первой фишкой соперника? - запретить такой ход.
    // TODO: HIGH: с головы сколько раз? - реализовать логику (с учетом первого хода)
    
    // TODO: HIGH: Все на поле для выкидывания? - разработать свою логику тут.

    // TODO: HIGH: Make 3 variants: 
        // 1 - first move
        // 2 - usual move (here)
        // 3 - bearing off

    // playersMoves
    allowedSteps = [];
    // If not doubles
    if (die1 !== die2) {
        for (field of Object.entries(board)) {
            if ((colorN > 0) !== (field[1] > 0)) continue;    // If it is not my field
            let idFrom = Number(field[0]);
            // Check a step by the die1
            if (!diceMade.includes(die1) && isStepAllowed(idFrom, die1)) {
                allowedSteps.push(new Map().set(idFrom, idFrom + die1));
            };
            // Check a step by the die2
            if (!diceMade.includes(die2) && isStepAllowed(idFrom, die2)) {
                allowedSteps.push(new Map().set(idFrom, idFrom + die2));
            };
            // Check a step by the die1 + die2
            if (!diceMade.length && isStepAllowed(idFrom, die1 + die2)) {
                allowedSteps.push(new Map().set(idFrom, idFrom + die1 + die2));
            };
        };
    // If doubles
    } else {
        for (field of Object.entries(board)) {
            if ((colorN > 0) !== (field[1] > 0)) continue;    // If it is not my field
            let idFrom = Number(field[0]);
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
    addCancelSteps();
    // console.log(allowedSteps);
};

// Register this move in moves variable
function registerMove() {
    
};

// The main function that arranges allowed steps
// Gathers all possible steps for each of the field
// Map {"1" => ["6", "11", "16", "21"], "12" => ["17", "22"]}
function rearrangeAllowedFields() {
    allowedFields = new Map();
    rearrangeAllowedSteps();    // this is a source for creating allowedFields
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
    // console.log(allowedFields);
    // Restrict any other steps when the move is done
    if (!allowedFields.size) {
        console.log('Move is complete.');
        registerMove();
        // console.log(moves);
        // changeTurn();
    };
};


function changeTurn() {
    removeHoverNClickEvents();
    color = String(-color);
    rollDice();
    letMeMakeMyStep();
};


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
    moves.push({
        color: colorN,
        dice: [die1, die2],
        steps: []
    });
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


