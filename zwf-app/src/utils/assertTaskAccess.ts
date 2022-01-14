import { Task } from './../entity/Task';
import { getRepository } from 'typeorm';
import { assert } from "console";
import { Role } from "../types/Role";
import { getRoleFromReq } from "./getRoleFromReq";
import { getOrgIdFromReq } from './getOrgIdFromReq';
import { getUserIdFromReq } from './getUserIdFromReq';


export async function assertTaskAccess(req, taskId) {
  const role = getRoleFromReq(req);
  let query: any = {id: taskId};
  switch(role) {
    case Role.Admin: 
    case Role.Agent:
      query = {
        ...query,
        orgId: getOrgIdFromReq(req),
      }
      break;
    case Role.Client:
      query = {
        ...query,
        userId: getUserIdFromReq(req), 
      }
      break;
    default:
      assert(false, 403, 'Invliad role access');
  }

  const has = await getRepository(Task).findOne(query);
  assert(!!has, 404, 'Cannot find task');
}
