import _ = require('lodash');
import xdiff from './xdiff';

interface LoDashMixins extends _.LoDashStatic {
  xdiff<T>(array: T[], values: T[]): T[];
}

_.mixin({xdiff});

export default (_ as LoDashMixins);
