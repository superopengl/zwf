import { Role } from './../types/Role';


export function getRoleFromReq(req): string {
  return req?.user?.role || Role.Guest;
}
