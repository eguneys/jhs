const { Chess: ChessApi } = require('chess.js');

function Chess(fen) {

  const chess = new ChessApi(fen);

  this.moves = (moves) => {
    moves.forEach(_ => chess.move(_, { sloppy: true }));
  };

  this.squareColor = square => {
    return chess.square_color(square);
  };

  this.piece = square => {
    return chess.get(square);
  };

}

module.exports = Chess;
