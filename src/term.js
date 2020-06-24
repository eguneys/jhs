const CSI = '\x1b[';

const SGR = (...n) => `${CSI}${n.join(';')}m`;

const SGR_Style = {
  Reset: `49;0`,
  Bold: `1`,
  Italic: `3`,
  Underline: `4`,
  Foreground: {
    Black: `38;5;232`,
    White: `38;5;231`,
  },
  Background: {
    Black: `48;5;232`,
    White: `48;5;231`
  }
};

function Term() {

  let buftext = '';

  const pushText = _ => buftext += _;
  const clearText = () => buftext = '';

  this.reset = () => {
    pushText(SGR(SGR_Style.Reset));
  };

  this.style = (...sgrs) => {
    pushText(SGR(...sgrs));
  };

  this.text = (text) => {
    pushText(text);
  };

  this.moveTo = (x, y) => {
    let n = y;
    let m = x;
    pushText(`${CSI}${n};${m}H`);
  };

  this.eraseArea = (x, y, w, h) => {
    for (let i = 0; i < h; i++) {
      this.moveTo(x, y + i);
      let spaces = '';
      for (let j = 0; j < w; j++) {
        spaces += ' ';
      }
      this.text(spaces);
    }
  };

  this.flush = () => {

    let { stdout } = process;

    stdout.write(buftext);


    clearText();
  };
}


module.exports = {
  Term,
  SGR,
  SGR_Style
};
