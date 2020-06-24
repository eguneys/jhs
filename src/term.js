const CSI = '\x1b[';

function Term() {

  let buftext = '';

  const pushText = _ => buftext += _;
  const clearText = () => buftext = '';

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


module.exports = Term;
