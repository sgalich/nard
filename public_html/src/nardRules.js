// Game physics - Checkers moving algorithms

// TESTS:
// TODO: TEST: cursor: grab on field/checker when click/drag - ???
// TODO: HIGH: Make normal rules to make steps


// TODO: MEDIUM: Split this file for server - client after moving rules are done !
// TODO: MEDIUM: Reverse a board for a rival !
// TODO: MEDIUM: MAKE TRANSPARENT RIVAL'S CHECKERS ON TH FIELD #1 when bearing-off
// TODO: MEDIUM: Make cancel steps here as idFrom<=idTo (reversed) - highlight them with anothe color (i.e. yellow)


///////////////////////////////////
// This we will get from the server

var colorN = 1;
var color = String(colorN);
///////////////////////////////////

// If the field is rival's
function isTheFieldRivals(fieldId, brd=board) {
    return ((colorN > 0) !== (brd[fieldId] >= 0));
};

// If the field is mine
function isTheFieldMine(fieldId, brd=board) {
    return ((colorN > 0) === (brd[fieldId] > 0));
};

// Rearrange stepsMade, diceMade, remainedValToStep
function resetGlobalVariables() {
    stepsMade = moves[moves.length - 1].steps;    // For convinience
    // Set diceMade
    diceMade = [];
    let valMoved = 0;
    stepsMade.forEach((step) => {
        let [idFrom, idTo] = step.entries().next().value;
        diceMade.push(idTo - idFrom);
        valMoved += idTo - idFrom;
    });
    // dice = getDice();    // dice with active/uncative dice values
    // Set remainedValToStep
    let valToMove = dice
        .map((x) => x.val)
        .filter((die) => {return Boolean(die)})
        .reduce((total, num) => {return total + num});
    remainedValToStep = valToMove - valMoved;
    // Empty allowedSteps
    allowedSteps = [];
    allowedStepsOld = [];
};

// Checks if there was a move from the fieldId 1
function wasThereAStepFromTheHeadField() {
    for (step of stepsMade) {
        let [idFrom, _] = step.entries().next().value;
        if (idFrom === 1) return true;
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
    // let idTo = idFrom + die;
    // Restrict getiing twice a checker from the head
    if (wasThereAStepFromTheHeadField() && idFrom === 1 && moves.length > 2) return false;
    if (
        idTo <= 24
        // && !isTheFieldRivals(idTo)    // if the fieldTo is mine or empty
        && !isTheFieldRivals(idTo)
        // && ((colorN > 0) === (board[idTo] >= 0))    // if the fieldTo is mine or empty
        // && (die <= remainedValToStep)    // for doubles
    ) {
        return true;
    };
    return false;
};

// Add reversed steps for steps that are already made by a player
function addCancelSteps() {
    if (!allowedStepsOld.length) return;
    // Add cancel steps
    stepsMade.forEach((step) => {
        let [idFrom, idTo] = step.entries().next().value;
        allowedStepsOld.push(new Map().set(idTo, idFrom));
        // Add an ability to change a step (make a step back with another dice)
        if (idTo - idFrom === die1) {
            allowedStepsOld.push(new Map().set(idTo, idFrom + die2));
        } else {
            allowedStepsOld.push(new Map().set(idTo, idFrom + die1));
        };
        // Additional cancellations for big steps when the are double dice
        if (die1 === die2 && idTo - idFrom > die1) {    // i.e. 1 => 16
            if (moves.length < 2) return;    // 3-3 hardcoded
            microCancelStep = die1;
            while (microCancelStep < idTo - idFrom) {    // i.e. 5 < 16 - 1
                allowedStepsOld.push(new Map().set(idTo, idTo - microCancelStep));
                microCancelStep += die1;
            };
        };
    });
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
    // If unique dice
    } else if (dice[0].val !== dice[1].val) {
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

// Register in moves a step back
function addToStepsMadeStepBack(step) {
    // If not bearing Off => a step cancelled / changed
    if (isItBearingOff()) {
        stepsMade.push(new Map().set(step.idFrom, step.idTo));
    } else {
        for (let i = 0; i < stepsMade.length; i++) {
            let [idFrom, idTo] = stepsMade[i].entries().next().value;
            // Find a step that is cancelled
            if (step.idFrom === idTo) {
                // If it is cancelled fully => delete this whole step
                if (idFrom === step.idTo) {
                    stepsMade.splice(i, 1);
                // If it is changed => change this move
                } else {
                    stepsMade[i].push(new Map().set(idFrom, step.idTo));
                };
            };
        };   
    };
};

// Register in moves a step forward
function addToStepsMadeStepForward(step) {
   // Trying to find a step which could be a part of a new big step
   // prev. 1 => 3 and now 3 => 5. So we change pprev step to 1 => 5
    for (let i = 0; i < stepsMade.length; i++) {
        let [idFrom, idTo] = stepsMade[i].entries().next().value;
        // Find a step that is cancelled
        if (idTo === step.idFrom) {
            stepsMade[i].set(idFrom, step.idTo);
            return;
        };
    };
    // If we failed to find a first part of a new step =>
    // just register this step
    stepsMade.push(new Map().set(step.idFrom, step.idTo));
};

// Register a step made
function addStepToStepsMade(step) {
    // If it is a step forward (change a previous step or it is a new step)
    if (step.idFrom < step.idTo) {
        addToStepsMadeStepForward(step);
    // If it is a step back (change or cancel at all)
    };
    if (step.idFrom > step.idTo) {
        addToStepsMadeStepBack(step);
    };
};

// Add a step to the allowedSteps
function addNewAllowedStep(idFrom, idTo, dice, callback) {

    // does not work!!! TODO: HIGH!
    if (moves.length > 2 && !is6CheckersInARowRuleRespected(idFrom, idTo - idFrom)) return;
    allowedSteps.push({
        idFrom: Number(idFrom),
        idTo: Number(idTo),
        dice: dice,
        callback: callback
    });
    // console.log('here11', allowedSteps);
};

// Deactivate dice with a particular index
function deactivateDice(ind) {
    dice[ind].active = false;
};

// A function that would be called if this step is done
function callbackForBearingOff(checker) {
    checker.remove();    // 1. Animation
    for (ind of this.dice) deactivateDice(ind);    // 2. Dice
    board[this.idFrom] -= colorN;    // 3. Board
    addStepToStepsMade(this);    // 4. History
    rearrangeAllowedSteps();    // 5. Next
};

// A function that would be called if this step is done
function callbackForReplacingChecker(checker) {
    // 1. Animation
    let newField = document.getElementById(this.idTo);
    newField.append(checker);
    // 2. Dice
    for (ind of this.dice) deactivateDice(ind);
    // 3. Board
    // WHERE ARE FROM THESE IDFROM & IDTO ??? But it works for now
    board[this.idFrom] -= colorN;
    board[this.idTo] += colorN;
    // 4. History
    addStepToStepsMade(this);
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
            // Add usual step
            if (isStepAllowed(idFrom, idFrom + die.val)) {
                nextLevelIsAllowed = true;
                // Do not add repeated moves
                if (getAllAllowedIdTosFor(idFrom).includes(idFrom + die.val)) continue;
                addNewAllowedStep(idFrom, idFrom + die.val, [ind], callbackForReplacingChecker);
            // Bearing-off special: straight to the "25"th field
            } else if (isItBearingOff() && idFrom + die.val === 25) {
                // Do not add repeated moves
                if (getAllAllowedIdTosFor(idFrom).includes(finalIdTo)) continue;
                addNewAllowedStep(idFrom, finalIdTo, [ind], callbackForBearingOff);
            };
        };

        // Level 2: DOUBLE DICE: die1 + die2 (this equals to "die * 2" for doubles)
        if (nextLevelIsAllowed && dice[0].active && dice[1].active) {
            nextLevelIsAllowed = false;
            let fieldTo = idFrom + dice[0].val + dice[1].val
            let inds = [0, 1];
            // Put back these inds for doubles
            inds = (dice[3].active) ? [2, 3] : (dice[2].active) ? [1, 2] : inds;
            // Add usual step
            if (isStepAllowed(idFrom, fieldTo)) {
                // Do not add repeated moves
                // if (getAllAllowedIdTosFor(idFrom).includes(idFrom + die.val)) continue;
                nextLevelIsAllowed = true;
                addNewAllowedStep(idFrom, fieldTo, inds, callbackForReplacingChecker);
            // Bearing-off special: straight to the "25"th field
            } else if (isItBearingOff() && fieldTo === 25) {
                // Do not add repeated moves
                // if (getAllAllowedIdTosFor(idFrom).includes(finalIdTo)) continue;
                addNewAllowedStep(idFrom, finalIdTo, inds, callbackForBearingOff);
            };
        };

        // Level 3: TRIPPLE DICE: die * 3 (only for doubles)
        if (nextLevelIsAllowed && dice[0].active && dice[1].active && dice[2].active) {
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
        if (nextLevelIsAllowed && dice[0].active && dice[1].active && dice[2].active) {
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
    resetGlobalVariables();
    // If it is the first move
    if (moves.length === 1) {
        // ArrangeAllowedSteps for the first move
        console.log('\n1ST MOVE !');
        arrangeAllowedStepsForTheFirstMove();
    // If it is the second move
    } else if (moves.length === 2) {
        console.log('\n2ND MOVE !');
        // ArrangeAllowedSteps for the second move
        arrangeAllowedStepsForTheSecondMove();
    } else {
        console.log('\nMIDDLE OF THE GAME!');
        arrangeAllowedStepsForTheMiddleOfTheGame();
        // addCancelSteps();
    };
    addHoverNClickEvents();


    console.log('Turn is Changed');
    console.log('color', color);
    console.log('colorN', colorN);
    console.log('dice', dice);
    console.log('stepsMade', stepsMade);
    console.log('allowedSteps', allowedSteps);
    console.log('moves', moves);
    console.log('board', board);
    console.log('\n');



    // Restrict any other steps when the move is done
    if (!allowedSteps.length) {
        console.log('Move is complete.\n\n');
        if (countMyCheckersInRange(1)) {
            letMeMakeMyStep();
        } else {
            document.getElementById('hint').innerHTML = 'Congratulations!';
        };
        
        // changeTurn();
    };
    //     //////////////////////////////////////////////////////
    //     // test
    //     // dice = [];
    //     // rollDice();
    //     // dice = getDice(die1, die2);
    //     // changeTurn();
    //     //////////////////////////////////////////////////////
    //     // console.log('Turn is Changed');
    //     // console.log('color', color);
    //     // console.log('colorN', colorN);
    //     // console.log('dice', dice);
    //     // console.log('stepsMade', stepsMade);
    //     // console.log('allowedSteps', allowedSteps);
    //     // console.log('moves', moves);
    //     // console.log('board', board);
    //     // console.log('\n');



    //     console.log('BEFORE Turn is Changed');
    //     console.log('BEFORE color', color);
    //     console.log('BEFORE colorN', colorN);
    //     console.log('BEFORE dice', dice);
    //     console.log('BEFORE stepsMade', stepsMade);
    //     console.log('BEFORE allowedSteps', allowedSteps);
    //     console.log('BEFORE moves', moves);
    //     console.log('BEFORE board', board);
    //     console.log('\n');



    //     removeHoverNClickEvents();

    //     // Change me
    //     color = String(-color);
    //     colorN = -colorN;
    
    //     // Flip the board
    //     board = getReversedBoard(board);
    //     renderCheckers(board);
    //     rollDice();
    //     moves.push({
    //         color: colorN,
    //         dice: [die1, die2],
    //         steps: []
    //     });
    //     stepsMade = [];
    //     rearrangeAllowedSteps();
        

    //     console.log('Turn is Changed');
    //     console.log('color', color);
    //     console.log('colorN', colorN);
    //     console.log('dice', dice);
    //     console.log('stepsMade', stepsMade);
    //     console.log('allowedSteps', allowedSteps);
    //     console.log('moves', moves);
    //     console.log('board', board);
    //     console.log('\n');


    // };
};

// function changeTurn() {
//     removeHoverNClickEvents();

//     // Change me
//     color = String(-color);
//     colorN = -colorN;

//     // Flip the board
//     board = getReversedBoard(board);
//     renderCheckers(board);

//     letMeMakeMyStep();
// };

// The main function that let player to make a move
function letMeMakeMyStep() {
    rollDice();
    moves.push({
        color: colorN,
        dice: [die1, die2],
        steps: []
    });
    // board = (colorN < 0) ? getReversedBoard(board) : board;
    // renderCheckers(board);
    rearrangeAllowedSteps();
};

// Count dice - what else to move
function setDice(die1, die2) {
    let die3, die4;
    die3 = die4 = (die1 === die2) ? die1 : undefined;
    // Get dice with active & unactive values
    dice = [
        {val: die1, active: true},
        {val: die2, active: true},
        {val: die3, active: true},
        {val: die4, active: true}
    ];
    // Make some dice values unactive
    stepsMade = (moves.length) ? moves[moves.length - 1].steps : [];    // For convinience
    for (die of dice) {if (!die.val) die.active = false};
};



///////////////////
// FOR TEST ONLY //
///////////////////


function rollDice() {
    die1 = Math.floor(Math.random() * 6) + 1;
    die2 = Math.floor(Math.random() * 6) + 1;
    setDice(die1, die2);
    renderDice();
};

document.getElementById('diceBox').onclick = function startTheGame() {
    // die1 = Math.floor(Math.random() * 6) + 1;
    // die2 = Math.floor(Math.random() * 6) + 1;     
    // rollDice();
    // dice = getDice(die1, die2);



    // board = getReversedBoard(board);
    letMeMakeMyStep();
};

// board = {
//     1: 15,
//     2: 0,
//     3: 0,
//     4: 0,
//     5: 0,
//     6: 0,
//     7: 0,
//     8: 0,
//     9: 0,
//     10: 0,
//     11: 0,
//     12: 0,
//     13: -15,
//     14: 0,
//     15: 0,
//     16: 0,
//     17: 0,
//     18: 0,
//     19: 0,
//     20: 0,
//     21: 0,
//     22: 0,
//     23: 0,
//     24: 0
// };

// document.getElementById('hint').onclick = function startTheGame() {
//     // die1 = Math.floor(Math.random() * 6) + 1;
//     // die2 = Math.floor(Math.random() * 6) + 1;     
//     // rollDice();
//     // dice = getDice(die1, die2);
//         // CHANGE TURN
//     removeHoverNClickEvents();

//     // Change me
//     color = String(-color);
//     colorN = -colorN;

//     // Flip the board
//     board = getReversedBoard(board);
//     renderCheckers(board);
    
//     stepsMade = [];


//     letMeMakeMyStep();
// };

// letMeMakeMyStep();