const CHECKEROVERLAP = 5.5


// Place checker at certain field by id
function place_checker(color, id) {
    const field = document.getElementById(id);
    let checker = document.createElement('checker');   // Create a checker
    checker.setAttribute('draggable', 'true');    // make it draggable
    // checker.setAttribute('class', 'unselected');    // make it selectable
    checker.classList.add('unselected');
    checker.classList.add('hvr-pulse-grow');    // hvr-ripple-out
    checker.setAttribute('color', color);
    checker.style.visibility = "visible"
    let checkersInField = field.children.length;
    if (field.classList.contains('top')) {
        checker.setAttribute('style', `top: calc(${checkersInField} * ${CHECKEROVERLAP}%);`);
    } else {
        checker.setAttribute('style', `bottom: calc(${checkersInField} * ${CHECKEROVERLAP}%);`);
    };
    field.appendChild(checker);    // Place checker inside the field
};

// Place checkers
for (let i = 0; i < 15; i++) {
    place_checker('black', 1);
    place_checker('white', 13);
};

// Checker selection & moving
var fields = document.getElementsByClassName('field');
for (field of fields) {
    field.addEventListener('mousedown', function() {
        
        // If it is highlighted field => move checker
        // else: ...

        // Selected field to make a move
        if (this.classList.contains('marked')) {    // if it is allowed to make this move
            let movingChecker = document.getElementsByClassName('selected')[0];
            // Place the checker correctly inside the target
            let checkersInNewField = this.children.length;
            // If the checker goes back to it's field, then move it under the new place
            if (movingChecker.parentNode === this) {
                checkersInNewField -= 1;
            }
            movingChecker.style.removeProperty('top');
            movingChecker.style.removeProperty('bottom');
            if (this.classList.contains('top')) {
                movingChecker.setAttribute('style', `top: calc(${checkersInNewField} * ${CHECKEROVERLAP}%);`);
            } else {
                movingChecker.setAttribute('style', `bottom: calc(${checkersInNewField} * ${CHECKEROVERLAP}%);`);
            };
            this.appendChild(movingChecker);
            console.log('move checker here:', this.id);
            unselectChecker();
        } else {    // Selected a checker to think about a move
            unselectChecker();
            let activeChecker = this.lastChild;
            if (activeChecker != null) {
                checkerSelected(activeChecker);
            };
        };
    });
};

// Select a checker
function checkerSelected(checker) {
    checker.classList.add('selected');
    let selectedId = Number(checker.parentNode.id);
    highlightAllPossibleMoves(selectedId);
};

// Highlight all possible moves
var allPossibleMoves;
function highlightAllPossibleMoves(selectedId) {
    allPossibleMoves = [
        document.getElementById((selectedId + move1) % 24),
        document.getElementById((selectedId + move2) % 24),
        document.getElementById((selectedId + move1 + move2) % 24)
    ];
    allPossibleMoves.filter(field => field != null);
    for (let i = 0; i < allPossibleMoves.length; i++) {
        // 
        allPossibleMoves[i].classList.add('marked');
    };
};

// Unselects the selected checker if it exists
var unselectChecker = function() {
    let selectedChecker = document.getElementsByClassName('selected')[0];
    if (selectedChecker != undefined) {
        selectedChecker.classList.remove('selected');
        unmarkMarkedFields();
    };
};

// Unmark selected fields
function unmarkMarkedFields() {
    let markedFields = document.getElementsByClassName('marked');
    while (markedFields.length != 0) {
        markedFields[0].classList.remove('marked');
    };
};








// WORKING DRAGGING ALGORITHM
// TODO: Remake it with mouseclick
(function() {
    let movingChecker = null;

    // Start dragging
    function dragstart(e) {
        // Set the movingChecker object
        unselectChecker();
        movingChecker = e.target.parentNode.lastChild;
        checkerSelected(movingChecker);
    };
    document.addEventListener('dragstart', dragstart, false);
    document.addEventListener('ondragstart', dragstart);


    // Show dragging checker
    function showDraggingChecker(e) {
        let selectedChecker = document.getElementsByClassName('selected')[0];
        if (selectedChecker != undefined) {
            selectedChecker.style.transform = 'translateY('+(e.clientY-80)+'px)';
            selectedChecker.style.transform += 'translateX('+(e.clientX-100)+'px)';
        };       
    };
    // document.addEventListener('mousemove', showDraggingChecker, false);


    //dragover event to allow the drag by preventing its default
    //ie. the default action of an element is not to allow dragging 
    document.addEventListener('dragover', function(e) {
        if(movingChecker) {
            e.preventDefault();
        }
    }, false);  

    //drop event to allow the element to be dropped into valid targets
    document.addEventListener('drop', function(e) {
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
        let checkerColor = movingChecker.getAttribute('color')
        if (NewField.lastChild && NewField.lastChild.getAttribute('color') != checkerColor) {
            return;
        }; 
        // Place the checker correctly inside the target
        let checkersInNewField = NewField.children.length;
        // If the checker goes back to it's field, then move it under the new place
        if (movingChecker.parentNode === NewField) {
            checkersInNewField -= 1;
        }
        movingChecker.style.removeProperty('top');
        movingChecker.style.removeProperty('bottom');
        if (NewField.classList.contains('top')) {
            movingChecker.setAttribute('style', `top: calc(${checkersInNewField} * ${CHECKEROVERLAP}%);`);
        } else {
            movingChecker.setAttribute('style', `bottom: calc(${checkersInNewField} * ${CHECKEROVERLAP}%);`);
        };
        NewField.appendChild(movingChecker);
    }, false);
    
    //dragend event to clean-up after drop or abort
    //which fires whether or not the drop target was valid
    document.addEventListener('dragend', function(e) {
        unselectChecker();
        movingChecker = null;
    }, false);
})();













function placeTestText() {
    let board = document.getElementById('board');
    let test = document.getElementsByClassName('test')[0];
    let boardCos = board.getBoundingClientRect();
    console.log(board.getBoundingClientRect());
    test.innerHTML = `
    boardCos.bottom: ${boardCos.bottom}
    boardCos.height: ${boardCos.height}
    boa rdCos.top: ${boardCos.top}
    `;
};
// document.addEventListener('click', e => {
//     placeTestText();
// });