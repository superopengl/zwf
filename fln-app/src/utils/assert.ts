import * as httpAssert from 'http-assert';
import * as _ from 'lodash';
import { Role } from '../types/Role';

export function assert(condition, httpCode = 500, message?) {
  httpAssert(condition, httpCode, message);
}

export const assertRole = (req, ...roles) => {
  if (roles && roles.length) {
    const role = req?.user?.role;
    if (role === Role.System) {
      return;
    }
    assert(roles.includes(role), 403, `Invalid permission ('${role}' is to access '${roles.join()}')`);
  }
};


