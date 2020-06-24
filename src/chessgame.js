let cu = require('./chessutil');
let Chess = require('./chess');

const fenStartPos = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";

function ChessGame() {

  let fen = fenStartPos;

  let chess;

  let getChess = () => {
    if (!chess) {
      chess = new Chess(fen);
    }
    return chess;
  };

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

  this.squareColor = (square) => {
    let chess = getChess();

    return chess.squareColor(square);
  };

  this.piece = square => {
    let chess = getChess();

    return chess.piece(square);
  };

}

function ChessDisplayData(iteratorFiles,
                          iteratorRanks) {

  this.iteratorSquares = cu
    .makeIteratorSquares(iteratorFiles,
                         iteratorRanks);
  
}

const whiteDisplayData = new ChessDisplayData(
  cu.iteratorWhiteFiles,
  cu.iteratorWhiteRanks);

const blackDisplayData = new ChessDisplayData(
  cu.iteratorBlackFiles,
  cu.iteratorBlackRanks);

module.exports = {
  ChessGame,
  displayData: {
    white: whiteDisplayData,
    black: blackDisplayData
  }
};
