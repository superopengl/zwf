import { db } from '../db';
import { TaskActivityInformation } from '../entity/views/TaskActivityInformation';
import { Task } from '../entity/Task';
import { assert } from '../utils/assert';
import { handlerWrapper } from '../utils/asyncHandler';
import * as _ from 'lodash';
import { Role } from '../types/Role';
import { getOrgIdFromReq } from '../utils/getOrgIdFromReq';
import { getRoleFromReq } from '../utils/getRoleFromReq';
import { getUserIdFromReq } from '../utils/getUserIdFromReq';
import { createTaskComment } from '../services/taskCommentService';
import { assertRole } from '../utils/assertRole';
import { ZeventName } from '../types/ZeventName';
import { addTaskWatcher } from '../utils/addWTaskWatcher';


export const listTaskComment = handlerWrapper(async (req, res) => {
  assertRole(req, ['admin', 'agent', 'client']);
  const role = getRoleFromReq(req);
  assert(role !== Role.System, 404);
  const { id } = req.params;
  const userId = getUserIdFromReq(req);

  let list;
  await db.manager.transaction(async m => {
    list = await m.find(TaskActivityInformation, {
      where: {
        taskId: id,
        type: ZeventName.TaskComment,
        ...(role === Role.Client ? { userId } : { orgId: getOrgIdFromReq(req) }),
      },
      order: {
        createdAt: 'ASC'
      },
      select: {
        eventId: true,
        createdAt: true,
        by: true,
        type: true,
        info: true,
      }
    });
  });



  res.json(list);
});


export const listAllMyHistoricalTaskComments = handlerWrapper(async (req, res) => {
  assertRole(req, ['client']);
  const userId = getUserIdFromReq(req);
  const page = +req.query.page || 1;
  const size = +req.query.size || 50;

  const list = await db.getRepository(TaskActivityInformation).find({
    where: {
      userId,
    },
    order: {
      createdAt: 'DESC'
    },
    skip: (page - 1) * size,
    take: size,
    select: [
      'eventId',
      'taskId',
      'taskName',
      'orgId',
      'orgName',
      'createdAt',
      'by',
      'type',
      'info',
    ]
  });

  res.json(list);
});

export const addTaskComment = handlerWrapper(async (req, res) => {
  const role = getRoleFromReq(req);
  assert(role !== Role.System, 404);
  // assertRole(req, ['admin', 'agent', 'client']);

  const { id: taskId } = req.params;
  const { message, mentionedUserIds } = req.body;
  assert(message, 400, 'Empty message body');

  await db.transaction(async m => {
    const taskRepo = db.getRepository(Task);
    const task = await taskRepo.findOneOrFail({
      where: {
        id: taskId
      },
      relations: {
        orgClient: true
      }
    });
  
    for(const userId of mentionedUserIds) {
      await addTaskWatcher(m, taskId, userId, 'mentioned');
    }
    
    const senderId = role === Role.Guest ? task.orgClient?.userId : getUserIdFromReq(req);
  
    await createTaskComment(m, task, senderId, message);
  })


  res.json();
});


