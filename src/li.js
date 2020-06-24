let observable = require('./observable');
let Lichess = require('./lichess');

let ChessGame = require('./chessgame');
let Pov = require('./pov');

const loginFailed = status => `Login failed: ${status}\n Probably bad token`;

const gameFailedTryClassical = error => `${error}\n Try Classical or Rapid instead`;

const texts = {
  'gameinprogress': 'game in progress.'
};

function Li(uiapp) {
  let token;

  let oAccount = this.oAccount = observable({});

  let oAccountName = () => oAccount
      .apply(_ => _.data.username);

  let oGameStart = observable(null);

  oGameStart.sub(id => {
    this.listenGameEvents(id);
  });

  let oAddGameChat = this.oAddGameChat = observable(null);

  const effectAddGameChat = (username, text) => {
    oAddGameChat.set(_ => ({
      username,
      text
    }));
  };

  this.povOPlayers = new Pov(observable(null),
                             observable(null));


  this.oPlayer = this.povOPlayers.player;
  this.oOpponent = this.povOPlayers.opponent;

  const effectPlayerPov = (white, black, isWhite) => {

    this.povOPlayers.pov(_ => _.set(_ => white),
                         _ => _.set(_ => black),
                         isWhite);

  };

  let oGame = this.oGame = observable(new ChessGame());

  const effectSetFenState = (fen, state) => {
    oGame.mutate(_ => {
      _.fen(fen);
      _.state(state);
    });
  };

  const effectSetState = (state) => {
    oGame.mutate(_ => _.state(state));
  };
  
  this.login = async _token => {
    token = _token;

    try {
      let acc = await Lichess.account(token);

      oAccount.set(_ => acc);
    } catch (e) {
      if (e.response) {
        uiapp
          .effectSystemChat(
            loginFailed(e.response.status));
      } else {
        throw e;
      }
    }
  };

  this.listenGameEvents = async (gameId) => {
    const onEvent = (event) => {
      let { type } = event;

      switch (type) {
      case "gameFull":
        let { white, black, initialFen, state } = event;

        effectSetFenState(initialFen, state);

        effectPlayerPov(white,
                        black, 
                        white.name === oAccountName());

        effectAddGameChat(gameId,
                          texts.gameinprogress);

        break;
      case "gameState":
        effectSetState(event);
        break;
      case "chatLine":
        effectAddGameChat(event.username,
                          event.text);
        break;
      }

    };

    const onError = (err) => {
      effectAddGameChat(`${gameId}`, gameFailedTryClassical(err.error));
    };

    let ndStream = await Lichess
        .streamGameState(token, gameId, onEvent, onError);
  };

  this.listenGameStartEvent = async () => {

    const onEvent = (event) => {
      let { type } = event;

      if (type === 'gameStart') {
        let { game: { id } } = event;
        oGameStart.set(_ => id);
      }
    };
    
    let ndStream = await Lichess
        .incomingEvents(token, onEvent);
  };

}

module.exports = Li;
