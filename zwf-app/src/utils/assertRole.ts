import { Role } from '../types/Role';
import { assert } from './assert';
import { getOrgIdFromReq } from './getOrgIdFromReq';
import { getRoleFromReq } from './getRoleFromReq';


export function assertRole(req, roles) {
  const role = getRoleFromReq(req);
  const orgId = getOrgIdFromReq(req);

  const hasOrg = !!orgId;
  const mustHaveOrgRole = role === Role.Admin || role === Role.Agent;
  const matchesOrg = hasOrg === mustHaveOrgRole;

  assert(roles.includes(role) && matchesOrg, 403, `Invalid permission ('${role}' is to access '${roles.join()}')`);
}

