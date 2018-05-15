import _ = require('lodash');

export default function xdiff<T>(a: T[], b: T[]) {
  const consumed: {[key: number]: boolean} = {};
  return _.reduce(a, (diffs, val) => {
    let offset = -1;
    let i;
    while ((i = b.indexOf(val, offset + 1)) >= 0 && !consumed[offset]) {
      offset = i;
    }
    if (offset === -1 || consumed[offset]) {
      diffs.push(val);
    } else {
      consumed[offset] = true;
    }
    return diffs;
  }, []);
}
