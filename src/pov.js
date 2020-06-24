function Pov(player, opponent) {

  this.player = player;
  this.opponent = opponent;

  this.pov = (white, black, isWhite) => {

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
