import { db } from '../db';
import { TaskStatus } from '../types/TaskStatus';
import { TaskCommentInformation } from '../entity/views/TaskCommentInformation';
import { TaskComment } from '../entity/TaskComment';
import { getEventChannel } from '../services/globalEventSubPubService';
import { filter } from 'rxjs/operators';

import { In } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { Task } from '../entity/Task';
import { assert } from '../utils/assert';
import { handlerWrapper } from '../utils/asyncHandler';
import * as _ from 'lodash';
import { Role } from '../types/Role';
import { getOrgIdFromReq } from '../utils/getOrgIdFromReq';
import { getRoleFromReq } from '../utils/getRoleFromReq';
import { getUserIdFromReq } from '../utils/getUserIdFromReq';
import { publishEvent } from '../services/globalEventSubPubService';
import { assertTaskAccess } from '../utils/assertTaskAccess';
import { logTaskChat, nudgeCommentAccess, TASK_ACTIVITY_EVENT_TYPE } from '../services/taskCommentService';
import { assertRole } from '../utils/assertRole';
import { TaskActionType } from '../types/TaskActionType';


export const nudgeCommentCursor = handlerWrapper(async (req, res) => {
  assertRole(req,[ 'admin', 'agent', 'client']);
  const { id } = req.params;
  const userId = getUserIdFromReq(req);
  await nudgeCommentAccess(db.manager, id, userId);
  res.json();
});

export const listTaskComment = handlerWrapper(async (req, res) => {
  assertRole(req,[ 'admin', 'agent', 'client']);
  const role = getRoleFromReq(req);
  assert(role !== Role.System, 404);
  const { id } = req.params;
  const userId = getUserIdFromReq(req);

  let list;
  await db.manager.transaction(async m => {
    list = await m.find(TaskCommentInformation, {
      where: {
        taskId: id,
        action: TaskActionType.Chat,
        ...(role === Role.Client ? { userId } : { orgId: getOrgIdFromReq(req) }),
      },
      order: {
        createdAt: 'ASC'
      },
      select: {
        id: true,
        createdAt: true,
        by: true,
        action: true,
        info: true,
      }
    });

    await nudgeCommentAccess(m, id, userId);
  });



  res.json(list);
});


export const listAllMyHistoricalTaskComments = handlerWrapper(async (req, res) => {
  assertRole(req,[ 'client']);
  const userId = getUserIdFromReq(req);
  const page = +req.query.page || 1;
  const size = +req.query.size || 50;

  const list = await db.getRepository(TaskCommentInformation).find({
    where: {
      userId,
    },
    order: {
      createdAt: 'DESC'
    },
    skip: (page - 1) * size,
    take: size,
    select: [
      'id',
      'taskId',
      'taskName',
      'orgId',
      'orgName',
      'createdAt',
      'by',
      'action',
      'info',
    ]
  });

  res.json(list);
});

export const addTaskComment = handlerWrapper(async (req, res) => {
  const role = getRoleFromReq(req);
  assert(role !== Role.System, 404);

  const { id: taskId } = req.params;
  const { message } = req.body;
  assert(message, 400, 'Empty message body');

  const taskRepo = db.getRepository(Task);
  const task = await taskRepo.findOne({where: {id: taskId}});
  assert(task, 404);

  const senderId = role === Role.Guest ? task.userId : getUserIdFromReq(req);

  const m = db.manager;
  await logTaskChat(m, task, senderId, message);

  res.json();
});


