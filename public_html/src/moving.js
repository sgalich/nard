// Game physics - Checkers moving algorithms

// Define dragability for the checkers
// TODO: Make it optionable - turn on / turn off (for turn / awaiting rival's turn)

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

// Place a checker into a new field
function placeChecker(checker, newField) {
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


// EVENTS

// HOVER => highlight the last checker if it exists
function fieldHover(e) {
    let hoveredChecker = document.getElementsByClassName('hovered')
    for (checker of hoveredChecker) {
        checker.classList.remove('hovered');
    };
    let checkerToHover = this.lastChild;
    if (checkerToHover) {
        checkerToHover.classList.add('hovered')
    };
};

// CLICK => move selected checker or select the field's last checker
function fieldClick(e) {
    let selectedChecker = document.getElementsByTagName('checker').getElementsByClassName('selected')[0];
    if (selectedChecker) {
        placeChecker(selectedChecker, this);
    } else {selectChecker(this)};
};

// Call all this two functions above
var fields = document.getElementsByClassName('field');
for (field of fields) {
    field.addEventListener('mouseover', fieldHover);
    field.addEventListener('mousedown', fieldClick);
};


// DRAG
// TODO: show a ghost correctly

var draggingChecker = null;

// Dragstart
function dragstart(e) {
    unselectAllCheckers();
    draggingChecker = e.target.parentNode.lastChild;
    selectChecker(e.target.parentNode);
};
document.addEventListener('dragstart', dragstart);

// Dragover
function dragover(e) {
    if(draggingChecker) {
        e.preventDefault();
    };
};
document.addEventListener('dragover', dragover);

// Drop
function drop(e) {
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
    let checkerColor = draggingChecker.getAttribute('color')
    if (NewField.lastChild && NewField.lastChild.getAttribute('color') != checkerColor) {
        return;
    }; 
    // Place the checker correctly inside the target
    let checkersInNewField = NewField.children.length;
    // If the checker goes back to it's field, then move it under the new place
    if (draggingChecker.parentNode === NewField) {
        checkersInNewField -= 1;
    }
    draggingChecker.style.removeProperty('top');
    draggingChecker.style.removeProperty('bottom');
    if (NewField.classList.contains('top')) {
        draggingChecker.setAttribute('style', `top: calc(${checkersInNewField} * ${CHECKEROVERLAP}%);`);
    } else {
        draggingChecker.setAttribute('style', `bottom: calc(${checkersInNewField} * ${CHECKEROVERLAP}%);`);
    };
    NewField.appendChild(draggingChecker);
    unselectAllCheckers();
};
document.addEventListener('drop', drop);

// Dragend
function dragend(e) {
    draggingChecker = null;
};
document.addEventListener('dragend', dragend);


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













// module.exports.startGame = startGame;
// startGame();
