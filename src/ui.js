let rect = require('./rect');
let { Term, SGR, SGR_Style } = require('./term');

let cu = require('./chessutil');

const withTerm = fTermRender => {
  let term = new Term();

  let fRender = fTermRender(term);

  return (...args) => {
    fRender(...args);
    term.flush();
  };
};

const renderOpponent = withTerm(term =>
  (ctx, player) => {

    let { bs } = ctx;

    let { opponent: bsPlayer } = bs;

    renderPlayerBase(term, bsPlayer, player);

  });

const renderPlayer = withTerm(term =>
  (ctx, player) => {

    let { bs } = ctx;

    let { player: bsPlayer } = bs;

    renderPlayerBase(term, bsPlayer, player);

  });

const renderPlayerBase = (term, bs, player) => {

  if (!player) {
    return;
  }
  
  term.moveTo(bs.x, bs.y);

  let name = player.aiLevel ? `Stockfish ${player.aiLevel}`:player.name;

  let rating = player.rating ? `(${player.rating})`:'';
  
  term.text(name);
  term.text(rating);

};

const unicodePieces = {
  'r': '♜',
  'n': '♞',
  'b': '♝',
  'q': '♛',
  'k': '♚',
  'p': '♙',
};

const renderBoard = withTerm(term =>
  (ctx, board, displayData) => {
    let { bs } = ctx;

    let { board: bsBoard } = bs;

    let row = 0,
        column = 0;

    for (let square of displayData.iteratorSquares) {
      let rank = cu.rankOf(square);
      let file = cu.fileOf(square);

      if (column === 0) {
        term.moveTo(bsBoard.x, bsBoard.y + row);
        term.text(`${rank} `);
      }

      if (row === 7) {
        term.moveTo(bsBoard.x + 2 + column * 3 + 1,
                    bsBoard.y + row + 1);
        term.text(`${file}`);
      }

      term.moveTo(bsBoard.x + 2 + column * 3, bsBoard.y + row);
      column++;
      if (column >= 8) {
        row++;
        column = 0;
      }

      let squareColor = board.squareColor(square);

      if (squareColor === 'light') {
        term.style(SGR_Style.Background.Light);
      } else {
        term.style(SGR_Style.Background.Dark);
      }

      let piece = board.piece(square);

      if (!piece) {
        term.text('   ');
      } else {

        let { type, color } = piece;

        if (color === 'b') {
          term.style(SGR_Style.Foreground.Black);
        } else {
          term.style(SGR_Style.Foreground.White);
        }

        term.text(` ${unicodePieces[type]} `);

      }
      term.reset();
    }
  });

const renderBackground = withTerm(term => 
  (ctx) => {
    let { bs } = ctx;

    let { userInput, chat } = bs;

    term.moveTo(1, 1);
    term.eraseArea(1, 1, 80, 80);

    let { label } = userInput;

    renderBox(term, {
      x: label.x,
      y: label.y,
      w: label.w,
      h: 2
    }, {
      label: `Input:`,
      hideBottom: true
    });

    renderBox(term, chat, {
      label: `Chat`
    });

  }
);

const renderAccount = withTerm(term =>
  (ctx, username) => {
    
    

  });

const renderChat = withTerm(term =>
  (ctx, messages) => {

    let { bs } = ctx;

    let { chat } = bs;

    if (messages.length === 0) {
      return;
    }

    let textBounds = rect(
      chat.x + 1,
      chat.y + 1,
      chat.w - 2,
      chat.h - 2
    );

    term.eraseArea(textBounds.x,
                   textBounds.y,
                   textBounds.w,
                   textBounds.h);


    let lastMessage = messages[messages.length - 1];
    renderChatMessage(term, lastMessage, textBounds);
  }
);

const renderChatMessage = (term, message, textBounds) => {
  let { user, text } = message;

  if (!user) {
    renderWrapText(term, `${text}`, textBounds);
  } else {
    renderWrapText(term, `${user}: ${text}`, textBounds);
  }
};

const renderStatus = withTerm(term =>
  (ctx, model) => {

    let { bs } = ctx;

    let { leftMargin } = bs;

    let { white, text } = model;

    term.moveTo(leftMargin, 1);

    if (white) {
      term.style(SGR_Style.Background.White,
                 SGR_Style.Foreground.Black);
    } else {
      term.style(SGR_Style.Foreground.White,
                 SGR_Style.Background.Black);
    }

    term.text(`  ${text}  \n`);
    term.reset();
  }
);

const renderInput = withTerm(term =>
  (ctx, { text, placeholder }) => {
    let { bs } = ctx;

    let { userInput: { input } } = bs;

    let { x, y, w } = input;

    term.eraseArea(x, y, w, 1);
    term.moveTo(x, y);
    if (!text) {
      term.style(SGR_Style.Italic);
      term.text(`  ${placeholder}`.slice(-w));
      term.moveTo(x, y);
    } else {
      term.text(`${text}`.slice(-w));
    }
    term.reset();
  }
);

const moveToInput = withTerm(term =>
  (ctx, length) => {
    
    let { bs } = ctx;

    let { x, y } = bs.userInput.input;
    
    term.moveTo(x + length, y);
  });


const renderHelp = withTerm(term =>
  (ctx, helpText) => {

    let { bs } = ctx;

    let { help } = bs;

    renderBox(term, help, {
      label: 'Help'
    });

    let textBounds = rect(
      help.x + 1,
      help.y + 1,
      help.w - 2,
      help.h - 2);

    term.eraseArea(textBounds.x,
                   textBounds.y,
                   textBounds.w,
                   textBounds.h);

    renderWrapText(term, helpText, textBounds);
  }
);

function renderBox(term, bounds, options) {
  let { x, y, w, h } = bounds;

  let { label, hideBottom } = options;

  let boxmap = {
    lu: '┏',
    up: '━',
    ru: '┓',
    ld: '┗',
    down: '━',
    rd: '┛',
    left: '┃',
    right: '┃'
  };

  function bm(v) {
    term.text(boxmap[v]);
  }

  term.moveTo(x, y);
  bm('lu');
  for (let i = 1; i < w - 1; i ++) {
    bm('up');
  }
  bm('ru');
  for (let i = 1; i < h - 1; i++) {
    term.moveTo(x, y + i);
    bm('left');
    term.moveTo(x + w - 1, y + i);
    bm('right');
  }
  term.moveTo(x, y + h - 1);
  bm('ld');
  if (!hideBottom) {
    for (let i = 1; i < w - 1; i ++) {
      bm('down');
    }  
  }
  term.moveTo(x + w - 1, y + h - 1);
  bm('rd');  

  if (label) {
    term.moveTo(x + 3, y);
    term.text(label);
  }
}

function renderWrapText(term, text, bounds) {
  // https://stackoverflow.com/questions/7033639/split-large-string-in-n-size-chunks-in-javascript/10915724
  function chunkString(str, length) {
    return str.match(
      new RegExp('.{1,' + length + '}', 
                 'g'));
  }

  let sss = chunkString(text, bounds.w - 1);

  for (let i = 0; i < sss.length; i++) {
    if (i >= bounds.h) {
      break;
    }
    term.moveTo(bounds.x, bounds.y + i);
    term.text(`${sss[i]}`);
    if (sss[i].length === bounds.width - 1 && sss[i+1]) {
      term.text('-');
    }
  }

  return sss.length;
}

module.exports = {
  renderBoard,
  renderPlayer,
  renderOpponent,
  renderBackground,
  renderAccount,
  renderStatus,
  renderInput,
  renderHelp,
  renderChat,
  moveToInput
};
