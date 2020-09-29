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
function place_checker(color, x=0, y=0) {
    const board = document.getElementById("board");
    let checker = document.createElement('checker');   // Create a black checker
    checker.setAttribute('color', color);    // make it draggable
    checker.setAttribute('draggable', 'true');    // make it draggable
    checker.setAttribute('style', `transform: translate(${x}px, ${y}px);`);    // place it on the board
    board.appendChild(checker);               // Append <button> to <body>
}

// Place checker at certain field
function place_checker(color, id) {
    const field = document.getElementById(id);
    let checker = document.createElement('checker');   // Create a black checker
    checker.setAttribute('color', color);    // make it draggable
    checker.setAttribute('draggable', 'true');    // make it draggable

    checker.setAttribute('data-draggable', 'item');    // test

    // checker.setAttribute('style', `transform: translate(${x}px, ${y}px);`);    // place it on the board
    field.appendChild(checker);               // Append <button> to <body>
}

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

place_checker('black', 1)
place_checker('black', 2)
place_checker('black', 3)
place_checker('black', 4)
place_checker('black', 5)
place_checker('black', 6)
place_checker('black', 7)
place_checker('black', 8)
place_checker('black', 9)
place_checker('black', 10)
place_checker('black', 11)
place_checker('black', 12)
place_checker('black', 13)
place_checker('black', 14)
place_checker('black', 15)

place_checker('white', 10)
place_checker('white', 11)
place_checker('white', 12)
place_checker('white', 13)
place_checker('white', 14)
place_checker('white', 23)

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







