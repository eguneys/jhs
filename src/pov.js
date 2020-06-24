function Pov(player, opponent) {

  this.player = player;
  this.opponent = opponent;

  let isWhite;

  this.isWhite = () => isWhite;

  this.pov = (white, black, _isWhite) => {
    isWhite = _isWhite;

    if (isWhite) {
      white(player);
      black(opponent);
    } else {
      white(opponent);
      black(player);
    }

  };
}

module.exports = Pov;
