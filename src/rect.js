function rect(x, y, w, h) {
  let y1 = y + h;
  let x1 = x + w;

  return {
    x, y, w, h, y1, x1,
    width: w,
    height: h
  };
}

module.exports = rect;
