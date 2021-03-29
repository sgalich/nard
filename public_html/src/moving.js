// Game physics - Checkers moving algorithms

// TESTS:
// TODO: MEDIUM: Add some animation to a checkers moving



// const CHECKEROVERLAP = 4.5;
const fields = document.getElementsByClassName('field');
const checkers = document.getElementsByTagName('checker');
// This is for clicking and dragging
var mouseDownCoordinates = [];
// var isCheckerSelectedAtFirst = true;
var shift = checkers[0].getBoundingClientRect().width / 2;
var ghostChecker = null;


///////////
// UTILS //
///////////

// Highlights active dice with bright color
function highlightActiveDice() {

};

// Fade out unactive dice
function fadeOutUnactiveDice() {

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
function isStepInAllowedSteps(idFrom, idTo) {
    if (!idFrom || !idTo) return;
    let foundedStep = getAStepFromAllowedSteps(idFrom, idTo);
    return Boolean(foundedStep);
};

// Find the step that was made
function getAStepFromAllowedSteps(idFrom, idTo) {
    if (!idFrom || !idTo) return;
    for (step of allowedSteps) {
        // If we found the exact this step what was made
        if (step.idFrom === Number(idFrom) && step.idTo === Number(idTo)) {
            return step;
        };
    };
    return;
};


///////////////////////////////////////////////////////////////////////////////////////////////
// PLACE CHECKER FUNCTION //
///////////////////////////////////////////////////////////////////////////////////////////////

// Place a checker into a new field
function placeChecker(step) {
    console.log(step);
    var checker;
    if (step.isBearingOff && step.isReturn) {
        checker = createChecker(step.idTo, colorN);
    } else {
        checker = document.getElementById(step.idFrom).lastChild;
        let newField = document.getElementById(step.idTo);
        // Place the checker correctly inside the target
        let checkersInFieldTo = Math.abs(board[step.idTo]);
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
    };
    step.callback(checker);
};

///////////////////////////////////////////////////////////////////////////////////////////////

// Get all the allowed fieldIds for a particular idFrom
function getAllAllowedIdTosFor(idFrom) {
    let allowedIds = [];
    // Iterate all allowed steps
    for (step of allowedSteps) {
        // If we found a step we were looking for => add it's idTo
        if (step.idFrom === Number(idFrom)) {
            allowedIds.push(step.idTo);
        };
    };
    return allowedIds;
};

// Highlight allowed fields
function highlightAllowedFieldsFor(fieldFrom) {
    let idFrom = Number(fieldFrom.getAttribute('id'));
    removeHighlightFromAllFields();
    for (idTo of getAllAllowedIdTosFor(idFrom)) {
        document.getElementById(idTo).classList.add('allowed');
    };
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

    
    // TODO: Animate the checker placing
    ghostChecker.remove();
};


/////////////////////
// EVENT FUNCTIONS //
/////////////////////

// HOVER

// Mouse enters the field
function mouseEntersField(e) {
    let selectedChecker = document.getElementsByClassName('selected')[0];
    if (!selectedChecker) removeHighlightFromAllFields();
    unmakeAllCheckers('hovered');
    let ghostCheckers = document.getElementsByClassName('ghost')
    if (isMyField(this) && !ghostCheckers.length) {
        highlightAllowedFieldsFor(this);
        makeCheckerAt(this, 'hovered');
    };
};

// Mouse leaves the field
function mouseLeavesField(e) {
    let selectedChecker = document.getElementsByClassName('selected')[0];
    if (!selectedChecker) removeHighlightFromAllFields();
    unmakeAllCheckers('hovered');
};


// CLICK & DRAG

// Mouse down
// Select a checker from a field we allowed to make a step
function mouseClicksField(e) {

    // Checks whether a node is a field (returns this node) or not (returns null)
    function getFieldClicked(node) {
        if (node.nodeName === 'CHECKER') {
            return node.parentNode;
        } else if (node.classList.contains('field')) {
            return node;
        };
        return;
    };

    e.preventDefault();
    // Do nothing if it was not left click
    if (e.which === 2 || e.which === 3) return;
    // Save mouse click coordinates
    mouseDownCoordinates.push({x: e.pageX, y: e.pageY});
    // Check whether the event was on a field or not
    let field = getFieldClicked(e.target);
    if (field) {
        // Unselect a selected checker
        let selectedChecker = document.getElementsByClassName('selected')[0];
        if (selectedChecker) {
            unmakeAllCheckers('selected');
            removeHighlightFromAllFields();
        };
        // Select a new checker
        if (isMyField(field) && field.lastChild) {
            highlightAllowedFieldsFor(field);
            makeCheckerAt(field, 'selected');
            addDragEventListeners(field.lastChild, e.pageX, e.pageY);
        };
    } else {
        unmakeAllCheckers('selected');
        removeHighlightFromAllFields();
    };
};

// 

// // old function
// function mouseClicksField(e) {
//     e.preventDefault();
//     // Do nothing if it was not left click
//     if (e.which === 2 || e.which === 3) return;
//     // Save mouse click coordinates
//     mouseDownCoordinates.push({x: e.pageX, y: e.pageY});
//     // Check whether the event was on a field or not
//     let field = getFieldClicked(e.target);
//     if (!field) return;
//     let selectedChecker = document.getElementsByClassName('selected')[0];
//     // Just selected a new field to start a step
//     if (!selectedChecker) {
//         if (isMyField(field)) {
//             makeCheckerAt(field, 'selected');
//             highlightAllowedFieldsFor(field);
//             addDragEventListeners(field.lastChild, e.pageX, e.pageY);
//         };
//     // Trying to make a step or select another checker
//     } else if (selectedChecker) {
//         let idFrom = selectedChecker.parentNode.getAttribute('id');
//         let idTo = field.getAttribute('id');
//         // If it is a valid move => make a step
//         if (isStepInAllowedSteps(idFrom, idTo)) {
//             placeChecker(idFrom, idTo);
//             unmakeAllCheckers('selected');
//             removeHighlightFromAllFields();
//         // Select a checker again
//         } else if (field.lastChild) {
//             // Select the same checker
//             // Now: unselect current checker
//             if (selectedChecker === field.lastChild) {
//                 // Check is it an another attempt to drag => make drag, then unselect
//                 // or it is an unchecking click => unselect the checker
//                 addDragEventListeners(field.lastChild, e.pageX, e.pageY);
//             // Select another checker
//             } else if (isMyField(field)) {
//                 unmakeAllCheckers('selected');
//                 highlightAllowedFieldsFor(field);
//                 makeCheckerAt(field, 'selected');
//                 addDragEventListeners(field.lastChild, e.pageX, e.pageY);
//             };
//         // An empty field
//         } else {
//             unmakeAllCheckers('selected');
//         };         
//     };
// };

// Util adds a new ghost checker which actually player drags
function addDragEventListeners(checker, x, y) {
    createGhostChecker(x, y);
    // Make the selected checker transparent
    checker.classList.add('transparent');
    // Listen to the mouse moves
    document.addEventListener('mousemove', mouseMovesWhenClicked);
    document.addEventListener('touchmove', mouseMovesWhenClicked);
};

// Mouse moves when clicked
function mouseMovesWhenClicked(e) {
    
    // TODO: Fix bug: center ghost checker position when dragging
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

    // Finds the id of the field with selected checker or returns null
    function findIdFrom() {
        let selectedChecker = document.getElementsByClassName('selected')[0];
        if (selectedChecker) {
            return selectedChecker.parentNode.getAttribute('id');
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

    // Chooses a field that is the closest to the mouse position
    function chooseTheClosestField(fieldFrom, x, y) {

        // Counts the distance between two points, like ([34, 34] & [234, 323])
        function countDistanceBetween(a, b) {
            return ((b[0] - a[0]) ** 2 + (b[1] - a[1]) ** 2) ** 0.5;
        };



        



        let idFrom = fieldFrom.getAttribute('id');
        var theClosestField = fieldFrom;
        var distance = countDistanceBetween(getFieldCenter(fieldFrom), [x, y]);
        let allowedIds = getAllAllowedIdTosFor(idFrom);
       
       
        
        

        if (!allowedIds.length) return theClosestField;
        for (idTo of allowedIds) {
            let field = document.getElementById(idTo);
            let newDistance = countDistanceBetween(getFieldCenter(field), [x, y]);

            socket.emit('chooseTheClosestField', idTo, distance, newDistance);

            if (newDistance < distance) {
                theClosestField = field;
                distance = newDistance;
            };
            socket.emit('chooseTheClosestField', theClosestField, distance);
        };
        return theClosestField;
    };

    e.preventDefault();
    // Do nothing if it was not left click
    if (e.which === 2 || e.which === 3) return;
    // Do nothing if it was not a drug
    if (!ghostChecker) return;
    let idFrom = findIdFrom();
    // Do nothing if it is not a player's field
    if (!idFrom) return;
    let fieldFrom = document.getElementById(idFrom);
    // Place the checker at the closest valid field
    // TODO: Make throwing - calculate direction, continue it and place checker there (& save the speed)
    let fieldTo = chooseTheClosestField(fieldFrom, e.pageX, e.pageY);
    // Place the checker to the field
    let idTo = fieldTo.getAttribute('id');
    // Remove a dragging ghost checker from the board


    // document.getElementById('hint').innerHTML = idTo;
    // let allowedIdTo = '';
    // for (step in allowedSteps) allowedIdTo += `- ${step.idTo}`;
    // document.getElementById('hint').innerHTML = allowedIdTo;
    // socket.emit('tryingToMakeAStep', allowedSteps, idFrom, idTo);






    // A valid step => place a checker
    let step = getAStepFromAllowedSteps(idFrom, idTo);
    if (step) {
        placeChecker(step);
        removeHighlightFromAllFields();
        unmakeAllCheckers('selected');
    } else if (idFrom != idTo) {
            unmakeAllCheckers('selected');
            removeHighlightFromAllFields();
    };
    animatePlacingChecker(e.pageX, e.pageY);
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
document.ondragend = function() {
    return false;
};

// Restrict a right mouse click on the board
document.getElementById('board').addEventListener('contextmenu', (e) => {
    e.preventDefault();
});

// Cancels the last step
function cancelStep(e) {
    isMoveFinished = true;
    // Find this step
    let stepsToCancel = moves[moves.length - 1].steps;
    stepsToCancel = stepsToCancel.filter(step => {return !step.isReturn && !step.isCancelled});
    let lastStep = stepsToCancel[stepsToCancel.length - 1];
    lastStep.isCancelled = true;
    // Cancel the step
    let cancellationStep = {
        idFrom: lastStep.idTo,
        idTo: lastStep.idFrom,
        dice: lastStep.dice,
        callback: lastStep.callback,
        isBearingOff: lastStep.isBearingOff,
        isReturn: true
    };
    placeChecker(cancellationStep);
};

// Deactivates return button
function deactivateReturnButton() {
    let returnButton = document.querySelector('.button.return');
    returnButton.classList.remove('active');
    returnButton.classList.add('unactive');
    returnButton.removeEventListener('click', cancelStep);
    returnButton.removeEventListener('touchstart', cancelStep);
};

// Add events to highlight allowed steps
function addHoverNClickEvents() {

    // Activates return button if there were some previous steps
    function activateReturnButton() {
        let returnButton = document.querySelector('.button.return');
        if (moves.length) {
            var stepsToCancel = moves[moves.length - 1].steps;
        } else return;
        stepsToCancel = stepsToCancel.filter(step => {return !step.isReturn && !step.isCancelled});
        // Do not activate the button if there was no steps made
        if (!stepsToCancel.length) {
            deactivateReturnButton();
            return;
        };
        // Change button style
        returnButton.classList.remove('unactive');
        returnButton.classList.add('active');
        // Add event - cancel the last step
        returnButton.addEventListener('click', cancelStep);
        returnButton.addEventListener('touchstart', cancelStep);
    };

    // Remove a ghost checker before start to make any new steps
    if (ghostChecker) ghostChecker.remove();
    // Activate return button
    activateReturnButton();
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
    // Remove a ghost checker before start to make any new steps
    if (ghostChecker) ghostChecker.remove();
    // Deactivate return button
    deactivateReturnButton();
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
