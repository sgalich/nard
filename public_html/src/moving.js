// Game physics - Checkers moving algorithms

// Define dragability for the checkers
// TODO: Make it optionable - turn on / turn off (for turn / awaiting rival's turn)
var allowedMoves;
const CHECKEROVERLAP = 4.5;

// UTILS

// Unselect all the selected checkers if they exist
function unselectAllCheckers() {
    [].forEach.call(document.getElementsByClassName('selected'), (el) => {
        el.classList.remove('selected');
    });
};

// Select the last checker if it exists
function selectChecker(field) {
    unselectAllCheckers();
    let movingChecker = field.lastChild;
    if (movingChecker) {movingChecker.classList.add('selected')};
};



// TEST ONLY
allowedMoves = [
    [
        {1: 4}
    ],
    [
        {1: 2}, {12: 15}
    ],
];




// Place a checker into a new field
function placeChecker(checker, newField) {




    let fromFieldId = Number(checker.parentNode.getAttribute('id'));
    let toFieldId = Number(newField.getAttribute('id'));
    console.log(toFieldId, fromFieldId);

    socket.emit('isThisOKMove', [fromFieldId, toFieldId]);






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
    unselectAllCheckers();
};

// Unmark selected fields
// function unmarkMarkedFields() {
//     let markedFields = document.getElementsByClassName('marked');
//     while (markedFields.length != 0) {
//         markedFields[0].classList.remove('marked');
//     };
// };




// HOVER => highlight the last checker if it exists
function fieldHover(e) {
    // Check if it is allowed for player to make moves
    // Cancel the previous hover
    let hoveredChecker = document.getElementsByClassName('hovered')
    for (checker of hoveredChecker) {
        checker.classList.remove('hovered');
    };
    // Set a new hover
    let checkerToHover = this.lastChild;
    if (checkerToHover) {
        checkerToHover.classList.add('hovered')
    };
};

// CLICK => move selected checker or select the field's last checker
function fieldClick(e) {
    let selectedChecker = document.querySelector('checker.selected');
    if (selectedChecker) {
        placeChecker(selectedChecker, this);
    } else {selectChecker(this)};
};



// DRAG

// WORKING DRAG: MOBILE + WEB !!!
// TODO: show a ghost correctly on WEb

// For each checker...
// let checkers = document.getElementsByTagName('checker');
// [].forEach.call(checkers, (checker) => {
// });

var draggingChecker = null;

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
            field.addEventListener('mouseover', fieldHover);
            field.addEventListener('mousedown', fieldClick);
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
        field.removeEventListener('mouseover', fieldHover);
        field.removeEventListener('mousedown', fieldClick);
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
