import { getEventChannel } from '../services/globalEventSubPubService';
import { TaskThreadInformation } from '../entity/views/TaskThreadInformation';
import { getUtcNow } from '../utils/getUtcNow';
import { TaskInformation } from '../entity/views/TaskInformation';
import { filter, map } from 'rxjs/operators';

import * as moment from 'moment';
import { getManager, getRepository, Not, QueryRunner } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { TaskTemplate } from '../entity/TaskTemplate';
import { Task } from '../entity/Task';
import { Message } from '../entity/Message';
import { User } from '../entity/User';
import { TaskStatus } from '../types/TaskStatus';
import { sendEmailImmediately } from '../services/emailService';
import { assert } from '../utils/assert';
import { assertRole } from "../utils/assertRole";
import { handlerWrapper } from '../utils/asyncHandler';
import { createTaskByTaskTemplateAndEmail, generateTaskByTaskTemplateAndPortfolio } from '../utils/generateTaskByTaskTemplateAndPortfolio';
import { getNow } from '../utils/getNow';
import { guessDisplayNameFromFields } from '../utils/guessDisplayNameFromFields';
import { Portfolio } from '../entity/Portfolio';
import * as _ from 'lodash';
import { sendNewTaskCreatedEmail } from '../utils/sendNewTaskCreatedEmail';
import { sendCompletedEmail } from '../utils/sendCompletedEmail';
import { sendArchiveEmail } from '../utils/sendArchiveEmail';
import { sendRequireSignEmail } from '../utils/sendRequireSignEmail';
import { sendTodoEmail } from '../utils/sendTodoEmail';
import { TaskComment } from '../entity/TaskComment';
import { sendSignedEmail } from '../utils/sendSignedEmail';
import { getEmailRecipientName } from '../utils/getEmailRecipientName';
import { Role } from '../types/Role';
import { getOrgIdFromReq } from '../utils/getOrgIdFromReq';
import { getRoleFromReq } from '../utils/getRoleFromReq';
import { getUserIdFromReq } from '../utils/getUserIdFromReq';
import { publishEvent } from '../services/globalEventSubPubService';
import { TaskMessage } from '../entity/TaskMessage';
import { assertTaskAccess } from '../utils/assertTaskAccess';


export const listTaskMessages = handlerWrapper(async (req, res) => {
  assertRole(req, 'admin', 'agent', 'client');
  const role = getRoleFromReq(req);
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

const TASK_MESSAGE_EVENT_TYPE = 'zdn.task.message'

export const subscribeTaskMessage = handlerWrapper(async (req, res) => {
  assertRole(req, 'admin', 'agent', 'client');
  const { taskId } = req.params;

  await assertTaskAccess(req, taskId);

  // const { user: { id: userId } } = req as any;
  const isProd = process.env.NODE_ENV === 'prod';
  if (!isProd) {
    res.setHeader('Access-Control-Allow-Origin', process.env.ZDN_WEB_DOMAIN_NAME);
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
  assertRole(req, 'admin', 'agent', 'client');
  const { id, message } = req.body;
  assert(message, 400, 'Empty message body');
  const { taskId } = req.params;
  const taskRepo = getRepository(Task);
  const task = await taskRepo.findOne(taskId);
  assert(task, 404);
  const senderId = getUserIdFromReq(req);
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


