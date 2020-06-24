function CommandHandlers(exportActions) {
  let { actionSetApiToken,
        effectSystemChat } = exportActions;

  const regexCommand = (matchCmd, fn) => {
    return (cmd, ...args) => {
      if (cmd.match(matchCmd)) {
        fn(...args);
        return true;
      }
      return false;
    };
  };

  const setApiToken = regexCommand(/\/token/, (token) => {
    actionSetApiToken(token);
  });

  return [
    setApiToken
  ];
};

module.exports = CommandHandlers;
