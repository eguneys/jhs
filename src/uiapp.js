let observable = require('./observable');
let rect = require('./rect');

let ui = require('./ui');

let CommandHandlers = require('./commands');

let Li = require('./li');

const helpText = `
Type ? to display this help text.
Commands
/token API_TOKEN : set API_TOKEN
export $LICHESS_API_TOKEN to automatically connect
 
Press any key to return to app.
`;

const saveATokenWelcomeMessage = `
Welcome, set your api token to connect lichess, type ? to see help.
`;

const tokenSetMessage = token => `
Successfully set token ${token} trying to login...
`;

const texts = {
  'help': 'Type ? for help.',
  'saveatoken': 'Set a Token',
  'welcome': s => `Welcome ${s}`,
  'createagame': 'Create a Game',
  'yourmove': 'Your move',
  'waitingopponent': 'Waiting for opponent'
};

let oApp = observable({});

const effectAppPopup = (value) => {
  oApp.mutate(_ => {
    if (value) {
      _.popup = value;
    } else {
      delete _.popup;
    }
  });
};

let oBackground = observable({});

let oStatus = observable({
  white: true,
  text: texts.saveatoken
});

let oUserInput = observable({
  text: '',
  placeholder: texts.help
});

let oChat = observable([]);

const effectSystemChat = text => {
  effectChatAdd(``, text);
};

const effectChatAdd = (user, text) => {
  oChat.mutate(_ => _.push({
    user,
    text
  }));
};

let oApiToken = observable({});

const actionSetApiToken = token => {
  oApiToken.mutate(_ => _.token = token);

  effectSystemChat(tokenSetMessage(token));
};

let bs = (() => {

  let uiMargin = 1;
  let leftMargin = 4;


  let gameStatus = rect(leftMargin, 1, 23, 1);

  let board = rect(leftMargin, 
                   gameStatus.y1 + uiMargin,
                   26,
                   9);                   

  let userInput = rect(leftMargin, board.y1 + uiMargin,
                       board.w,
                       1);

  let opponent = rect(userInput.x1 + uiMargin,
                      uiMargin,
                      20,
                      9);

  let player = rect(opponent.x,
                    opponent.y1 + uiMargin,
                    opponent.w,
                    opponent.h);

  return {
    board,
    opponent,
    player,
    leftMargin,
    userInput: {
      label: userInput,
      input: rect(userInput.x + 1,
                  userInput.y + 1,
                  userInput.w - 3,
                  userInput.h)
    },
    chat: rect(leftMargin,
               userInput.y1 + uiMargin, 
               userInput.w, 
               10),
    help: rect(leftMargin,
               leftMargin,
               50,
               20)
  };

})();

const ctx = {
  bs
};



const effectStatus = (text, white) => {
  oStatus.mutate(_ => {
    _.text = text;
    _.white = white;
  });
};

const effectUserInput = text => {
  oUserInput.mutate(_ => _.text += text);
};

const effectUserInputClear = () => {
  oUserInput.mutate(_ => _.text = '');
};

const effectUserInputBackSpace = () => {
  oUserInput.mutate(_ => 
    _.text = _.text.slice(0, _.text.length - 1));
};

const actionParseUserInput = () => {
  let sInput = oUserInput.apply(_ => _.text);

  let aInput = sInput.split(' ');

  if (aInput.length > 0) {
    
    let cmd = aInput[0];
    let args = aInput.slice(1, aInput.length);

    let handled = commandHandlers
        .reduce((handled, handler) =>
          handled ? handled : handler(cmd, ...args)
          , false);
    
    if (!handled) {
      effectSystemChat(`Bad command ${cmd}`);
    }
  }
};


const checkImmediateHelp = () => {
  let text = oUserInput.apply(_ => _.text);
  if (text === '?') {
    effectAppPopup('help');
  }
};

const actionUserInput = (input) => {
  switch (input) {
  case '\u0004':
  case '\r':
  case '\n':
    actionParseUserInput();
    effectUserInputClear();
    break;
  default:
    if (input.charCodeAt(0) === 127) {
      effectUserInputBackSpace();
    } else {
      effectUserInput(input);
      checkImmediateHelp();
    }
  };
};

const actionHelpInput = (input) => {
  switch (input) {
  default:
    effectAppPopup();
    effectUserInputClear();
  }
};

const updateApp = (ctx, app) => {
  
  let { popup } = app;

  if (!popup) {
    touchInApp();
  } else if (popup === 'help') {
    ui.renderHelp(ctx, helpText);
  } 

};

const fId = _ => _;

function inApp(fRender, fHelp) {
  return (...args) => {
    let popup = oApp.apply(_ => _.popup);

    if (!popup) {
      fRender(...args);

      let maxInputLength = ctx.bs.userInput.input.w;

      let input = oUserInput.apply(_ => _.text);
      ui.moveToInput(ctx, Math.min(input.length, 
                                   maxInputLength));
    } else if (popup === 'help') {
      if (fHelp) {
        fHelp(...args);
      }
    }
  };
}

const exportActions = {
  actionSetApiToken,
  effectSystemChat
};

let commandHandlers = CommandHandlers(exportActions);
let li = new Li(exportActions);


let osInApp = [
  oBackground,
  oStatus,
  oChat,
  oUserInput,
  li.oPlayer,
  li.oOpponent
];

const touchInApp = () => {
  osInApp.forEach(_ => _.touch());
};

function init() {

  oApp.sub(_ => updateApp(ctx, _));

  oBackground.sub(_ => ui.renderBackground(ctx));

  oStatus.sub(inApp(_ => ui.renderStatus(ctx, _)));
  oUserInput.sub(inApp(_ => ui.renderInput(ctx, _)));
  oChat.sub(inApp(_ => ui.renderChat(ctx, _)));

  oApiToken.sub(async ({ token }) => {
    li.login(token);
  });

  effectSystemChat(saveATokenWelcomeMessage);
  oApp.touch();


  li.oAccount.sub(account => {
    inApp(_ =>
      ui.renderAccount(ctx, _.username))
    (account.data);

    let _ = account.data;

    effectStatus(texts.welcome(_.username), true);
    effectSystemChat(`Logged in as ${_.username}.`);
    li.listenGameStartEvent();
  });

  li.oAddGameChat.sub(chat => {
    effectChatAdd(chat.username, chat.text);
  });

  li.povOPlayers.player
    .sub(inApp(_ => 
      ui.renderPlayer(ctx, _)));
  li.povOPlayers.opponent
    .sub(inApp(_ => 
      ui.renderOpponent(ctx, _)));

  li.subOGameWithDisplayData(
    inApp((...args) => ui.renderBoard(ctx, ...args)));

}

init();

module.exports = {
  inApp,
  actionUserInput,
  actionHelpInput,
  ...exportActions
};
