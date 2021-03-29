// TESTS:
// TODO: TEST: cursor: grab on field/checker when click/drag - ???


// TODO: HIGH: Restrict half-moves when it is possible to a full move


// TODO: MEDIUM: Split this file for server - client after moving rules are done !
// TODO: MEDIUM: ??? MAKE TRANSPARENT RIVAL'S CHECKERS ON TH FIELD #1 when bearing-off
// TODO: MEDIUM: Make cancel steps


///////////////////////////////////
// This we will get from the server
// var dice;
// var board;
// var allowedSteps;
// var moves = [];    // all moves
// var stepsMade;    // part of the last move - steps that are made in this move

// var colorN;
// var color;

// var colorN = 1;
// var color = String(colorN);
///////////////////////////////////

// If the field is rival's
function isTheFieldRivals(fieldId, brd=board) {
    if (brd[fieldId] === 0) return false;
    return (Math.sign(colorN) !== Math.sign(brd[fieldId]));
};

// If the field is mine
function isTheFieldMine(fieldId, brd=board) {
    if (brd[fieldId] === 0) return false;
    return (Math.sign(colorN) === Math.sign(brd[fieldId]));
};

// Rearrange stepsMade, diceMade, allowedSteps
function resetGlobalVariables() {
    isMoveFinished = false;
    if (moves.length) {
        stepsMade = moves[moves.length - 1].steps;    // For convinience
    } else {
        stepsMade = [];
    };
    // Set diceMade
    diceMade = [];
    // Empty allowedSteps
    allowedSteps = [];
};

// Checks if there was a move from the fieldId 1
function wasThereAStepFromTheHeadField() {
    for (step of stepsMade) {
        if (step.idFrom === 1) return true;
    };
    return false;
};

// Get the board with reversed ids (1 = 13, 2 = 14, ..., 12 = 24, 13 = 1, ..., 24 = 12)
function getReversedBoard(brd) {
    // Reverse id for the board
    function getReversedId(fieldId) {
        let newId = (Number(fieldId) + 12) % 24;
        if (newId === 0) newId = 24;
        return newId;
    };
    let reversedBoard = {};
    for ([fieldId, checkerCount] of Object.entries(brd)) {
        reversedBoard[getReversedId(fieldId)] = checkerCount;
    };
    return reversedBoard;
};

// Ckecks whether a new step respects a 6-checkers-in-a-row rule
function is6CheckersInARowRuleRespected(idFrom, die) {

    // Find the first rival's checker's id
    function findTheFirstRivalsCheckersReversedId(reversedBoard) {
        for ([fieldId, checkerCount] of Object.entries(reversedBoard).reverse()) {
            if (isTheFieldRivals(fieldId, reversedBoard)) return Number(fieldId);
        };
        return 1;
    };

    // Generate a board as if this step is done
    let newBoard = {};
    Object.assign(newBoard, board);
    newBoard[idFrom] -= colorN;
    newBoard[idFrom + die] += colorN;
    // Reverse ids of this "future board"
    let reversedBoard = getReversedBoard(newBoard);
    // Find rival's checker with the highest id
    let firstRivalsCheckerId = findTheFirstRivalsCheckersReversedId(reversedBoard);
    // Iterate reversed board to find my longest checkers chain
    let myLongestChain = 0;
    for ([fieldId, checkerCount] of Object.entries(reversedBoard)) {
        // Skip everything before the first rival's checker
        if (Number(fieldId) <= firstRivalsCheckerId) continue;
        if (isTheFieldMine(fieldId, reversedBoard)) {
            myLongestChain += 1;
            // If this chain's length is >= 6 => return false
            if (myLongestChain >= 6) return false;
        } else {
            myLongestChain = 0;
        };
    };
    return true;
};

// Checks whether it is allowed step
function isStepAllowed(idFrom, idTo) {
    // Restrict getting twice a checker from the head
    if (wasThereAStepFromTheHeadField() && idFrom === 1 && moves.length > 2) return false;
    if (idTo <= 24 && !isTheFieldRivals(idTo)) {
        return true;
    };
    return false;
};

// Count how many my checkers on the fields range
function countMyCheckersInRange(idFrom, idTo=24) {
    let checkersInRange = Object.entries(board)
        .slice(Number(idFrom) - 1, Number(idTo))
        .filter(x => isTheFieldMine(x[0]));    // Get only my color's checkers
    if (!checkersInRange.length) return 0;
    checkersInRange = checkersInRange
        .map((x) => x[1])    // get only checkers' values without fieldIds
        .reduce((acc, chckrs) => acc + chckrs);
    return checkersInRange;
};

// Checks if all my checkers are in the fields to bearing off
function isItBearingOff() {
    // Get all my feilds from not home (fields from 1 to 18) and count them
    if (!countMyCheckersInRange(1, 18)) return true;    // 0 checkers out of home
    return false;
};

// Get max active die
function getMaxActiveDieIndx() {
    let maxActiveDie = 0;
    let maxActiveDieIndx;
    for (let i = dice.length - 1; i >= 0; i--) {
        if (dice[i].active && dice[i].val > maxActiveDie) {
            maxActiveDie = dice[i].val;
            maxActiveDieIndx = i;
        };
    };
    return maxActiveDieIndx;
};

// Add moves variations for the first move some doubles 3-3 & some another cases
function addSpecialStepsForTheFirstMoveSomeSpecialDoubles() {
    // This cases are very unique.
    // So I decided to hardcode them.
    // It will be much more readible!
    // If there were no step yet
    let idFrom = 1;
    let die = dice[0].val;
    if (dice[3].active) {
        addNewAllowedStep(idFrom, idFrom + die * 1, [3], callbackForReplacingChecker);
        addNewAllowedStep(idFrom, idFrom + die * 2, [2, 3], callbackForReplacingChecker);
        addNewAllowedStep(idFrom, idFrom + die * 3, [1, 2, 3], callbackForReplacingChecker);
    } else if (dice[2].active) {
        addNewAllowedStep(idFrom, idFrom + die * 3, [0, 1, 2], callbackForReplacingChecker);
    } else if (dice[1].active) {
        addNewAllowedStep(idFrom, idFrom + die * 2, [0, 1], callbackForReplacingChecker);
    } else if (dice[0].active) {
        addNewAllowedStep(idFrom, idFrom + die * 1, [0], callbackForReplacingChecker);
    };
};

// Arrange allowed steps for the first move
function arrangeAllowedStepsForTheFirstMove() {
    let idFrom = 1;
    // If unique dice
    if (dice[0].val != dice[1].val) {
        if (!stepsMade.length) {
            addNewAllowedStep(idFrom, idFrom + dice[0].val + dice[1].val, [0, 1], callbackForReplacingChecker);
        };
    // If doubles
    } else {
        let die = dice[0].val;
        if (!dice[0].active) return;    // Move is done
        // If it is 1-1, 2-2 or 5-5 => a usual single step
        if ([1, 2, 5].includes(die)) {
            addNewAllowedStep(idFrom, idFrom + dice[0].val * 4, [0, 1, 2, 3], callbackForReplacingChecker);
        // Exception for 3-3, 4-4 & 6-6 => two steps from the head are allowed
        } else if (dice[0].active) {
            if (die === 3) {
                addSpecialStepsForTheFirstMoveSomeSpecialDoubles();
            } else if (die === 4 && dice[0].active) {
                let inds = [0, 1];
                inds = (dice[2].active) ? [2, 3] : inds;    // Put back these inds for the very first step
                addNewAllowedStep(idFrom, idFrom + dice[0].val * 2, inds, callbackForReplacingChecker);
            } else if (die === 6) {
                let inds = [0, 1];
                inds = (dice[2].active) ? [2, 3] : inds;    // Put back these inds for the very first step
                addNewAllowedStep(idFrom, idFrom + dice[0].val, inds, callbackForReplacingChecker);
            };
        };
    };
};

// Arrange allowed steps for the second move
function arrangeAllowedStepsForTheSecondMove() {
    let idFrom = 1;
    let die1 = dice[0].val;
    let die2 = dice[1].val;
    // If his 5-5
    if (isTheFieldRivals(9)) {
        // my 2-2
        if (die1 === 2 && die2 === 2) {
            addSpecialStepsForTheFirstMoveSomeSpecialDoubles();
        // my 4-4
        } else if (dice[0].active && die1 === 4 && die2 === 4) {
            let inds = [0, 1];
            inds = (dice[2].active) ? [2, 3] : inds;    // Put back these inds for the very first step
            addNewAllowedStep(idFrom, idFrom + dice[0].val, inds, callbackForReplacingChecker);
        // my 5-3
        } else if (die1 === 5 && die2 === 3 || die1 === 3 && die2 === 5) {
            if (dice[0].active) {
                addNewAllowedStep(idFrom, idFrom + dice[0].val, [0], callbackForReplacingChecker);
            };
            if (dice[1].active) {
                addNewAllowedStep(idFrom, idFrom + dice[1].val, [1], callbackForReplacingChecker);
            };
        // my 6-2
        } else if (die1 === 6 && die2 === 2 || die1 === 2 && die2 === 6) {
            if (dice[0].active) {
                addNewAllowedStep(idFrom, idFrom + dice[0].val, [0], callbackForReplacingChecker);
            };
            if (dice[1].active) {
                addNewAllowedStep(idFrom, idFrom + dice[1].val, [1], callbackForReplacingChecker);
            };
        };
    };
    // If unique dice
    if (dice[0].val !== dice[1].val) {
        if (!stepsMade.length) {
            addNewAllowedStep(idFrom, idFrom + dice[0].val + dice[1].val, [0, 1], callbackForReplacingChecker);
        };
    // If doubles
    } else {
        let die = dice[0].val;
        if (!dice[0].active) return;    // Move is done
        // If it is 1-1, 2-2 => a usual single step
        if ([1, 2].includes(die)) {
            addNewAllowedStep(idFrom, idFrom + die * 4, [0, 1, 2, 3], callbackForReplacingChecker);
        // If my 5-5
        } else if (die === 5) {
            // his 2-1 => move 5-5 twice from the head
            if (isTheFieldRivals(16)) {
                let inds = [0, 1];
                inds = (dice[2].active) ? [2, 3] : inds;    // Put back these inds for the very first step
                addNewAllowedStep(idFrom, idFrom + die1 * 2, inds, callbackForReplacingChecker);
            // his 6-2/2-2/5-3/4-4 => move 5-5 twice from the head
            } else if (isTheFieldRivals(21)) {
                addSpecialStepsForTheFirstMoveSomeSpecialDoubles();
            // move the whole 5-5 (4 steps) 
            } else {
                addNewAllowedStep(idFrom, idFrom + dice[0].val * 4, [0, 1, 2, 3], callbackForReplacingChecker);
            };
        // Exception for 3-3, 4-4 & 6-6 => two steps from the head are allowed
        } else if (dice[0].active) {
            if (die === 3) {
                addSpecialStepsForTheFirstMoveSomeSpecialDoubles();
            } else if (die === 4 && dice[0].active) {
                let inds = [0, 1];
                inds = (dice[2].active) ? [2, 3] : inds;    // Put back these inds for the very first step
                addNewAllowedStep(idFrom, idFrom + dice[0].val * 2, inds, callbackForReplacingChecker);
            } else if (die === 6) {
                let inds = [0, 1];
                inds = (dice[2].active) ? [2, 3] : inds;    // Put back these inds for the very first step
                addNewAllowedStep(idFrom, idFrom + dice[0].val, inds, callbackForReplacingChecker);
            };
        };
    };
};

// // Register in moves a step back
// function addToStepsMadeStepBack(step) {
//     // If not bearing Off => a step cancelled / changed
//     if (isItBearingOff()) {
//         stepsMade.push(step);
//     } else {
//         for (let i = 0; i < stepsMade.length; i++) {
//             let idFrom = stepsMade[i].idFrom;
//             let idTo = stepsMade[i].idTo;
//             // Find a step that is cancelled
//             if (step.idFrom === idTo) {
//                 // If it is cancelled fully => delete this whole step
//                 if (idFrom === step.idTo) {
//                     stepsMade.splice(i, 1);
//                 // If it is changed => change this move
//                 } else {
//                     stepsMade[i].idTo = step.idTo;
//                 };
//             };
//         };   
//     };
// };

// // Register in moves a step forward
// function addToStepsMadeStepForward(step) {
//    // Trying to find a step which could be a part of a new big step
//    // prev. 1 => 3 and now 3 => 5. So we change the previous step to 1 => 5
//     for (let i = 0; i < stepsMade.length; i++) {
//         let idFrom = stepsMade[i].idFrom;
//         let idTo = stepsMade[i].idTo;
//         // Find a step that is cancelled
//         if (idTo === step.idFrom) {
//             stepsMade[i].idTo = step.idTo;
//             return;
//         };
//     };
//     // If we failed to find a first part of a new step =>
//     // just register this step
//     stepsMade.push(step);
// };

// // Register a step made
// function addStepToStepsMade(step) {
//     // If it is a step forward (change a previous step or it is a new step)
//     if (step.idFrom < step.idTo) {
//         addToStepsMadeStepForward(step);
//     // If it is a step back (change or cancel at all)
//     };
//     if (step.idFrom > step.idTo) {
//         addToStepsMadeStepBack(step);
//     };
// };

// Add a step to the allowedSteps
function addNewAllowedStep(idFrom, idTo, dice, callback, isBearingOff=false, isReturn=false) {
    if (moves.length > 2 && !is6CheckersInARowRuleRespected(idFrom, idTo - idFrom)) return;
    allowedSteps.push({
        idFrom: Number(idFrom),
        idTo: Number(idTo),
        dice: dice,
        callback: callback,
        isBearingOff: isBearingOff,
        isReturn: isReturn
    });
};

// A function that would be called if this step is done
function callbackForBearingOff(checker) {
    // If it is step forward
    if (!this.isReturn) {
        // 1. Animation
        checker.remove();
        // 2. Dice
        for (ind of this.dice) dice[ind].active = false;
        // TODO: Change the color of the dice
    // If it is cancellation step
    } else {
        for (ind of this.dice) dice[ind].active = true;
    };
    // 3. Board
    board[this.idFrom] -= colorN;
    // 4. History
    stepsMade.push(this);
    // 5. Next
    rearrangeAllowedSteps();
};

// A function that would be called if this step is done
function callbackForReplacingChecker(checker, returnStep=false) {
    // 1. Animation
    let newField = document.getElementById(this.idTo);
    newField.append(checker);
    // 2. Dice
    if (!this.isReturn) {
        for (ind of this.dice) dice[ind].active = false;
        // TODO: Change the color of the dice
    } else {
        for (ind of this.dice) dice[ind].active = true;
    };
    // 3. Board
    // WHERE ARE FROM THESE IDFROM & IDTO ??? But it works for now
    board[this.idFrom] -= colorN;
    board[this.idTo] += colorN;
    // 4. History
    stepsMade.push(this);
    // 5. Next
    rearrangeAllowedSteps();
};

// Arrange allowed steps for the middle of the game
function arrangeAllowedStepsForTheMiddleOfTheGame() {
    let finalIdTo = 1;
    // Usual steps w/ bearing-off specials
    // Iterate through the fields
    for ([idFrom, _] of Object.entries(board)) {
        idFrom = Number(idFrom);
        if (!isTheFieldMine(idFrom)) continue;    // If it is not my field
        let nextLevelIsAllowed = false;
        // Level 1: SINGLE DIE: every single die
        // Iterate through the dice in reversed order
        for (let ind = dice.length - 1; ind >= 0; ind--) {
            let die = dice[ind];
            if (!die.active) continue;
            // Add single-die step
            if (isStepAllowed(idFrom, idFrom + die.val)) {
                nextLevelIsAllowed = true;
                // Do not add repeated moves
                if (getAllAllowedIdTosFor(idFrom).includes(idFrom + die.val)) continue;
                addNewAllowedStep(idFrom, idFrom + die.val, [ind], callbackForReplacingChecker);
            // Bearing-off special: straight to the "25"th field
            } else if (isItBearingOff() && idFrom + die.val === 25) {
                // Do not add repeated moves
                if (getAllAllowedIdTosFor(idFrom).includes(finalIdTo)) continue;
                addNewAllowedStep(idFrom, finalIdTo, [ind], callbackForBearingOff, isBearingOff=true);
            };
        };

        // Level 2: DOUBLE DICE: die1 + die2 (this equals to "die * 2" for doubles)
        if (nextLevelIsAllowed && dice[1].active && dice[0].active) {
            nextLevelIsAllowed = false;
            let fieldTo = idFrom + dice[0].val + dice[1].val
            let inds = [0, 1];
            // Put back these inds for doubles
            inds = (dice[3].active) ? [2, 3] : (dice[2].active) ? [1, 2] : inds;
            // Add usual step
            if (isStepAllowed(idFrom, fieldTo)) {
                nextLevelIsAllowed = true;
                addNewAllowedStep(idFrom, fieldTo, inds, callbackForReplacingChecker);
            // Bearing-off special: straight to the "25"th field
            } else if (isItBearingOff() && fieldTo === 25) {
                addNewAllowedStep(idFrom, finalIdTo, inds, callbackForBearingOff, isBearingOff=true);
            };
        };

        // Level 3: TRIPPLE DICE: die * 3 (only for doubles)
        if (nextLevelIsAllowed && dice[2].active && dice[1].active && dice[0].active) {
            nextLevelIsAllowed = false;
            let fieldTo = idFrom + dice[0].val * 3;
            let inds = [0, 1, 2];
            // Put back these inds for doubles
            inds = (dice[3].active) ? [1, 2, 3] : inds;
            // Add usual step
            if (isStepAllowed(idFrom, fieldTo)) {
                nextLevelIsAllowed = true;
                addNewAllowedStep(idFrom, fieldTo, inds, callbackForReplacingChecker);
            // Bearing-off special: straight to the "25"th field
            } else if (isItBearingOff() && fieldTo === 25) {
                addNewAllowedStep(idFrom, finalIdTo, inds, callbackForBearingOff);
            };
        };

        // Level 4: QUARDRIPPLE DICE die * 4 (only for doubles)
        if (nextLevelIsAllowed && dice[3].active && dice[2].active && dice[1].active && dice[0].active) {
            let fieldTo = idFrom + dice[0].val * 4;
            let inds = [0, 1, 2, 3];
            // Add usual step
            if (isStepAllowed(idFrom, fieldTo)) {
                addNewAllowedStep(idFrom, fieldTo, inds, callbackForReplacingChecker);
            // Bearing-off special: straight to the "25"th field
            } else if (isItBearingOff() && fieldTo === 25) {
                addNewAllowedStep(idFrom, finalIdTo, inds, callbackForBearingOff);
            };
        };
    };

    // Bearing-off super special - go from the closer fields
    // (i.e. bearing off from 24 if the die is 6)
    let maxActiveDieIndx = getMaxActiveDieIndx();
    // Check the whole head
    for (let idFrom = 19; idFrom < 25; idFrom++) {
        if (!isItBearingOff() || maxActiveDieIndx === undefined) break;    // if there are all sice unactive
        if (!isTheFieldMine(idFrom)) continue;
        if (25 - idFrom < dice[maxActiveDieIndx].val) {
            addNewAllowedStep(idFrom, finalIdTo, [maxActiveDieIndx], callbackForBearingOff);
        };
        break;
    };
};



// Get all possible steps according to the board situation
function rearrangeAllowedSteps() {

    // Get rid of unfull steps (Allow only full moves when it is possible)
    // Example:
    // Dice = [6, 2, null, null]
    // Allowed steps: 9=>15, 10=>12, 10=>16
    // 10=>16 needs to be restricted bc we have a full move 9=>15, 10=>12
    // And if we step 10=>16 then we won't be able to step dice=2
    function restrictStepsLeadToUnfullMoveIfFullMoveIsPossible() {

        // Extract from allowed steps idFroms for single steps
        function getIdsFromForSingleSteps() {
            let steps = {'0': new Set(), '1': new Set()};
            for (let step of allowedSteps) {
                if (step.dice.length === 1) {
                    steps[String(step.dice[0])].add(step.idFrom);
                };
            };
            return steps;
        };

        // Checks whether a full move is possible or not
        function isFullMovePossible(steps) {
            // If there is possible to make die1 + die2 with one checker
            for (let step of allowedSteps) {if (step.dice.length === 2) return true};
            // Or if we can step both die1 & die2 in general
            if (steps['0'].size && steps['1'].size) {
                // If we can step from different idFrom
                let difference = new Set([
                    ...[...steps['0']].filter(x => !steps['1'].has(x)),
                    ...[...steps['1']].filter(x => !steps['0'].has(x))
                ]);
                if (difference.size) return true;
                // If we can make both die1 & die2 steps from the same one fieldId
                // and there are multiple checkers on this field
                let union = new Set([...steps['0']].filter(x => steps['1'].has(x)));
                for (idFrom of union) {
                    if (Math.abs(board[idFrom]) > 1) return true;
                };
            };
            return false;
        };
        
        // Function as applicable to non-double dice only
        // And it is applicable only for the first step in the move
        // (later it will be too late to restrict anything)
        // That's why we ain't got no need to check stepsMade
        if (dice[0].val === dice[1].val || !stepsMade.length ) return allowedSteps;
        // And it isn't applicable if there is no opportunity for a full move
        var steps = getIdsFromForSingleSteps();
        if (!isFullMovePossible(steps)) return allowedSteps;
        return allowedSteps.filter((step) => {
            // If we can make both die1 & die2 steps from the same one fieldId
            // and there are multiple checkers on this field
            if (steps['0'].has(step.idFrom)
                && steps['1'].has(step.idFrom)
                && Math.abs(board[idFrom]) > 1) return true;
            // If there is at least one alternative step for another dice
            if (steps['0'].has(step.idFrom)
                && new Set([...steps['1']].filter(x => x != step.idFrom)).size) return true;
            if (steps['1'].has(step.idFrom)
                && new Set([...steps['0']].filter(x => x != step.idFrom)).size) return true;
            
            console.log('filtered step ${step} from allowedSteps:', allowedSteps);
            
            return false;
        });
    };

    // Restricts dice-steps when only full move is avaliable
    // Example:
    // Dice: 1-2
    // allowedStepd: 1=>2 1=>3 1=>4
    // We see that to make full move 1=>4 is the only 1 possibility to make a move,
    // So we don't want to make hints 1=>2 1=>3 because they are usefull.
    function restrictDiceStepsWhenOnlyFullMoveIsAvaliable() {
        // Iterate allowedSteps to get: how many different idFroms & which step has the biggest length?
        let idFroms = new Set();
        let maxLengthStep = {dice: []};
        for (step of allowedSteps) {
            idFroms.add(step.idFrom);
            if (step.dice.length > maxLengthStep.dice.length) maxLengthStep = step;
        };
        if (idFroms.size != 1) return allowedSteps;
        console.log('shrinked allowedSteps to a double-step full move. allowedSteps:', allowedSteps);
        return [maxLengthStep];
    };

    // function finishMove() {
    //     removeHoverNClickEvents();
    //     moveIsDone();
    // };

    resetGlobalVariables();
    // If it is the first move
    if (moves.length === 1) {
        // ArrangeAllowedSteps for the 1st move
        arrangeAllowedStepsForTheFirstMove();
    // If it is the second move
    } else if (moves.length === 2) {
        // ArrangeAllowedSteps for the 2nd move
        arrangeAllowedStepsForTheSecondMove();
    } else {
        arrangeAllowedStepsForTheMiddleOfTheGame();
    };
    // Restrict unfull moves when full move is possible
    allowedSteps = restrictStepsLeadToUnfullMoveIfFullMoveIsPossible();
    // Restrict dice-steps when only full move is possible
    allowedSteps = restrictDiceStepsWhenOnlyFullMoveIsAvaliable();
    addHoverNClickEvents();
    // Restrict any other steps when the move is done
    if (!allowedSteps.length) {
        isMoveFinished = true;
        // setTimeout(moveIsDone, 2000);    // 2 seconds to cancel the move
        removeHoverNClickEvents();
        moveIsDone();
    };
};
