import { getRepository } from 'typeorm';
import { getRoleFromReq } from '../utils/getRoleFromReq';
import { Role } from '../types/Role';
import * as httpAssert from 'http-assert';
import { Task } from '../entity/Task';
import { getUserIdFromReq } from '../utils/getUserIdFromReq';
import { handlerWrapper } from '../utils/asyncHandler';

export const taskDirectLinkHanlder = handlerWrapper(async (req, res) => {
  const token = req.params.token;
  const role = getRoleFromReq(req);
  if (role === Role.Client) {
    const userId = getUserIdFromReq(req);
    const task = await getRepository(Task).findOne({
      deepLinkId: token,
      userId
    })
    httpAssert(task, 404);
    // Redirect to a logged in task page
    res.redirect(`${process.env.ZWF_WEB_DOMAIN_NAME}/task/${task.id}`);
  } else if (role === Role.Guest) {
    // Redirect to a task deep page without login
    res.redirect(`${process.env.ZWF_WEB_DOMAIN_NAME}/task/direct/${token}`);
  } else {
    httpAssert(false, 404);
  }
});