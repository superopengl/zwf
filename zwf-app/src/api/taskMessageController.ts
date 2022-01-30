import { getEventChannel } from '../services/globalEventSubPubService';
import { TaskThreadInformation } from '../entity/views/TaskThreadInformation';
import { filter } from 'rxjs/operators';

import { getRepository } from 'typeorm';
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
import { TaskMessage } from '../entity/TaskMessage';
import { assertTaskAccess } from '../utils/assertTaskAccess';


export const listTaskMessages = handlerWrapper(async (req, res) => {
  const role = getRoleFromReq(req);
  assert(role !== Role.System, 404);
  const { taskId } = req.params;

  let query;
  switch (role) {
    case Role.Admin:
    case Role.Agent:
      const orgId = getOrgIdFromReq(req);
      query = {
        orgId,
        taskId
      }
      break;
    case Role.Client:
      query = {
        taskId,
        taskUserId: getUserIdFromReq(req)
      }
      break;
    case Role.Guest:
      query = {
        taskId,
      }
      break;
    default:
      assert(false, 404);
  }

  const list = await getRepository(TaskThreadInformation).find({
    where: query,
    order: {
      createdAt: 'DESC'
    }
  });

  res.json(list);
});

const TASK_MESSAGE_EVENT_TYPE = 'zwf.task.message'

export const subscribeTaskMessage = handlerWrapper(async (req, res) => {
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

  const channelSubscription$ = getEventChannel(TASK_MESSAGE_EVENT_TYPE)
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


export const newTaskMessage = handlerWrapper(async (req, res) => {
  const role = getRoleFromReq(req);
  assert(role !== Role.System, 404);

  const { id, message } = req.body;
  assert(message, 400, 'Empty message body');
  const { taskId } = req.params;
  const taskRepo = getRepository(Task);
  const task = await taskRepo.findOne(taskId);
  assert(task, 404);
  const senderId = role === Role.Guest ? task.userId : getUserIdFromReq(req);
  const orgId = task.orgId;

  const taskMessage = new TaskMessage();
  taskMessage.id = id || uuidv4();
  taskMessage.orgId = orgId;
  taskMessage.senderId = senderId;
  taskMessage.taskId = taskId;
  taskMessage.message = message;

  await getRepository(TaskMessage).insert(taskMessage);

  publishEvent(TASK_MESSAGE_EVENT_TYPE, taskMessage);

  res.json();
});


