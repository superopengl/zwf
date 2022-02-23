import { TaskTracking } from './../entity/TaskTracking';
import { getEventChannel } from '../services/globalEventSubPubService';
import { filter } from 'rxjs/operators';

import { getRepository, getManager } from 'typeorm';
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
import { logTaskChat } from '../services/taskTrackingService';


export const listTaskTrackings = handlerWrapper(async (req, res) => {
  const role = getRoleFromReq(req);
  assert(role !== Role.System, 404);
  const { id } = req.params;

  let query;
  switch (role) {
    case Role.Admin:
    case Role.Agent:
      query = {
        id,
        orgId: getOrgIdFromReq(req)
      }
      break;
    case Role.Client:
      query = {
        id,
        userId: getUserIdFromReq(req)
      }
      break;
    case Role.Guest:
      query = {
        id,
      }
      break;
    default:
      assert(false, 404);
  }

  const task = await getRepository(Task).findOne(query);
  assert(task, 404);

  const list = await getRepository(TaskTracking).find({
    where: {
      taskId: id
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

  res.json(list);
});

const TASK_ACTIVITY_EVENT_TYPE = 'zwf.task.activity'

export const subscribeTaskTracking = handlerWrapper(async (req, res) => {
  // assertRole(req, 'admin', 'agent', 'client', 'guest');
  const role = getRoleFromReq(req);
  assert(role !== Role.System, 404);
  const { taskId } = req.params;

  await assertTaskAccess(req, taskId);

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
      filter(x => x?.taskId === taskId)
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
  const orgId = task.orgId;

  const m = getManager();
  const entity = await logTaskChat(m, taskId, senderId, message);
  const eventBody = {
    ...entity,
    orgId,
  }

  publishEvent(TASK_ACTIVITY_EVENT_TYPE, eventBody);

  res.json();
});


