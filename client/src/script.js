let CHECKEROVERLAP = 5.5


// document.body.onload = addElement;

// function addElement () { 
//   // create a new div element 
//   const black_checker = document.createElement("black_checker");
//   black_checker.setAttribute('draggable', 'true');
  
// //   // and give it some content 
// //   const newContent = document.createTextNode("Hi there and greetings!"); 
  
// //   // add the text node to the newly created div
// //   black_checker.appendChild(newContent);  

//   // add the newly created element and its content into the DOM 
//   const currentDiv = document.querySelector(".end_board");
//   console.log(currentDiv)
//   console.log(black_checker)
// //   newDiv.appendChild(currentDiv);

//   document.body.insertBefore(black_checker, currentDiv);


// }


// Place checker at x, y point
// function place_abs_checker(color, x=0, y=0) {
//     const board = document.getElementById("board");
//     let checker = document.createElement('abs_checker');   // Create a black checker
    
    
//     checker.setAttribute('color', color);
//     // checker.setAttribute('src', `./images/${color}.svg`);

//     checker.setAttribute('draggable', 'true');    // make it draggable
//     checker.setAttribute('style', `transform: translate(${x}px, ${y}px);`);    // place it on the board
//     board.appendChild(checker);               // Append <button> to <body>
// }

place_checker('black', 1);






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

// for (let x = 0; x < 200; x += 100) {
//     for (let y = 0; y < 300; y += 100) {
//         place_checker('black', x, y);
//     }
// }

// place_checker('white', 700, 200)
// place_checker('white', 600, 130)

// for (let i = 0; i < 3; i += 1) {
//     place_checker('black', i)
// }

// place_abs_checker('black')
// place_abs_checker('black')


// Place checkers
// for (let i = 0; i < 15; i++) {
//     place_checker('black', 1);
//     place_checker('white', 13);
// };



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









