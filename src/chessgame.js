let Chess = require('./chess');

const fenStartPos = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";

function ChessGame() {

  let fen = fenStartPos;

  let chess;

  this.fen = (_fen) => {
    if (_fen === "startpos") {
      _fen = fenStartPos;
    }
    fen = _fen;
  };

  this.state = (state) => {
    chess = new Chess(fen);

    chess.moves(state.moves.split(" "));
  };

  this.ascii = () => {
    if (!chess) {
      chess = new Chess(fen);
    }

    return chess.ascii();
  };

}

module.exports = ChessGame;
