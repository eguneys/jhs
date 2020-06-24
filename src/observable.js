function Observable(instance) {
  
  let subs = [];

  const notify = () => {
    setTimeout(() => {
      subs.forEach(_ => _(instance));
    }, 0);
  };

  this.touch = () => notify();

  this.apply = (fn) => {
    return fn(instance);
  };

  this.set = (fn) => {
    instance = fn(instance);

    notify();

    return instance;
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
