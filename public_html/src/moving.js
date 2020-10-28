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

// Register in moves a step back
function registerStepBack(idFromCancelled, idToCancelled) {
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

    // console.log('stepsMade BACK', stepsMade);

};

// Register in moves a step forward
function registerStepForward(idFromMade, idToMade) {
   // Trying to find a step which could be a part of a new big step
   // prev. 1 => 3 and now 3 => 5. So we change pprev step to 1 => 5
    for (let i = 0; i < stepsMade.length; i++) {
        let [idFrom, idTo] = stepsMade[i].entries().next().value;
        // Find a step that is cancelled
        if (idTo === idFromMade) {
            stepsMade[i].set(idFrom, idToMade);
            return;
        };
    };
    // If we failed to find a first part of a new step =>
    // just register this step
    moves[moves.length - 1].steps.push(new Map().set(idFromMade, idToMade));
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
    if (checker.parentNode === newField) {checkersInFieldTo -= 1};
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
    idFrom = Number(idFrom);
    idTo = Number(idTo);
    // If it is a step forward (change a previous step or it is a new step)
    if (idFrom < idTo) {
        registerStepForward(idFrom, idTo);
    // If it is a step back (change or cancel at all)
    } else if (idFrom > idTo) {
        registerStepBack(idFrom, idTo);
    };
    board[idFrom] -= colorN;
    board[idTo] += colorN;
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


// If the field is rival's
function isTheFieldRivals(fieldId) {
    return ((colorN > 0) !== (board[fieldId] >= 0));
};


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
    // Empty allowedSteps
    allowedSteps = [];
};

// Checks if there was a move from the fieldId 1
function wasThereAStepFromTheHeadField() {
    for (step of stepsMade) {
        let [idFrom, _] = step.entries().next().value;
        if (idFrom === 1) return true;
    };
    return false;
};

// Checks whether it is allowed step
// TODO: MEDIUM: Think about different name for this func & that - "isItAllowedStep"
function isStepAllowed(idFrom, die) {
    let idTo = idFrom + die;
    // Restrict getiing twice a checker from the head
    if (wasThereAStepFromTheHeadField() && idFrom === 1 && moves.length > 2) return false;
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
    // Add cancel steps
    stepsMade.forEach((step) => {
        let [idFrom, idTo] = step.entries().next().value;
        allowedSteps.push(new Map().set(idTo, idFrom));
        // Add an ability to change a step (make a step back with another dice)
        if (idTo - idFrom === die1) {
            allowedSteps.push(new Map().set(idTo, idFrom + die2));
        } else {
            allowedSteps.push(new Map().set(idTo, idFrom + die1));
        };
        // Additional cancellations for big steps when the are double dice
        if (die1 === die2 && idTo - idFrom > die1) {    // i.e. 1 => 16
            if (moves.length < 2) return;    // 3-3 hardcoded
            microCancelStep = die1;
            while (microCancelStep < idTo - idFrom) {    // i.e. 5 < 16 - 1
                allowedSteps.push(new Map().set(idTo, idTo - microCancelStep));
                microCancelStep += die1;
            };
        };
    });
};

// Add allowed steps for unique dice
function addAllowedStepsForUniqueDice(idFrom) {
    let isSumAllowed = false;
    // Check a step by the die1
    if (!diceMade.includes(die1) && isStepAllowed(idFrom, die1)) {
        allowedSteps.push(new Map().set(idFrom, idFrom + die1));
        isSumAllowed = true;
    };
    // Check a step by the die2
    if (!diceMade.includes(die2) && isStepAllowed(idFrom, die2)) {
        allowedSteps.push(new Map().set(idFrom, idFrom + die2));
        isSumAllowed = true;
    };
    // Check a step by the die1 + die2
    if (!diceMade.length && isSumAllowed && isStepAllowed(idFrom, die1 + die2)) {
        allowedSteps.push(new Map().set(idFrom, idFrom + die1 + die2));
    };
};

// Add allowed steps for doubles
function addAllowedStepsForDoubles(idFrom) {
    // Check a step by a single die
    if (isStepAllowed(idFrom, die1)) {
        allowedSteps.push(new Map().set(idFrom, idFrom + die1));
        // Check a step by a doubled die
        if (isStepAllowed(idFrom, die1 * 2)) {
            allowedSteps.push(new Map().set(idFrom, idFrom + die1 * 2));
            // Check a step by a tripled die
            if (isStepAllowed(idFrom, die1 * 3)) {
                allowedSteps.push(new Map().set(idFrom, idFrom + die1 * 3));
                // Check a step by a quadrupled die
                if (isStepAllowed(idFrom, die1 * 4)) {
                    allowedSteps.push(new Map().set(idFrom, idFrom + die1 * 4));
                };
            };
        };
    };
};

// Checks if all my checkers are in the fields to bearing off
function isItBearingOff() {
    // Get all my feilds from 19 to 24 and count the sum
    let homeSum = Object.entries(board).slice(18, 24)
        .map((x) => x[1])    // get only checkers' values without fieldIds
        .filter(checkers => (colorN > 0 === checkers > 0))    // Get only my color's checkers
    if (!homeSum.length) return false;
    homeSum = homeSum.reduce((sum, checkers) => sum + checkers);    // count the sum
    return (Math.abs(homeSum) === 15);
};

// Add moves variations for the first move some doubles 3-3 & some another cases
function addSpecialStepsForTheFirstMoveSomeSpecialDoubles() {
    // This cases are very unique.
    // So I decided to hardcode them.
    // It will be much more readible!
    // If there were no step yet
    let idFrom = 1;
    if (!stepsMade.length) {
        // A new step
        allowedSteps.push(new Map().set(idFrom, idFrom + die1));
        allowedSteps.push(new Map().set(idFrom, idFrom + die1 * 2));
        allowedSteps.push(new Map().set(idFrom, idFrom + die1 * 3));
    // If it was a step already
    } else {
        let [_, idToMade] = stepsMade[0].entries().next().value;
        // If it was 1=>6 step
        if (idToMade === idFrom + die1 * 1) {
            // A new step
            allowedSteps.push(new Map().set(idFrom, idFrom + die1 * 3));
            // A cancel/change step
            allowedSteps.push(new Map().set(idToMade, idToMade + die1));
            allowedSteps.push(new Map().set(idToMade, idToMade + die1 * 2));
        // If it was 1=>11 step
        } else if (idToMade === idFrom + die1 * 2) {
            // A new step
            allowedSteps.push(new Map().set(idFrom, idFrom + die1 * 2));
            // A cancel/change step
            allowedSteps.push(new Map().set(idToMade, idToMade - die1));
            allowedSteps.push(new Map().set(idToMade, idToMade + die1));
            // If it was 1=>10 step
        } else if (idToMade === idFrom + die1 * 3) {
            // A new step
            allowedSteps.push(new Map().set(idFrom, idFrom + die1));
            // A cancel/change step
            allowedSteps.push(new Map().set(idToMade, idToMade - die1));
            allowedSteps.push(new Map().set(idToMade, idToMade - die1 * 2));
        };  
    };
};

// Add moves variations for the second move some dice: 5-3 & 6-2 after the rival's 5-5
function addSpecialStepsForTheSecondMove() {
    // This cases are very unique.
    // So I decided to hardcode them.
    // It will be much more readible!
    // If there were no step yet
    let idFrom = 1;
    if (!stepsMade.length) {
        // A new step
        allowedSteps.push(new Map().set(idFrom, idFrom + die1));
        allowedSteps.push(new Map().set(idFrom, idFrom + die2));
    // If it was a step already
    } else {
        let [_, idToMade] = stepsMade[0].entries().next().value;
        // If it was 1=>3 step
        if (idToMade === idFrom + Math.min(die1, die2)) {
            // A new step
            allowedSteps.push(new Map().set(idFrom, idFrom + Math.max(die1, die2)));
            // A change step
            allowedSteps.push(new Map().set(idToMade, idFrom + Math.max(die1, die2)));
        // If it was 1=>11 step
        } else if (idToMade === idFrom + Math.max(die1, die2)) {
            // A new step
            allowedSteps.push(new Map().set(idFrom, idFrom + Math.min(die1, die2)));
            // A cancel/change step
            allowedSteps.push(new Map().set(idToMade, idFrom + Math.min(die1, die2)));
        };
    };
};

// Arrange allowed steps for the first move
function arrangeAllowedStepsForTheFirstMove() {
    let idFrom = 1;
    // If unique dice
    if (die1 != die2) {
        if (!stepsMade.length) {
            allowedSteps.push(new Map().set(idFrom, idFrom + die1 + die2));
        };
    // If doubles
    } else {
        // If it is the first step & a usual doubles
        if (!stepsMade.length && [1, 2, 5].includes(die1)) {
            allowedSteps.push(new Map().set(idFrom, idFrom + die1 * 4));
        // Exception for 3, 4 & 6 => two steps from the head are allowed
        } else if (stepsMade.length < 2) {
            if (die1 === 3) {
                addSpecialStepsForTheFirstMoveSomeSpecialDoubles();
            } else if (die1 === 4) {
                allowedSteps.push(new Map().set(idFrom, idFrom + die1 * 2));
            } else if (die1 === 6) {
                allowedSteps.push(new Map().set(idFrom, idFrom + die1));
            };
        };
    };
};

// Arrange allowed steps for the second move
function arrangeAllowedStepsForTheSecondMove() {
    let idFrom = 1;

    // Special cases
    
    [prevDie1, prevDie2] = moves[0].dice;
    // Let me take twice a checker from the head
    if (stepsMade.length < 2) {
        // his 2-1 & my 5-5 => move 5-5 twice from the head
        if (isTheFieldRivals(3) && die1 === 5 && die2 === 5) {
            allowedSteps.push(new Map().set(idFrom, idFrom + die1 * 2));
            return;
        // his 6-2/2-2/5-3/4-4 & my 5-5 => move 5-5 twice from the head
        } else if (isTheFieldRivals(21) && die1 === 5 && die2 === 5) {
            addSpecialStepsForTheFirstMoveSomeSpecialDoubles();
            return;
        // Mirrored previous case
        // his 5-5 & my 6-2/5-3/4-4/2-2 => 1=>6 + 1=>2
        } else if (isTheFieldRivals(9)) {
            // my 2-2
            if (die1 === 2 && die2 === 2) {
                addSpecialStepsForTheFirstMoveSomeSpecialDoubles();
                return;
            // my 4-4
            } else if (die1 === 4 && die2 === 4) {
                allowedSteps.push(new Map().set(idFrom, idFrom + die1));
                return;
            // my 5-3
            } else if (die1 === 5 && die2 === 3 || die1 === 3 && die2 === 5) {
                addSpecialStepsForTheSecondMove();
                return;
            // my 6-2
            } else if (die1 === 6 && die2 === 2 || die1 === 2 && die2 === 6) {
                addSpecialStepsForTheSecondMove();
                return;
            };
        };
    };
    // Arrange everything else just like at the 1st move
    arrangeAllowedStepsForTheFirstMove();
};

// Arrange allowed steps for the bearing off
function arrangeAllowedStepsForTheBearingOff() {
    // TODO: HIGH: Все на поле для выкидывания? - разработать свою логику тут.
};




// Arrange allowed steps for the middle of the game
function arrangeAllowedStepsForTheMiddleOfTheGame() {
    // TODO: HIGH: 6 подряд перед самой первой фишкой соперника? - запретить такой ход.
    // playersMoves

    // If not doubles
    if (die1 !== die2) {
        for (field of Object.entries(board)) {
            if ((colorN > 0) !== (field[1] > 0)) continue;    // If it is not my field
            let idFrom = Number(field[0]);
            addAllowedStepsForUniqueDice(idFrom);

        };
    // If doubles
    } else {
        for (field of Object.entries(board)) {
            if ((colorN > 0) !== (field[1] > 0)) continue;    // If it is not my field
            let idFrom = Number(field[0]);
            addAllowedStepsForDoubles(idFrom);
        };
    };  
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


    //////////////////////
    // FOR TEST ONLY
    // ALWAYS THE FIRST MOVE If there was no steps
    ///////////////////////
    if (!stepsMade.length) {
        // Special cases for the 2nd turn:
        // 2-1
        // 6-1
        // 5-5
        moves = [{
            color: -colorN,
            dice: [3, 2],
            steps: []
        }];
        moves.push({
            color: colorN,
            dice: [die1, die2],
            steps: []
        });
    };
    ////////////////////////



    
    // If it is the first move
    if (moves.length === 1) {
        // ArrangeAllowedSteps for the first move
        console.log('1ST MOVE !');
        arrangeAllowedStepsForTheFirstMove();
    // If it is the second move
    } else if (moves.length === 2) {
        // ArrangeAllowedSteps for the second move
        arrangeAllowedStepsForTheSecondMove();
        console.log('2ND MOVE !');
    // If it is bearing off
    } else if (isItBearingOff()) {
        console.log('BEARING OFF !');
        arrangeAllowedStepsForTheBearingOff();
    // If it is middle of the game
    } else {
        arrangeAllowedStepsForTheMiddleOfTheGame();
        addCancelSteps();
    };
    
    // console.log(allowedSteps);
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


// TODO: MEDIUM: Split this file for server - client after moving rules are done !
// TODO: MEDIUM: Reverse a board for a rival !