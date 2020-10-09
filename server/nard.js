class Nard {

    constructor(p1, p2) {
        this._players = [p1, p2];
        this.turns = [null, null];
        this.die1 = null;    // random result from die1
        this.die2 = null;    // random result from die2
        this.turn = null;    // -1 or 1 (for 'black' or 'white') - who is moving checkers now
        this.wait = null;    // 1 or -1 (for 'white' or 'black') - who is awaiting now
        this.turn4User = null;    // turn for user as black/white or yellow/blue, etc.
        this.winner = null;
        this.board = {    // the board with a starting position
            1: 15,
            2: 0,
            3: 0,
            4: 0,
            5: 0,
            6: 0,
            7: 0,
            8: 0,
            9: 0,
            10: 0,
            11: 0,
            12: 0,
            13: -15,
            14: 0,
            15: 0,
            16: 0,
            17: 0,
            18: 0,
            19: 0,
            20: 0,
            21: 0,
            22: 0,
            23: 0,
            24: 0
        };
        this._sendToPlayers('Game is STARTING NOW!');
        this._placeCheckers();
        this.whoIsFirst();
        this._players.forEach((player, idx) => {
            player.on('turn', () => {
                this._onTurn(idx, turn);
            });
        });
    };

    // 1. Place checkers on the board
    _placeCheckers() {
        this._players.forEach((player) => {
            player.emit('place_checkers');
        });
    };

    // Main function to roll dice
    rollDice() {
        this.die1 = Math.floor(Math.random() * 6) + 1;
        this.die2 = Math.floor(Math.random() * 6) + 1;
        this._players.forEach((player) => {
            player.emit('dice_rolled', [this.die1, this.die2]);
        });
    };

    // 2. Choose who makes the first move
    whoIsFirst() {
        this.rollDice();
        while (this.die1 == this.die2) {
            this.rollDice();
        };
        [this.turn4User, this.turn, this.wait] = (this.die1 < this.die2) ? 
            ['yellow', 1, -1] : ['blue', -1, 1];
        this._sendToPlayers(`Black: ${this.die1}, White: ${this.die2}, ${this.turn4User} are first!`);
    };


    _sendToPlayer(playerIndex, msg) {
        this._players[playerIndex].emit('hint', msg);
    };

    _sendToPlayers(msg) {
        this._players.forEach((player) => {
            player.emit('hint', msg);
        });
    };

    _onTurn(playerIndex, turn) {
        this._turns[playerIndex] = turn;
        this._sendToPlayer(playerIndex, `You selected ${turn}`);
    };





}

module.exports = Nard;