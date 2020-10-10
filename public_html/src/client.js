// START SCREEN

// Rival - a friend
function rivalIsFriend() {
    document.getElementById('rival-random').classList.remove('selected');
    document.getElementById('rival-friend').classList.add('selected');
    socket.emit('generateFriendsLink');    // Generate a friend's link
    document.getElementById('start-play-btn').classList.remove('selected');
    document.getElementById('start-play-link').classList.add('selected');
};

// Rival - a friend
function rivalIsRandom() {
    document.getElementById('rival-friend').classList.remove('selected');
    document.getElementById('rival-random').classList.add('selected');
    document.getElementById('start-play-link').classList.remove('selected');
    document.getElementById('start-play-btn').classList.add('selected');
};


// BOARD SCREEN

// Print message in chat
function printHint(hint) {
    // document.getElementById('hint').innerHTML = null;    // clear
    // document.getElementById('hint').innerHTML = hint;    // write
    time = new Date;
    hint = time.getHours() + ':' + time.getMinutes() + ' ' + hint;
    const parent = document.getElementById('hint');
    const el = document.createElement('p');
    el.innerHTML = hint;
    parent.appendChild(el);
    parent.scrollTop = parent.scrollHeight;
};

// Send message from a player in chat
const onFormSubmitted = (e) => {
    e.preventDefault();
    const input = document.querySelector('#chat');
    const text = input.value;
    input.value = '';
    console.log(text);
    socket.emit('hint', text);
};






const socket = io();







// ON THE PAGE

// Choose a rival
document.getElementById('start-play-btn').classList.add('selected');    // By default the friend's link is invisible 
document.getElementById('rival-friend').onclick = rivalIsFriend;    // a friend
document.getElementById('rival-random').onclick = rivalIsRandom;    // a random



// TO THE SERVER

// Get tabId in order to identify user
var tabId= sessionStorage.getItem('tabId');
// Generate a new tabId if there is not any tabId
if (tabId === null) {
    socket.emit('newTabId');
};






// Roll dice by click
// Temp function REMOVE IT !
document
    .getElementsByClassName('diceBox')[0]
    .addEventListener('click', (e) => {
        socket.emit('roll_dice');
    }, false);

document
    .querySelector('#chat-form')
    .addEventListener('submit', onFormSubmitted);





// FROM THE SERVER

// Set a generated on the server tabId
socket.on('setTabId', function (tabId) {
    sessionStorage.setItem('tabId', String(tabId));
});

// Set a friend's link
socket.on('setFriendsLink', function(sharePage) {
    document.getElementById('start-friends-link').innerHTML = sharePage;
});



// socket.emit('start', startGame);
socket.on('hint', printHint);

// Place checkers
socket.on('place_checkers', startGame);

// Render dice after them are rolled from the server
socket.on('dice_rolled', renderDice);

// Reconnection
socket.on('user-reconnected', function (username) {
    console.log(username + ' just reconnected');
});





// socket.on('start', startGame);
// // socket.on('start', startGame);

// var peer = new Peer();


// var id1;
// console.log(peer)
// peer.on('open', function(id) {
//     console.log('My peer ID is: ' + id);
//     id1 = id;
// });
// peer.on('connection', function(conn) {
//     console.log(conn);
// });




// var conn = peer.connect(id1);
// conn.on('open', function() {
//     // Receive messages
//     conn.on('data', function(data) {
//         console.log('Received', data);
//     });

//     // Send messages
//     conn.send('Hello!');
// });


