class Nard {

    constructor(p0, p1, game='nard') {
        [p0.player.color, p1.player.color] = [1, -1];
        this.players = [p0, p1];
        this.game = game;
        this.turn = null;    // 0 / 1 - index of the player who's turn
        this.die1 = null;    // random result from die1
        this.die2 = null;    // random result from die2
        this.wait = null;    // 1 or -1 (for 'white' or 'black') - who is awaiting now
        // this.movesCount = 0;    // moves counter
        this.winner = null;
        this.chat = [];
        this.board = {    // the board with a starting position for the 1-colored player. (not for -1-colored)
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


        this.dice = null;
        this.moves = [];    // all moves


        // this.players[0].on('moveIsFinished', this.moveIsFinished);
        // this.players[1].on('moveIsFinished', this.moveIsFinished);
        // this.players[0].on('moveIsFinished', this.makeTurn());
        // this.players[1].on('moveIsFinished', this.makeTurn());



        this.placeInTheGame(0);
        this.placeInTheGame(1);
        this.chooseWhoIsFirst();
        this.makeTurn();


    };

    // Socket is in the game
    placeInTheGame(ind) {
        let socket = this.players[ind];
        this.renderBoard(ind);
        if (this.dice) this.players[ind].emit('renderDice', this.dice);
        let color = this.players[ind].player.color
        console.log(this.turn === ind, this.turn, ind);
        if (this.turn === ind) {
            this.players[ind].emit('letMeMakeMyStep', color, this.moves, this.board);
        };
        socket.emit('hint', `Welcome to the ${socket.player.game} game!`);
    };

    // Render the whole page
    renderBoard(ind) {
        let socket = this.players[ind];
        socket.emit('hideStartModal');
        socket.emit('renderCheckers', this.board, socket.player.color);
        // if (invert === 1) {
        //     socket.emit('renderDice', [this.die1, this.die2]); 
        // } else {
        //     socket.emit('renderDice', [this.die2, this.die1]);
        // };
    };

    // Main function to roll dice
    rollDice() {

        function getDice(die1, die2) {
            let die3, die4;
            die3 = die4 = (die1 === die2) ? die1 : undefined;
            // Get dice with active & unactive values
            let dice = [
                {val: die1, active: true},
                {val: die2, active: true},
                {val: die3, active: true},
                {val: die4, active: true}
            ];
            // Make some dice values unactive
            // let stepsMade = (moves.length) ? moves[moves.length - 1].steps : [];    // For convinience
            for (let die of dice) {if (!die.val) die.active = false};
            return dice
        };
        let die1 = Math.floor(Math.random() * 6) + 1;
        let die2 = Math.floor(Math.random() * 6) + 1;

        // let die1 = 2;
        // let die2 = 2;

        this.dice = getDice(die1, die2);
        this.players[0].emit('renderDice', this.dice);
        this.players[1].emit('renderDice', this.dice);
    };

    // Print hint
    printHint(socket, hint) {
        socket.emit('printHint', hint);
    };

    // Choose who's turn is first
    chooseWhoIsFirst() {
        // https://stackoverflow.com/questions/42107359/passing-turns-with-socket-io-and-nodejs-in-turn-based-game
        this.rollDice();
        // Roll dice till they show different results
        while (this.dice[0].val === this.dice[1].val) this.rollDice();
        this.turn = (this.dice[0].val > this.dice[1].val) ? 1 : 0;
        // // Send hints
        // this.printHint(this.players[Math.abs(this.turn - 1)], 'your turn');
        // this.printHint(this.players[this.turn], 'rival\'s turn');
        // setTimeout(() => {}, 4000);
    };

    getWinnerInd() {
        let boardValues = Object.values(this.board);
        // If +1 color won the game
        if (!boardValues.some(el => el > 0)) {
            // If the 1st player is a winner (1st is always has +1 color)
            return 0;
        // If -1 color won the game         
        };
        if (!boardValues.some(el => el < 0)) {
            // If the 2nd player is a winner (2nd is always has +1 color)
            return 1;
        };
        return false;
    };

    // The main function that lets players make thier turns
    // 1. Turn off cliking and dragging in checkers' properties for the awaiting player
    // 2. Count allowed moves for the player who's turn
    // 2.1 Allow to make allowed moves

    // 3. Highlight recommend moves when hover above a field
    // 4. Block moves that are not allowed
    // 5. Await till he makes right moves
    // 6. Check if the player won the game => end turns return;
    // 7. Switch turn & run this function recursively
    makeTurn() {
        // Render a step made by the rival
        this.turn = Math.abs(this.turn - 1);    // switch the turn
        this.renderBoard(this.turn);

        // Check whether we've got a winner or not
        let winnerInd = this.getWinnerInd();
        if (winnerInd === 0 || winnerInd === 1) {
            this.printHint(this.players[winnerInd], 'You win! Congratulations!');
            this.printHint(this.players[Math.abs(winnerInd - 1)], 'You lose');
            return;
            // TODO: MEDIUM: decide what to do here? Offer rematch or a new rival?
        };

        this.rollDice();
        // this.turn = Math.abs(this.turn - 1);    // switch the turn
        // Send hints
        this.printHint(this.players[Math.abs(this.turn - 1)], 'rival\'s turn');
        this.printHint(this.players[this.turn], 'your turn');

        // 1. Turn off cliking and dragging in checkers' properties for the awaiting player
        let color = this.players[this.turn].player.color;
        let colorN = Number(color);
       
       
        this.moves.push({
            color: colorN,
            dice: [this.dice[0].val, this.dice[1].val],
            steps: []
        });

        // this.board = board;
        // this.moves = moves;


        // this.renderBoard(this.turn);



        // console.log('makeTurn()');
        // console.log('this.dice', this.dice);
        // console.log('this.board', this.board);
        // console.log('this.moves', this.moves);
        

        
        // 2. Count allowed moves for the player who's turn



        // Let the player make his move
        this.players[this.turn].emit('letMeMakeMyStep', color, this.moves, this.board);
        // this.players[Math.abs(this.turn - 1)].emit('restrictMovingCheckers');
        // this.countSteps(color);

        

        // 2.1 Count all steps in move





        
        // this.movesCount += 1;
        // this.rollDice();
    };

    // moveIsFinished(moves, board) {
        
        
    //     console.log('move is finished')
        
        
        
    //     // this.board = board;
    //     this.board = board;
    //     this.moves = moves;
        
        
    //     console.log('this.moves[0].steps[0]', this.moves[0].steps[0]);
        
        
    //     this.turn = Math.abs(this.turn - 1);    // switch the turn

    //     // this.renderBoard(this.turn);


    //     this.makeTurn();




        

    // };




    // isThisOKMove([fromFieldId, toFieldId]) {
    //     let move = fromFieldId - toFieldId;
    //     move = (move < 0) ? 24 + move : move;
    //     if (move === this.die1 || move === this.die2 || move === this.die1 + this.die2) {
    //         this.players[this.turn].emit('');
    //     };
    //     this.players[this.turn].emit('');
    // };






    countSteps(color) {
        // Exception for the 1st move when dice = 3-3, 4-4 or 6-6
        // При этом с головы всегда можно брать только одну шашку.
        // Исключение составляет только первый бросок в партии.
        // Если одна шашка, которую можно снять с головы, проходит, то можно снять вторую.
        // Таких камней для первого игрока всего три: шесть-шесть, четыре-четыре и три-три 
        // (мешают шашки противника, стоящие на голове). Если выпадает один из этих камней,
        // игрок снимает с головы две шашки. Для второго игрока количество камней, 
        // при которых с головы можно снять две шашки, увеличивается,
        // так как мешает пройти первому камню, имеет право не только голова, но и камень, 
        // снятый противником. Если противник первым броском кинул: 
        // два-один, шесть-два или пять-пять, то второй игрок 
        // может снять вторую шашку также при бросках пять-пять и шесть-два 
        // (кроме: шесть-шесть, четыре-четыре и три-три, которые тоже не идут напрямую).
        // if (this.movesCount <= 1) {
        //     if (this.die1 === this.die2) {
        //     };
        // };
        
        // Check whether the field is rival's or not
        function isMyField(fieldVal, color) {
            if (fieldVal === 0) {
                return true;
            } else if (Math.sign(fieldVal) === Math.sign(color)) return true;
            return false;
        };

        // Choose how many moves to make
        let steps = (this.die1 !== this.die2) ?
            [this.die1, this.die2] : [this.die1, this.die1, this.die1, this.die1];
        
        // Set all variants to move a single checker
        let variants = (this.die1 !== this.die2) ?
            [this.die1, this.die2, (this.die1 + this.die2)] : 
            [this.die1, this.die1, this.die1, this.die1];

        // // Gather all possible steps
        // let moves = [];
        // [].forEach.call(Object.entries(this.board), ([fromFieldId, fromFieldVal]) => {
        //     if (isMyField(fromFieldVal, color) && fromFieldVal) {
        //         steps.forEach((d) => {

        //             console.log('fromFieldId, d: ', fromFieldId, d);

        //             let toFieldId = String((fromFieldId + d) % 24);
                    
        //             console.log('toFieldId: ', toFieldId);

        //             if (isMyField(this.board[toFieldId], color)) {
        //                 let move = {};
        //                 move[fromFieldId] = -color;
        //                 move[toFieldId] = color;

        //                 console.log(move);

        //                 moves.push(move);
        //             };
        //         });
        //     };
            
        // });





        // console.log(moves);






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