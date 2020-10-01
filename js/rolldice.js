// What spots to show on the dice
let diceMap = {
    1: [5],
    2: [3, 7],
    3: [3, 5, 7],
    4: [1, 3, 7, 9],
    5: [1, 3, 5, 7, 9],
    6: [1, 3, 4, 6, 7, 9]
}

function rollDice() {
    [1, 2].forEach(diceId => {
        let random = Math.floor(Math.random() * 6) + 1;
        let spotsToShow = diceMap[random];
        let die = document.getElementById(`die${diceId}`);
        die.innerHTML = '';
        // Create a new spots on the dice
        spotsToShow.forEach(el => {
            let spot = document.createElement('spot');
            spot.setAttribute('id', `spot${el}`);
            die.appendChild(spot);
        });
    });
}

let move1 = null;
let move2 = null;
rollDice()

