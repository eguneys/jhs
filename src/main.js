let observable = require('./observable');
let rect = require('./rect');

let ui = require('./ui');

const helpText = `
Type ? to display this help text.
Commands
/token API_TOKEN : save API_TOKEN
 
Press any key to return to app.
`;

const saveATokenWelcomeMessage = `
Welcome, save your api token to connect lichess, type ? to see help.
`;

const texts = {
  'help': 'Type ? for help.',
  'saveatoken': 'Save a Token',
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


let bs = (() => {

  let uiMargin = 1;
  let leftMargin = 4;

  let userInput = rect(leftMargin, 10, 23, 1);

  return {
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
                  23, 
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

oApp.sub(_ => updateApp(ctx, _));

oBackground.sub(_ => ui.renderBackground(ctx));

oStatus.sub(inApp(_ => ui.renderStatus(ctx, _)));
oUserInput.sub(inApp(_ => ui.renderInput(ctx, _)));
oChat.sub(inApp(_ => ui.renderChat(ctx, _)));

let osInApp = [
  oBackground,
  oStatus,
  oChat,
  oUserInput
];

const touchInApp = () => {
  osInApp.forEach(_ => _.touch());
};

effectSystemChat(saveATokenWelcomeMessage);
oApp.touch();


function terminate() {
  setTimeout(() => process.exit(0), 100);
};


const { stdin } = process;

stdin.setRawMode(true);
stdin.setEncoding('utf-8');

// https://blog.bitsrc.io/build-a-password-field-for-the-terminal-using-nodejs-31cd6cfa235
stdin.on('data', (data, key) => {
  const c = data;

  switch (c) {
  case '\u0003': // ctrl - c
    terminate();
    break;
  default:
    inApp(_ => {
      actionUserInput(_);
    }, _ => {
      actionHelpInput(_);
    })(c);
  }

});
