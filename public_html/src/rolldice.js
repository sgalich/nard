// What spots to show on the dice
const whatToShowOnDie = {
    1: [5],
    2: [3, 7],
    3: [3, 5, 7],
    4: [1, 3, 7, 9],
    5: [1, 3, 5, 7, 9],
    6: [1, 3, 4, 6, 7, 9]
};

// Render die result
function renderDie(move, diceId) {
    let die = document.getElementById(`die${diceId}`);
    die.innerHTML = '';
    // Render new spots on the dice
    whatToShowOnDie[move].forEach(el => {
        let spot = document.createElement('spot');
        spot.setAttribute('id', `spot${el}`);
        die.appendChild(spot);
    });
};

// Main function to roll dice
var rollDice = function () {
    die1 = Math.floor(Math.random() * 6) + 1;
    die2 = Math.floor(Math.random() * 6) + 1;
    renderDie(die1, 1);
    renderDie(die2, 2);
};








// Temp function REMOVE IT !
document.getElementsByClassName('diceBox')[0].addEventListener('click', (e) => {
    rollDice()
}, false);

