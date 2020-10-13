class Nard {

    constructor(p0, p1, game='nard') {
        this.players = [p0, p1];
        this.game = game;
        this.turn = null;    // 0 / 1 - index of the player who's turn
        this.die1 = null;    // random result from die1
        this.die2 = null;    // random result from die2
        this.turn = null;    // -1 or 1 (for 'black' or 'white') - who is moving checkers now
        this.wait = null;    // 1 or -1 (for 'white' or 'black') - who is awaiting now
        this.movesCount = 0;    // moves counter
        this.winner = null;
        this.chat = [];
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
        this.placeInTheGame(0);
        this.placeInTheGame(1);
        this.chooseWhoIsFirst();
        this.makeTurn();








        










    };

    // Socket is in the game
    placeInTheGame(ind) {
        let socket = this.players[ind];
        this.renderBoard(ind);
        // socket.emit('hint', `Welcome to the ${socket.player.game} game!`);
        socket.on('roll_dice', () => { this.rollDice() });
        // socket.on('turn', () => { this._onTurn(idx, turn) });
    };

    // Render the whole page
    renderBoard(ind) {
        let socket = this.players[ind];
        socket.emit('hideStartModal');
        let invert = (ind === 0) ? 1 : -1;
        socket.emit('renderCheckers', this.board, invert);
        if (invert === 1) {
            socket.emit('renderDice', [this.die1, this.die2]); 
        } else {
            socket.emit('renderDice', [this.die2, this.die1]);
        };
    };

    // Main function to roll dice
    rollDice() {
        this.die1 = Math.floor(Math.random() * 6) + 1;
        this.die2 = Math.floor(Math.random() * 6) + 1;
        this.players[0].emit('renderDice', [this.die1, this.die2]);
        this.players[1].emit('renderDice', [this.die2, this.die1]);
    };

    // Print hint
    printHint(socket, hint) {
        socket.emit('printHint', hint);
    };
    


    // Choose who's turn is first
    chooseWhoIsFirst() {
        this.rollDice();
        // Roll dice till they show different results
        while (this.die1 == this.die2) {
            this.rollDice();
        };
        this.turn = (this.die1 < this.die2) ? 0 : 1;
        // Send hints
        this.printHint(this.players[0], 'your turn');
        this.printHint(this.players[1], 'rival\'s turn');
    };


    makeTurn() {
        if (this.winner) { return };

        // 1. Turn off cliking and dragging in checkers' properties for the awaiting player
        // 2. Count allowed moves for the player who's turn
        // 3. Highlight recommend moves
        // 4. Block moves that are not allowed
        // 5. Await till he makes right moves
        // 6. Check if the player won the game => end turns return;
        // 7. Switch turn & run this function recursively

        this.rollDice();
        // 1. 

        // this.turn[1].emit('printHint', 'Looser!!');
        
    };




    // theGame() {
    //     while (this.winner === null) {

    //     };
    // };







    // // 2. Choose who makes the first move
    // whoIsFirst() {
    //     this.rollDice();
    //     while (this.die1 == this.die2) {
    //         this.rollDice();
    //     };
    //     [this.turn4User, this.turn, this.wait] = (this.die1 < this.die2) ? 
    //         ['yellow', 1, -1] : ['blue', -1, 1];
    //     this._sendToPlayers(`Black: ${this.die1}, White: ${this.die2}, ${this.turn4User} are first!`);
    // };


    // _sendToPlayer(playerIndex, msg) {

    //     this.players[playerIndex].emit('hint', msg);
    // };

    // _sendToPlayers(msg) {
    //     this.players.forEach((player) => {
    //         player.emit('hint', msg);
    //     });
    // };

    // _onTurn(playerIndex, turn) {
    //     this._turns[playerIndex] = turn;
    //     this._sendToPlayer(playerIndex, `You selected ${turn}`);
    // };





}

module.exports = Nard;