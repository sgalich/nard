let canvas = document.querySelector('canvas');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;


let ctx = canvas.getContext('2d');
ctx.fillStyle = '259709'
ctx.fillRect(0, 0, window.innerWidth / 4, 100)
ctx.fillRect(400, 10, 10, 100)
ctx.fillStyle = '034756'
ctx.fillRect(550, 120, 100, 10)
ctx.fillRect(303, 150, 10, 10)




// var img = document.createElement("img"); 
 
// img.src = "images/board.png"; 
// var src = document.getElementById("x"); 
 
// src.appendChild(img);



// let background = new Image();
// background.src = "/images/board.png";
// ctx.drawImage(background,0,0);
// // background.onload = function(){
// //     ctx.drawImage(background,0,0);   
// // }

console.log(canvas)

// Line
ctx.beginPath()
ctx.moveTo(20, 20)
ctx.lineTo(30, 50)
ctx.lineTo(345, 500)
ctx.strokeStyle = '#8f3a8b'
ctx.stroke()

// Circles
for (let i = 0; i < 300; i++) {
    let radius = 25;
    let x = Math.random() * window.innerWidth;
    let y = Math.random() * window.innerHeight;
    let color = '#' + Math.round(Math.random() * 10 ** 10).toString(16).slice(0, 7)
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2, false);
    ctx.strokeStyle = color;
    ctx.stroke();
}

