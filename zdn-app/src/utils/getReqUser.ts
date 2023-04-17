import { Role } from '../types/Role';
import { User } from '../entity/User';

export function getReqUser(req): User {
  return req?.user as User;
}


