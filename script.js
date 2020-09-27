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





const board = document.getElementById("board");
let black_checker = document.createElement("black_checker");   // Create a black checker
black_checker.setAttribute('draggable', 'true');    // make it draggable
black_checker.setAttribute('style', "background-image: url(./images/black.svg);");    // set background svg image



// let boardWidth = board.getBoundingClientRect().width;
// let boardHeight = board.getBoundingClientRect().height;
let checkerBoardRatio = 0.3;    // checker diameter / board width/height
// checker_diameter = Math.min(boardWidth * checkerBoardRatio, boardHeight * checkerBoardRatio);

checker_diameter = Math.min(
    board.getBoundingClientRect().width * checkerBoardRatio,
    board.getBoundingClientRect().height * checkerBoardRatio,
);



















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





black_checker.innerHTML = "&nbsp;3";                   // Insert text

// document.body.appendChild(black_checker);               // Append <button> to <body>
board.appendChild(black_checker);               // Append <button> to <body>



console.log(board.getBoundingClientRect());
console.log(black_checker.getBoundingClientRect());
console.log(css_black_checker);
console.log(checker_diameter);

// document.body.insertBefore(black_checker, currentDiv);




// let board = document.querySelector('.board');
// let blackChecker = document.createElement('black_checker');
// blackChecker.createdCallback = function() {
//     this.innerHTML = "<b>I'm an x-foo-with-markup!</b>";
//   };
// board.appendChild(new blackChecker());
