import { Role } from '../types/Role';
import { assert } from './assert';


export function assertRole(req, ...roles) {
  assert(req?.user, 401, 'Session timeout');
  if (roles && roles.length) {
    const { role } = req?.user;
    assert(roles.includes(role), 403, `Invalid permission ('${role}' is to access '${roles.join()}')`);
  }
}
