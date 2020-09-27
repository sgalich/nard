let canvas = document.querySelector('canvas');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;


let ctx = canvas.getContext('2d');




// ctx.fillStyle = '259709'
// ctx.fillRect(0, 0, window.innerWidth / 4, 100)
// ctx.fillRect(400, 10, 10, 100)
// ctx.fillStyle = '034756'
// ctx.fillRect(550, 120, 100, 10)
// ctx.fillRect(303, 150, 10, 10)




// // var img = document.createElement("img"); 
 
// // img.src = "images/board.png"; 
// // var src = document.getElementById("x"); 
 
// // src.appendChild(img);



// // let background = new Image();
// // background.src = "/images/board.png";
// // ctx.drawImage(background,0,0);
// // // background.onload = function(){
// // //     ctx.drawImage(background,0,0);   
// // // }

// console.log(canvas)

// // Line
// ctx.beginPath()
// ctx.moveTo(20, 20)
// ctx.lineTo(30, 50)
// ctx.lineTo(345, 500)
// ctx.strokeStyle = '#8f3a8b'
// ctx.stroke()

// // Circles
// for (let i = 0; i < 3000; i++) {
//     let radius = 25;
//     let x = Math.random() * window.innerWidth;
//     let y = Math.random() * window.innerHeight;
//     let color = Math.round(Math.random() * 10 ** 10).toString(16).slice(0, 7)
//     ctx.beginPath();
//     ctx.arc(x, y, radius, 0, Math.PI * 2, false);
//     ctx.strokeStyle = color;
//     ctx.stroke();
//     ctx.closePath();
// }



// let x = Math.random() * window.innerWidth;
// let y = Math.random() * window.innerHeight;
// let color = Math.round(Math.random() * 10 ** 10).toString(16).slice(0, 7)


function Circle(x, y, dx, dy, radius=25) {
    random_x = Math.random() * window.innerWidth;
    while (random_x < radius || random_x > window.innerWidth - radius) {
        random_x = Math.random() * window.innerWidth;
    };
    this.x = x ?? random_x
    random_y = Math.random() * window.innerHeight;
    while (random_y < radius || random_y > window.innerHeight - radius) {
        random_y = Math.random() * window.innerHeight;
    };
    this.y = y ?? random_y;
    this.dx = dx ?? (Math.random() - 0.5) //* 10;
    this.dy = dy ?? (Math.random() - 0.5) //* 10;
    this.radius = radius;

    this.draw = function() {
        ctx.beginPath();
        ctx.fillStyle = 'green'    // "#c82124"    // red 
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.stroke();
        ctx.closePath();
    }

    this.update = function() {
        if (this.x + this.radius > innerWidth || this.x <= this.radius) {
            this.dx = -this.dx;
        } else if (this.y + this.radius > innerHeight || this.y <= this.radius) {
            this.dy = -this.dy;
        }
        this.y += this.dy
        this.x += this.dx;

        this.draw();
    }
}




let circles = [];
for (let i = 0; i < 200; i++) {
    let circle = new Circle(undefined, undefined, undefined, undefined, 50);
    circles.push(circle)
}


function animate() {
    requestAnimationFrame(animate);
    
    ctx.clearRect(0, 0, innerWidth, innerHeight);
    
    for (let i = 0; i < circles.length; i++) {
        circles[i].update();
    }
}

// drawBoard();

animate();



function drawBoard(){
    let p = 0    // padding
    
    ctx.strokeStyle = "black";
    for (var x = 0; x <= innerWidth; x += 50) {
        ctx.moveTo(x + p, p);
        ctx.lineTo(x + p, innerHeight + p);
    }
    for (var x = 0; x <= innerHeight; x += 50) {
        ctx.moveTo(p, x + p);
        ctx.lineTo(innerWidth + p, x + p);
    }
    ctx.stroke();
}





// let start = -0.5 * Math.PI
// let end = -1.5 * Math.PI


// ctx.fillStyle = "#c82124"    // red 
// ctx.beginPath();
// ctx.arc(100, 200, radius, start, end, true);
// ctx.strokeStyle = 'black';
// ctx.stroke();
// ctx.closePath();
// ctx.fill();

// ctx.fillStyle = "#c82124"    // red 
// ctx.beginPath();
// ctx.arc(200, 200, radius, -0.5 * Math.PI, -1.5 * Math.PI, false);
// ctx.strokeStyle = 'black';
// ctx.stroke();
// ctx.closePath();
// ctx.fill();

// ctx.fillStyle = "#c82124"    // red 
// ctx.beginPath();
// ctx.arc(300, 200, radius, -0.5 * Math.PI, -1.5 * Math.PI, true);
// ctx.strokeStyle = 'black';
// ctx.stroke();
// ctx.closePath();
// ctx.fill();

// ctx.beginPath();
// ctx.fillStyle = "#c82124"    // red 
// ctx.arc(300, 200, radius, -0.5 * Math.PI, -1.5 * Math.PI, false);
// ctx.strokeStyle = 'black';
// ctx.stroke();
// ctx.fill();
// ctx.closePath();




// // bezierCurveTo
// ctx.beginPath();
// ctx.fillStyle = "#c82124"    // red 
// ctx.moveTo(100, 100);
// ctx.bezierCurveTo(
//     100, 100, 
//     100 - 0.75 * radius, 100 - 1.75 * radius, 
//     100 - 2 * radius, 100
// );
// ctx.fill();
// ctx.closePath();

// ctx.beginPath();
// ctx.fillStyle = "#c82124"    // red 
// ctx.moveTo(100, 100);
// ctx.bezierCurveTo(
//     100, 100, 
//     100 - 0.75 * radius, 100 + 1.75 * radius, 
//     100 - 2 * radius, 100
// );
// ctx.fill();
// ctx.closePath();

// // Right circle
// ctx.beginPath();
// ctx.fillStyle = "#c82124"    // red 
// ctx.arc(200, 100, radius, 0, 2 * Math.PI, false);
// ctx.fill();
// ctx.closePath();

// // arcTo
// ctx.beginPath();
// ctx.strokeStyle = "#c82124"    // red 
// ctx.moveTo(300, 100);
// ctx.arcTo(
//     300 + radius, 100, 
//     300 - radius, 101, 
//     0
// );
// ctx.stroke();
// ctx.closePath();

// // // Points
// // ctx.fillRect(400+radius, 100,5,5);
// // ctx.fillRect(400-radius, 100,5,5);

// // quadraticCurveTo
// ctx.beginPath();
// ctx.fillStyle = "#c82124"    // red
// ctx.moveTo(400+radius, 100);
// ctx.quadraticCurveTo(400, 100-2*radius, 400-radius, 100)
// ctx.fill();
// ctx.closePath();

// ctx.beginPath();
// ctx.fillStyle = "#c82124"    // red
// ctx.moveTo(400+radius, 100);
// ctx.quadraticCurveTo(400, 100+2*radius, 400-radius, 100)
// ctx.fill();
// ctx.closePath();
