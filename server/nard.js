class Nard {

    constructor(p1, p2) {
        this._players = [p1, p2];
        this.turns = [null, null];

        this._sendToPlayers('GAme is STARTING NOW!');

        this._players.forEach((player, idx) => {
            player.on('turn', () => {
                this._onTurn(idx, turn);
            })
        });


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