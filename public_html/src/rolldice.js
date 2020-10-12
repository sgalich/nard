// What spots to show on the dice
const whatToShowOnDie = {
    1: [5],
    2: [3, 7],
    3: [3, 5, 7],
    4: [1, 3, 7, 9],
    5: [1, 3, 5, 7, 9],
    6: [1, 3, 4, 6, 7, 9]
};

// Render a single die
function renderASingleDie(randomResult, dieId) {
    // Render new spots on the die 1
    let die = document.getElementById(`die${dieId}`);
    die.innerHTML = '';
    console.log(randomResult)
    if (randomResult === null) { return };
    whatToShowOnDie[randomResult].forEach(el => {
        let spot = document.createElement('spot');
        spot.setAttribute('id', `spot${el}`);
        die.appendChild(spot);
    });
};

// Render both dice results
// function renderDice([die1, die2]) {
    


//     renderASingleDie(die1, 1);
//     renderASingleDie(die2, 2);
// };
