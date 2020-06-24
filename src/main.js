let { inApp,
      actionSetApiToken,
      actionUserInput,
      actionHelpInput } = require('./uiapp');

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

let apiToken = process.env.LICHESS_API_TOKEN;

if (apiToken) {
  actionSetApiToken(apiToken);
}
