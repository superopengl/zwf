import { getRepository } from 'typeorm';
import { getRoleFromReq } from '../utils/getRoleFromReq';
import { Role } from '../types/Role';
import * as httpAssert from 'http-assert';
import { Task } from '../entity/Task';
import { getUserIdFromReq } from '../utils/getUserIdFromReq';
import { handlerWrapper } from '../utils/asyncHandler';
import { assertRole } from '../utils/assertRole';
import { getOrgIdFromReq } from '../utils/getOrgIdFromReq';
import { assert } from '../utils/assert';
import { AppDataSource } from '../db';

export const taskDirectLinkHanlder = handlerWrapper(async (req, res) => {
  const token = req.params.token;
  const role = getRoleFromReq(req);

  let query: any = {
    deepLinkId: token,
  };

  switch (role) {
    case Role.Admin:
    case Role.Agent:
      const orgId = getOrgIdFromReq(req);
      query = {
        ...query,
        orgId,
      };
      break;
    case Role.Client:
      const userId = getUserIdFromReq(req);
      query = {
        ...query,
        userId
      };
      break;
    case Role.Guest:
      // Redirect to a task deep page without login
      res.redirect(`${process.env.ZWF_WEB_DOMAIN_NAME}/task/direct/${token}`);
    case Role.System:
      assert(false, 403, 'Task direct link is for org, client and guest users.');
    default:
      assert(false, 404);
  }

  const task = await AppDataSource.getRepository(Task).findOne({
    where: query,
    select: ['id']
  });
  httpAssert(task, 404);
  // Redirect to a logged in task page
  res.redirect(`${process.env.ZWF_WEB_DOMAIN_NAME}/task/${task.id}`);
});