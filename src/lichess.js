const axios = require('axios');

const config = (token, responseType) => ({
  baseURL: 'https://lichess.org',
  headers: { 'Authorization': 'Bearer ' + token },
  responseType
});

const account = async (token) => {
  return await axios.get('/api/account', config(token));
};

const streamGameState = async (token, gameId, onEvent, onError) => {
  return await streaming(
    axios
      .get(`/api/board/game/stream/${gameId}`, config(token, 'stream')),
    onEvent, onError);

};

const incomingEvents = async (token, onEvent) => {
  return await streaming(
    axios
      .get('/api/stream/event', config(token, 'stream')),
    onEvent);
};

const streaming = async (pResponse, onEvent, onError) => {

  try {
    let response = await pResponse;
    let { data: ndStream } = response;

    ndStream.setEncoding('utf8');

    ndStream.on('data', event => {
      if (event && event.length > 1) {
        let jevent;
        try {
          jevent = JSON.parse(event);
        } catch (e) {
          jevent = null;
        }
        if (jevent) {
          onEvent(jevent);
        };
      }
    });
    return ndStream;
  } catch (e) {

    if (!onError) {
      return null;
    }

    let { data: errStream } = e.response;

    errStream.setEncoding('utf8');

    errStream.on('data', event => {
      onError(JSON.parse(event));
    });

    return errStream;
  }
};

module.exports = {
  account,
  incomingEvents,
  streamGameState
};
