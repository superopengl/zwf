import { Role } from '../types/Role';
import { assert } from './assert';
import { getOrgIdFromReq } from './getOrgIdFromReq';
import { getRoleFromReq } from './getRoleFromReq';


export function assertRole(req, roles, options = { ignoreSuspendCheck: false }) {
  assert(req?.user, 401, 'Session timeout');
  const beingSuspended = req.user.suspended;
  if (roles && roles.length) {
    const reqRole = getRoleFromReq(req);
    const reqOrgId = getOrgIdFromReq(req);
    let canAccess = false;
    for (const allowedRole of roles) {
      switch (allowedRole) {
        case Role.Admin:
        case Role.Agent:
          // Org members must have orgId.
          canAccess = reqRole === allowedRole && !!reqOrgId && (options.ignoreSuspendCheck || !beingSuspended);
          break;
        case Role.System:
        case Role.Client:
        case Role.Guest:
        default:
          // Non org members must not have orgId.
          canAccess = reqRole === allowedRole && !reqOrgId;
          break;
      }

      if (canAccess) {
        break;
      }
    }

    assert(!beingSuspended, 403, `The organization has been suspended. Please get in touch with your organization's owner to request for it to be unlocked.`);
    assert(canAccess, 403, `Invalid permission ('${reqRole}' is to access '${roles.join()}')`);
  }
}

