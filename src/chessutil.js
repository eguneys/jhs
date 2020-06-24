const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
const ranks = ['1', '2', '3', '4', '5', '6', '7', '8'];

const fileOf = square => square[0];
const rankOf = square => square[1];

const fileIndex = square => files.indexOf(fileOf(square));
const rankIndex = square => ranks.indexOf(rankOf(square));

const square = (file, rank) => file + rank;

const iteratorWhiteFiles = files.slice(0);
const iteratorWhiteRanks = ranks.slice(0).reverse();

const iteratorBlackFiles = files.slice(0).reverse();
const iteratorBlackRanks = ranks.slice(0);

const makeIteratorSquares = (iteratorFiles, iteratorRanks) => {
  return (() => {
    let res = [];

    for (let i = 0; i < 8; i++) {
      let rank = iteratorRanks[i];
      for (let j = 0; j < 8; j++) {
        let file = iteratorFiles[j];
        res.push(square(file, rank));
      }
    }
    return res;
  })();
};

module.exports = {
  files,
  ranks,
  fileIndex,
  rankIndex,
  fileOf,
  rankOf,
  makeIteratorSquares,
  iteratorWhiteFiles,
  iteratorWhiteRanks,
  iteratorBlackFiles,
  iteratorBlackRanks
};
