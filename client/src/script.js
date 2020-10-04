let CHECKEROVERLAP = 5.5


// place_checker('black', 1);






function checkerUnclick() {
    let checker = document.getElementsByClassName('selected')[0];
    console.log(checker);
    document.addEventListener('click', e => {
        checker.setAttribute('class', 'unselected');    // make it selectable
        // document.removeEventListener('click', checkerUnclick);
    });
};

// Place checker at certain field
function place_checker(color, id) {
    const field = document.getElementById(id);
    let checker = document.createElement('checker');   // Create a black checker
    checker.setAttribute('draggable', 'true');    // make it draggable
    checker.setAttribute('class', 'unselected');    // make it selectable
    checker.setAttribute('color', color);
    checker.style.visibility = "visible"
    let checkersInField = field.children.length;
    if (field.classList.contains('top')) {
        checker.setAttribute('style', `top: calc(${checkersInField} * ${CHECKEROVERLAP}%);`);
    } else {
        checker.setAttribute('style', `bottom: calc(${checkersInField} * ${CHECKEROVERLAP}%);`);
    };
    checker.addEventListener('click', e => {
        // Checker goes up
        // checker.classList.add('selected');
        console.log('click!')
        checker.setAttribute('class', 'selected');
        
        
        // Uncklick cause checker to move down
        //
        // 
        //



    }, false);
    checker.addEventListener('mousedown', (e) => {
        document.querySelector(".selected").classList.remove('selected');
    }, false);
    field.appendChild(checker);               // Append <button> to <body>
};


// Place checkers
for (let i = 0; i < 15; i++) {
    place_checker('black', 1);
    place_checker('white', 13);
};



function placeTestTExt() {
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
//     placeTestTExt();
// });



// window.addEventListener('scroll', function(e) {
//     let board = document.getElementById('board');
//     board.setAttribute('style', 'bottom: 0px;');
// });


// let checkers = document.getElementsByTagName('checker');
// checkers.forEach(checker => {
//     checker.addEventListener('click', e => {
//         checker.setAttribute('style', 'transform: translateX(+10%);');
//     });
// });





// let boardWidth = board.getBoundingClientRect().width;
// let boardHeight = board.getBoundingClientRect().height;
// let checkerBoardRatio = 0.4;    // checker diameter / board width/height
// checker_diameter = Math.min(boardWidth * checkerBoardRatio, boardHeight * checkerBoardRatio);

// checker_diameter = Math.min(
//     board.getBoundingClientRect().width * checkerBoardRatio,
//     board.getBoundingClientRect().height * checkerBoardRatio,
// );







// Width settings
// black_checker.setAttribute('style', `width: ${checker_diameter}`);
// black_checker.setAttribute('style', `height: ${checker_diameter}`);
// black_checker.setAttribute('style', 'width: 300px;');
// black_checker.setAttribute('style', 'height: 300px');
// black_checker.style.width = '200px'
// black_checker.height(checker_diameter)
// black_checker.width = '200px'
// black_checker.width(black_checker.width() - 150);
// black_checker.setAttribute('style', 'transform: translate(500px, 500px);');
// var css_black_checker = `black_checker{ width: ${checker_diameter}px; height: ${checker_diameter}px }`;
// var css_black_checker = `black_checker{ width: ${checker_diameter}%; height: ${checker_diameter}% }`;
// var style = document.createElement('style');
// if (style.styleSheet) {
//     style.styleSheet.cssText = css_black_checker;
// } else {
//     style.appendChild(document.createTextNode(css_black_checker));
// }
// document.getElementsByTagName('head')[0].appendChild(style);





// Hover settings
// var css = 'black_checker:hover{ width: 200px; top: -15px; left: -5px }';
// var style = document.createElement('style');
// if (style.styleSheet) {
//     style.styleSheet.cssText = css;
// } else {
//     style.appendChild(document.createTextNode(css));
// }
// document.getElementsByTagName('head')[0].appendChild(style);












// console.log(board.getBoundingClientRect());
// console.log(black_checker.getBoundingClientRect());
// console.log(checker_diameter);

// document.body.insertBefore(black_checker, currentDiv);




// let board = document.querySelector('.board');
// let blackChecker = document.createElement('black_checker');
// blackChecker.createdCallback = function() {
//     this.innerHTML = "<b>I'm an x-foo-with-markup!</b>";
//   };
// board.appendChild(new blackChecker());








// var list = document.querySelector('ul');
// list.addEventListener('click', function(ev) {
//   if (ev.target.tagName === 'LI') {
//      ev.target.classList.toggle('done'); 
//   }
// }, false);









