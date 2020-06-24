const { Chess: ChessApi } = require('chess.js');

function Chess(fen) {

  const chess = new ChessApi(fen);

  this.moves = (moves) => {
    moves.forEach(_ => chess.move(_, { sloppy: true }));
  };

  this.ascii = () => {
    return chess.ascii();
  };

}

module.exports = Chess;
