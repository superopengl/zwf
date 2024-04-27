import { Task } from './../entity/Task';
import { getRepository } from 'typeorm';
import { assert } from "console";
import { Role } from "../types/Role";
import { getRoleFromReq } from "./getRoleFromReq";
import { getOrgIdFromReq } from './getOrgIdFromReq';
import { getUserIdFromReq } from './getUserIdFromReq';
import { AppDataSource } from '../db';


export async function assertTaskAccess(req, taskId): Promise<Task> {
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

  const task = await AppDataSource.getRepository(Task).findOne({where: query, select: {id: true}});
  assert(!!task, 404, 'Cannot find task');

  return task;
}
