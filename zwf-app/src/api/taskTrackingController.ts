import { TaskStatus } from './../types/TaskStatus';
import { TaskTrackingInformation } from './../entity/views/ClientTaskTrackingInformation';
import { TaskTracking } from './../entity/TaskTracking';
import { getEventChannel } from '../services/globalEventSubPubService';
import { filter } from 'rxjs/operators';

import { getRepository, getManager, In } from 'typeorm';
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
import { logTaskChat, nudgeTrackingAccess, TASK_ACTIVITY_EVENT_TYPE } from '../services/taskTrackingService';
import { assertRole } from '../utils/assertRole';


export const nudgeTrackingCursor = handlerWrapper(async (req, res) => {
  assertRole(req, 'admin', 'agent', 'client');
  const { id } = req.params;
  const userId = getUserIdFromReq(req);
  await nudgeTrackingAccess(getManager(), id, userId);
  res.json();
});

export const listTaskTrackings = handlerWrapper(async (req, res) => {
  assertRole(req, 'admin', 'agent', 'client');
  const role = getRoleFromReq(req);
  assert(role !== Role.System, 404);
  const { id } = req.params;
  const userId = getUserIdFromReq(req);

  let list;
  await getManager().transaction(async m => {
    list = await m.find(TaskTrackingInformation, {
      where: {
        taskId: id,
        ...(role === Role.Client ? { userId } : { orgId: getOrgIdFromReq(req) }),
      },
      order: {
        createdAt: 'ASC'
      },
      select: [
        'id',
        'createdAt',
        'by',
        'action',
        'info'
      ]
    });

    await nudgeTrackingAccess(m, id, userId);
  })



  res.json(list);
});


export const listMyTaskTrackings = handlerWrapper(async (req, res) => {
  assertRole(req, 'client');
  const userId = getUserIdFromReq(req);
  const page = +req.query.page || 1;
  const size = +req.query.size || 50;

  const list = await getRepository(TaskTrackingInformation).find({
    where: {
      userId,
      status: In([TaskStatus.IN_PROGRESS, TaskStatus.ACTION_REQUIRED, TaskStatus.DONE])
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
  })

  res.json(list);
});


export const subscribeTaskTracking = handlerWrapper(async (req, res) => {
  // assertRole(req, 'admin', 'agent', 'client', 'guest');
  const role = getRoleFromReq(req);
  assert(role !== Role.System, 404);
  const { id } = req.params;

  await assertTaskAccess(req, id);

  // const { user: { id: userId } } = req as any;
  const isProd = process.env.NODE_ENV === 'prod';
  if (!isProd) {
    res.setHeader('Access-Control-Allow-Origin', process.env.ZWF_WEB_DOMAIN_NAME);
  }
  res.sse();
  // res.setHeader('Content-Type', 'text/event-stream');
  // res.setHeader('Cache-Control', 'no-cache');
  // res.flushHeaders();

  // res.writeHead(200, {
  //   // Connection: 'keep-alive',
  //   // 'Content-Type': 'text/event-stream',
  //   // 'Cache-Control': 'no-cache',
  //   'Access-Control-Allow-Origin': 'http://localhost:6007'
  // });
  // res.flushHeaders();

  const channelSubscription$ = getEventChannel(TASK_ACTIVITY_EVENT_TYPE)
    .pipe(
      filter(x => x?.taskId === id)
    )
    .subscribe((event) => {
      res.write(`data: ${JSON.stringify(event)}\n\n`);
      (res as any).flush();
    });

  res.on('close', () => {
    channelSubscription$.unsubscribe();
    res.end();
  });
});


export const createNewTaskTracking = handlerWrapper(async (req, res) => {
  const role = getRoleFromReq(req);
  assert(role !== Role.System, 404);

  const { id: taskId } = req.params;
  const { message } = req.body;
  assert(message, 400, 'Empty message body');

  const taskRepo = getRepository(Task);
  const task = await taskRepo.findOne(taskId);
  assert(task, 404);

  const senderId = role === Role.Guest ? task.userId : getUserIdFromReq(req);

  const m = getManager();
  await logTaskChat(m, taskId, senderId, message);

  res.json();
});


