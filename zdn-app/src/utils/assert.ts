import * as httpAssert from 'http-assert';
import * as _ from 'lodash';

export function assert(condition, httpCode = 500, message?) {
  httpAssert(condition, httpCode, message);
}


