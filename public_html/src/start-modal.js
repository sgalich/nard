// START-MODAL SCREEN


// Show play / await / link
// for PLAY button / await a random rival / friend's link
function showInStartFooter(el) {
    if (el === 'play') {
        // Show PLAY button
        document.getElementById('start-play-btn').style.removeProperty('display');
        document.getElementById('start-play-btn').classList.add('show');
        document.getElementById('start-await-random-rival').style.display = 'none';
        document.getElementById('start-play-link').style.display = 'none';
    } else if (el === 'await') {
        // Show "await for a rival" text
        document.getElementById('start-play-btn').style.display = 'none';
        document.getElementById('start-await-random-rival').style.removeProperty('display');
        document.getElementById('start-await-random-rival').classList.add('show');
        document.getElementById('start-play-link').style.display = 'none';
    } else if (el === 'link') {
        // Show a link to a particular game to copy and share it with a friend
        document.getElementById('start-play-btn').style.display = 'none';
        document.getElementById('start-await-random-rival').style.display = 'none';
        document.getElementById('start-play-link').style.removeProperty('display');
        document.getElementById('start-play-link').classList.add('show');
    };
};

// // Generate & set invitation link
// function setSharePage() {
//     let sharePage = domain + ganerateSharePage(8);
//     document.getElementById('start-friends-link').value = sharePage;
//     // socket.emit('sharePageGenerated');    // Generate a friend's link
// };

// Rival - a friend
document.getElementById('rival-friend').onclick = function rivalIsFriend() {
    // Do nothing if the button is already active
    let friendButton = document.getElementById('rival-friend');
    if (friendButton.classList.contains('selected')) {
        return;
    };
    document.getElementById('rival-random').classList.remove('selected');
    friendButton.classList.add('selected');
    let sharePage = generateSharePage(8);
    emit('rival_friend', sharePage);
    document.getElementById('start-friends-link').value = domain + sharePage; 
    showInStartFooter('link');
};

// Rival - a random guy
document.getElementById('rival-random').onclick = function rivalIsRandom() {
    // Do nothing if the button is already active
    let randomButton = document.getElementById('rival-random');
    if (randomButton.classList.contains('selected')) {
        return;
    };
    emit('rival_random');
    document.getElementById('rival-friend').classList.remove('selected');
    randomButton.classList.add('selected');
    showInStartFooter('play');
};

// PLAY button is clicked
document.getElementById('start-play-btn').onclick = function pressPlayButton() {
    showInStartFooter('await');
    emit('play');
};

// Copy friend's link to clipboard by clicking the copy-icon
document.getElementById('copy-icon')
    .addEventListener('mousedown', function() {
        let friendsLink = document.getElementById('start-friends-link');
        friendsLink.focus();
        friendsLink.select();
        try {
            document.execCommand('copy');
        } catch (err) {
            console.error('Failed to copy by the copy-icon', err);
    };
});

// Hide a start modal
function hideStartModal() {
    document.getElementById('start-back').classList.add('hide');
    document.getElementById('start-modal').classList.add('hide');
    
    
    // console.log(document.getElementsByClassName('selected'));
    
    
    [].forEach.call(document.getElementsByClassName('selected'), (el) => {
        el.classList.remove('selected');
    });
    // console.log('hided start modal and deleted all selected');

    // console.log(document.getElementsByClassName('selected'));

};