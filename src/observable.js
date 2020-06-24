function Observable(instance) {
  
  let subs = [];

  const notify = () => {
    subs.forEach(_ => _(instance));
  };

  this.touch = () => notify();

  this.apply = (fn) => {
    return fn(instance);
  };

  this.mutate = (fn) => {
    let res = fn(instance);

    notify();

    return res;
  };

  this.sub = _ => subs.push(_);

}

function observable(instance) {
  return new Observable(instance);
}

module.exports = observable;
