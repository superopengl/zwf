import { Role } from '../types/Role';


export function isRole(req: any, role: Role) {
  return role === (req?.user?.role || Role.Guest);
}
