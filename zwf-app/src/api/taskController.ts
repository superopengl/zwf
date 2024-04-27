import { TaskField } from './../entity/TaskField';
import { TaskDoc } from './../entity/TaskDoc';
import { TaskHistoryInformation } from './../entity/views/TaskHistoryInformation';
import { TaskAction } from './../entity/TaskAction';
import { OrgClientInformation } from './../entity/views/OrgClientInformation';
import { TaskInformation } from './../entity/views/TaskInformation';

import * as moment from 'moment';
import { EntityManager, getManager, getRepository, Not, In } from 'typeorm';
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
import { createTaskByTaskTemplateAndUserEmail } from '../utils/createTaskByTaskTemplateAndUserEmail';
import { getNow } from '../utils/getNow';
import * as _ from 'lodash';
import { sendNewTaskCreatedEmail } from '../utils/sendNewTaskCreatedEmail';
import { sendCompletedEmail } from '../utils/sendCompletedEmail';
import { sendArchiveEmail } from '../utils/sendArchiveEmail';
import { sendRequireSignEmail } from '../utils/sendRequireSignEmail';
import { sendTodoEmail } from '../utils/sendTodoEmail';
import { sendSignedEmail } from '../utils/sendSignedEmail';
import { getEmailRecipientName } from '../utils/getEmailRecipientName';
import { Role } from '../types/Role';
import { getOrgIdFromReq } from '../utils/getOrgIdFromReq';
import { getRoleFromReq } from '../utils/getRoleFromReq';
import { getUserIdFromReq } from '../utils/getUserIdFromReq';
import { Tag } from '../entity/Tag';
import { logTaskStatusChange, logTaskAssigned } from '../services/taskTrackingService';
import { File } from '../entity/File';
import { getEventChannel, publishEvent } from '../services/globalEventSubPubService';
import { assertTaskAccess } from '../utils/assertTaskAccess';
import { filter } from 'rxjs/operators';

export const createNewTask = handlerWrapper(async (req, res) => {
  assertRole(req, 'admin', 'client');
  const { id, taskTemplateId, clientEmail, taskName } = req.body;
  const creatorId = getUserIdFromReq(req);

  const task = await createTaskByTaskTemplateAndUserEmail(taskTemplateId, taskName, clientEmail, creatorId, id);

  res.json(task);
});

async function handleTaskStatusChange(oldStatus: TaskStatus, task: Task) {
  const { status } = task;
  if (oldStatus === status) return;

  if (!oldStatus) {
    // New task
    await sendNewTaskCreatedEmail(task);
  } else if (status === TaskStatus.TODO) {
    // Task todo
    await sendTodoEmail(task);
  } else if (status === TaskStatus.DONE) {
    // Task completed
    await sendCompletedEmail(task);
  } else if (status === TaskStatus.ARCHIVED) {
    // Archived
    await sendArchiveEmail(task);
  }
}

const TASK_CONTENT_EVENT_TYPE = 'task.content'

export const subscribeTaskContent = handlerWrapper(async (req, res) => {
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

  const channelSubscription$ = getEventChannel(TASK_CONTENT_EVENT_TYPE)
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


export const saveTaskFields = handlerWrapper(async (req, res) => {
  assertRole(req, 'admin', 'agent', 'client');
  const { fields } = req.body;
  const { id } = req.params;
  const role = getRoleFromReq(req);

  let query: any = { id };
  switch (role) {
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
      assert(false, 404, 'Task is not found');
  }

  const task = await getRepository(Task).findOne(query, { select: ['id'] });
  assert(task, 404);

  const fieldEntities = Object.entries(fields).map(([key, value]) => ({ id: key, value: value, }));

  await getRepository(TaskField).save(fieldEntities);
  publishEvent(TASK_CONTENT_EVENT_TYPE, {
    taskId: id,
    fields,
    // taskDocIds: docs.map(x => x.id)
  });

  res.json();
});

interface ISearchTaskQuery {
  text?: string;
  page?: number;
  size?: number;
  status?: TaskStatus[];
  assignee?: string;
  taskTemplateId?: string;
  portfolioId?: string;
  clientId?: string;
  dueDateRange?: [string, string];
  orderField?: string;
  orderDirection?: 'ASC' | 'DESC';
}

const defaultSearch: ISearchTaskQuery = {
  page: 1,
  size: 50,
  status: [TaskStatus.TODO, TaskStatus.IN_PROGRESS, TaskStatus.ACTION_REQUIRED, TaskStatus.DONE],
  orderField: 'updatedAt',
  orderDirection: 'DESC'
};

export const searchTask = handlerWrapper(async (req, res) => {
  assertRole(req, 'admin', 'agent', 'client');
  const option: ISearchTaskQuery = { ...defaultSearch, ...req.body };

  const { text, status, page, assignee, orderDirection, orderField, dueDateRange, taskTemplateId, portfolioId, clientId } = option;
  const size = option.size;
  const skip = (page - 1) * size;
  const { role, id } = (req as any).user;
  const isClient = role === Role.Client;

  let query = getManager()
    .createQueryBuilder()
    .from(TaskInformation, 'x')
    .where(`1 = 1`);
  if (isClient) {
    query = query.andWhere(`x."userId" = :id`, { id });
  } else {
    const orgId = getOrgIdFromReq(req);
    query = query.andWhere(`x."orgId" = :orgId`, { orgId });
  }
  if (status?.length) {
    query = query.andWhere(`x.status IN (:...status)`, { status });
  }
  if (assignee) {
    query = query.andWhere('x."agentId" = :assignee', { assignee });
  }
  if (taskTemplateId) {
    query = query.andWhere(`x."taskTemplateId" = :taskTemplateId`, { taskTemplateId });
  }
  if (portfolioId) {
    query = query.andWhere(`x."portfolioId" = :portfolioId`, { portfolioId });
  }
  if (clientId) {
    query = query.andWhere(`x."userId" = :clientId`, { clientId });
  }

  if (text) {
    if (isClient) {
      query = query.andWhere('(x.name ILIKE :text OR x."taskTemplateName" ILIKE :text OR x.description ILIKE :text)', { text: `%${text}%` });
    } else {
      query = query.andWhere('(x.name ILIKE :text OR x."taskTemplateName" ILIKE :text OR x.description ILIKE :text OR x.email ILIKE :text OR x."givenName" ILIKE :text OR x.surname ILIKE :text)', { text: `%${text}%` });
    }
  }
  // if (dueDateRange?.length === 2) {
  //   query = query.andWhere(`x."dueDate" >= :start`, { start: moment(dueDateRange[0], 'DD/MM/YYYY').startOf('day').toDate() })
  //     .andWhere(`x."dueDate" <= :end`, { end: moment(dueDateRange[1], 'DD/MM/YYYY').endOf('day').toDate() })
  // }

  const total = await query.getCount();
  const list = await query
    .orderBy(`"${orderField}"`, orderDirection)
    .offset(skip)
    .limit(size)
    .execute();

  res.json({ data: list, pagination: { page, size, total } });
});

export const listMyTasks = handlerWrapper(async (req, res) => {
  assertRole(req, 'client');
  const userId = getUserIdFromReq(req);

  const list = await getRepository(TaskInformation).find({
    where: {
      userId,
      status: In([TaskStatus.IN_PROGRESS, TaskStatus.ACTION_REQUIRED, TaskStatus.DONE]),
    },
    select: [
      'id',
      'name',
      'description',
      'status',
      'orgName',
      'taskTemplateName',
      'createdAt',
      'updatedAt'
    ]
  })

  res.json(list);
});


export const getTask = handlerWrapper(async (req, res) => {
  assertRole(req, 'admin', 'agent', 'client');
  const { id } = req.params;
  const role = getRoleFromReq(req);

  let query: any;
  let relations: any;

  switch (role) {
    case Role.Admin:
    case Role.Agent:
      query = { id, orgId: getOrgIdFromReq(req) };
      relations = ['tags', 'fields', 'fields.docs', 'fields.docs.file'];
      break;
    case Role.Client:
      query = { id, userId: getUserIdFromReq(req) };
      relations = ['fields', 'fields.docs', 'fields.docs.file'];
      break;
    default:
      assert(false, 404);
      break;
  }

  const task = await getRepository(Task).findOne({
    where: query,
    relations,
  })
  assert(task, 404);

  res.json(task);
});

export const getDeepLinkedTask = handlerWrapper(async (req, res) => {
  assertRole(req, 'admin', 'agent', 'client');
  const { deepLinkId } = req.params;
  const role = getRoleFromReq(req);
  let query: any = { deepLinkId };
  switch (role) {
    case Role.Admin:
    case Role.Agent:
      query = {
        ...query,
        orgId: getOrgIdFromReq(req)
      };
      break;
    case Role.Client:
      query = {
        ...query,
        userId: getUserIdFromReq(req)
      }
      break;
    default:
      assert(false, 500);
  }

  // const task = await getRepository(Task)
  //   .createQueryBuilder('t')
  //   .where(`"deepLinkId" = :deepLinkId`, { deepLinkId })
  //   .leftJoinAndSelect('t.tags', 'tags')
  //   .leftJoinAndSelect('t.docs', 'docs')
  //   .leftJoinAndMapOne('t.client', OrgClientInformation, 'u', 'u.id = t."userId"')
  //   .getOne();

  const task = await getRepository(Task).findOne({
    where: query,
    select: ['id']
  })

  assert(task, 404);

  res.json(task);
});

export const updateTaskTags = handlerWrapper(async (req, res) => {
  assertRole(req, 'admin', 'agent');
  const { id } = req.params;
  const { tags: tagIds } = req.body;

  await getManager().transaction(async m => {
    const task = await m.findOne(Task, id);
    task.tags = await m.findByIds(Tag, tagIds);
    await m.save(task);
  });

  res.json();
});

export const updateTaskName = handlerWrapper(async (req, res) => {
  assertRole(req, 'admin', 'agent');
  const { id } = req.params;
  const { name } = req.body;
  const orgId = getOrgIdFromReq(req);

  await getRepository(Task).update({
    id,
    orgId,
  }, { name });

  res.json();
});



export const assignTask = handlerWrapper(async (req, res) => {
  assertRole(req, 'admin', 'agent');
  const { id } = req.params;
  const { agentId } = req.body;
  const orgId = getOrgIdFromReq(req);
  const userId = getUserIdFromReq(req);

  await getManager().transaction(async m => {
    await m.update(Task, { id, orgId }, { agentId });
    await logTaskAssigned(m, id, userId, agentId);
  });

  res.json();
});

export const changeTaskStatus = handlerWrapper(async (req, res) => {
  assertRole(req, 'admin', 'agent');
  const { id, status } = req.params;
  const orgId = getOrgIdFromReq(req);
  const userId = getUserIdFromReq(req);

  await getManager().transaction(async m => {
    const task = await m.findOneOrFail(Task, { id, orgId });
    const oldStatus = task.status;
    const newStatus = status as TaskStatus;
    if (oldStatus !== newStatus) {
      await m.update(Task, { id }, { status: newStatus });
      await logTaskStatusChange(m, id, userId, oldStatus, newStatus);
    }
  })

  res.json();
});

async function sendTaskMessage(Task, senderId, content) {
  const user = await getRepository(User).findOne(Task.userId);
  assert(user, 404);

  const message = new Message();
  message.senderId = senderId;
  message.taskId = Task.id;
  message.recipientId = Task.userId;
  message.content = content;

  await getRepository(Message).save(message);

  sendEmailImmediately({
    to: user.profile.email,
    vars: {
      toWhom: getEmailRecipientName(user),
      name: Task.name
    },
    template: 'taskMessage'
  });
}

export const notifyTask = handlerWrapper(async (req, res) => {
  assertRole(req, 'admin', 'agent', 'client');
  const { id } = req.params;
  const { content } = req.body;
  assert(content, 404);

  const task = await getRepository(Task).findOne(id);
  assert(task, 404);

  await sendTaskMessage(task, (req as any).user.id, content);

  res.json();
});

export const listTaskNotifies = handlerWrapper(async (req, res) => {
  assertRole(req, 'admin', 'agent', 'client');
  const { id } = req.params;
  const { from, size } = req.query;
  const { user: { role, id: userId } } = req as any;
  const isClient = role === 'client';

  let query = getRepository(Message).createQueryBuilder()
    .where(`"taskId" = :id`, { id });
  if (isClient) {
    query = query.andWhere(`"clientUserId" = :userId`, { userId });
  }
  if (from) {
    query = query.andWhere(`"createdAt" >= :from`, { from: moment(`${from}`).toDate() });
  }

  query = query.orderBy('"createdAt"', 'DESC')
    .limit(+size || 20);

  const list = await query.getMany();

  res.json(list);
});

export const markTaskNotifyRead = handlerWrapper(async (req, res) => {
  assertRole(req, 'admin', 'agent', 'client');
  const { id: taskId } = req.params;
  const { user: { id: userId, role } } = req as any;
  const repo = getRepository(Message);
  const now = getNow();
  // Mark notification read
  let query;
  switch (role) {
    case 'client':
      // The messages received by this client
      query = {
        taskId,
        clientUserId: userId,
        sender: Not(userId)
      };
      break;
    case 'admin':
    case 'agent':
      const task = await getRepository(Task).findOne(taskId);
      const clientUserId = task.userId;
      query = {
        taskId,
        clientUserId,
        sender: clientUserId
      };
      break;
    default:
      assert(false, 500, 'Impossible code path');
  }

  await getRepository(Message).update(query, { readAt: now });

  res.json();
});

export const getTaskHistory = handlerWrapper(async (req, res) => {
  assertRole(req, 'admin', 'agent', 'client');
  const { id } = req.params;
  let query: any = { taskId: id };
  const role = getRoleFromReq(req);
  switch (role) {
    case Role.Admin:
    case Role.Agent:
      query = {
        ...query,
        orgId: getOrgIdFromReq(req)
      }
      break
    case Role.Client:
      query = {
        ...query,
        clientId: getUserIdFromReq(req)
      }
    default:
      break;
  }
  const list = await getRepository(TaskHistoryInformation).find(query);

  res.json(list);
});