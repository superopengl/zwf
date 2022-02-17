import { TaskHistoryInformation } from './../entity/views/TaskHistoryInformation';
import { TaskAction } from './../entity/TaskAction';
import { OrgClientInformation } from './../entity/views/OrgClientInformation';
import { TaskInformation } from './../entity/views/TaskInformation';

import * as moment from 'moment';
import { EntityManager, getManager, getRepository, Not } from 'typeorm';
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
import { Tag } from '../entity/Tag';
import { TaskActionType } from '../types/TaskActionType';

export const createNewTask = handlerWrapper(async (req, res) => {
  assertRole(req, 'admin', 'client');
  const { taskTemplateId, clientEmail, taskName, varBag } = req.body;

  const task = await createTaskByTaskTemplateAndUserEmail(taskTemplateId, taskName, clientEmail, varBag);

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
  } else if (status === TaskStatus.SIGNED) {
    // Task signed
    await sendSignedEmail(task);
  } else if (status === TaskStatus.DONE) {
    // Task completed
    await sendCompletedEmail(task);
  } else if (status === TaskStatus.PENDING_SIGN) {
    const hasDocToSign = task.docs?.filter(d => d.fileId && d.requiresSign && !d.signedAt).length;
    assert(hasDocToSign, 400, 'Cannot change status because there is no document to sign.');
    // Require sign
    await sendRequireSignEmail(task);
  } else if (status === TaskStatus.ARCHIVED) {
    // Archived
    await sendArchiveEmail(task);
  }
}

export const updateTask = handlerWrapper(async (req, res) => {
  assertRole(req, 'admin', 'agent', 'client');
  const { fields } = req.body;
  const { id } = req.params;

  let task: Task;
  let query: any = { taskId: id };
  const role = getRoleFromReq(req);
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
    default:
      assert(task, 404, 'Task is not found');
  }

  const repo = getRepository(Task);
  task = await repo.findOne(id);
  assert(task, 404, 'Task is not found');
  const oldStatus = task.status;

  task.fields = fields;

  await repo.save(task);
  await handleTaskStatusChange(oldStatus, task);

  res.json();
});

export const saveTaskFields = handlerWrapper(async (req, res) => {
  assertRole(req, 'admin', 'agent', 'client');
  const fields = req.body ?? [];
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
    default:
      assert(false, 404, 'Task is not found');
  }

  await getRepository(Task).update(query, {fields});

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
  status: [TaskStatus.TODO, TaskStatus.PENDING_SIGN],
  orderField: 'lastUpdatedAt',
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

export const listTask = handlerWrapper(async (req, res) => {
  assertRole(req, 'client');
  const userId = getUserIdFromReq(req);

  const list = await getRepository(TaskInformation).find({
    where: {
      userId
    },
    select: [
      'id',
      'name',
      'description',
      'status',
      'orgName',
      'taskTemplateName',
      'authorizedAt',
      'createdAt',
      'lastUpdatedAt'
    ]
  })

  res.json(list);
});

export const getTask = handlerWrapper(async (req, res) => {
  assertRole(req, 'admin', 'agent', 'client');
  const { id } = req.params;
  const role = getRoleFromReq(req);

  let query = getRepository(Task).createQueryBuilder('t')
    .leftJoinAndSelect('t.tags', 'tags')
    .leftJoinAndSelect('t.docs', 'docs')
    // .leftJoinAndMapOne('t.client', OrgClientInformation, 'u', 'u.id = t."userId"')
    .where(`t.id = :id`, { id });

  switch (role) {
    case Role.Admin:
    case Role.Agent:
      query = query.andWhere(`t."orgId" = :orgId`, { orgId: getOrgIdFromReq(req) });
      break;
    case Role.Client:
      query = query.andWhere(`t."userId" = :userId`, { userId: getUserIdFromReq(req) });
      break;
    default:
      assert(false, 404);
      break;
  }

  const task = await query.getOne()
  assert(task, 404);

  res.json(task);
});

export const getDeepLinkedTask = handlerWrapper(async (req, res) => {
  const role = getRoleFromReq(req);
  assert(role === Role.Guest, 404);
  const { deepLinkId } = req.params;

  const task = await getRepository(Task).findOne({ deepLinkId }, { relations: ['tags', 'docs'] });

  assert(task, 404);

  res.json(task);
});

export const saveDeepLinkedTask = handlerWrapper(async (req, res) => {
  const role = getRoleFromReq(req);
  assert(role === Role.Guest, 404);
  const { deepLinkId } = req.params;
  const payload = req.body;

  let task: Task;
  await getManager().transaction(async m => {
    task = await m.findOne(Task, { deepLinkId });
    assert(task, 404);

    let hasChanged = false;
    for (const field of task.fields) {
      const { name, value: oldValue } = field;
      const newValue = payload[name];
      if (oldValue !== newValue) {
        hasChanged = true;
        field.value = newValue;
      }
    }

    if (hasChanged) {
      await m.save(task);
    }
  });


  res.json();
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

export const deleteTask = handlerWrapper(async (req, res) => {
  assertRole(req, 'admin');
  const { id } = req.params;
  const orgId = getOrgIdFromReq(req);
  const userId = getUserIdFromReq(req);

  await getManager().transaction(async m => {
    await m.update(Task, { id, orgId }, { status: TaskStatus.ARCHIVED });
    await logTaskAction(m, id, TaskActionType.Archive, userId);
  })

  res.json();
});

async function logTaskAction(m: EntityManager, taskId: string, action: TaskActionType, executorId: string, extra: any = null) {
  const taskAction = new TaskAction();
  taskAction.taskId = taskId;
  taskAction.action = action;
  taskAction.by = executorId;
  taskAction.extra = extra;
  await m.save(taskAction);
}

export const assignTask = handlerWrapper(async (req, res) => {
  assertRole(req, 'admin');
  const { id } = req.params;
  const { agentId } = req.body;
  const orgId = getOrgIdFromReq(req);
  const userId = getUserIdFromReq(req);

  await getManager().transaction(async m => {
    await m.update(Task, { id, orgId }, { agentId });
    await logTaskAction(m, id, TaskActionType.Assign, userId);
  });

  res.json();
});

export const changeTaskStatus = handlerWrapper(async (req, res) => {
  assertRole(req, 'admin', 'agent');
  const { id, status } = req.params;

  const taskStatus = status as TaskStatus;
  await getRepository(Task).update(id, { status: taskStatus });

  res.json();
});

export const signTaskDoc = handlerWrapper(async (req, res) => {
  assertRole(req, 'client');
  const { id } = req.params;
  const taskRepo = getRepository(Task);
  const task = await taskRepo.findOne(id);
  assert(task, 404);
  const { files } = req.body;
  const oldStatus = task.status;

  if (files?.length) {
    const now = getNow();
    task.docs.filter(d => d.requiresSign && files.includes(d.fileId)).forEach(d => d.signedAt = now);
  }

  const unsignedFileCount = task.docs.filter(d => d.requiresSign && !d.signedAt).length;
  if (unsignedFileCount === 0) {
    task.status = TaskStatus.SIGNED;
  }

  await taskRepo.save(task);
  await handleTaskStatusChange(oldStatus, task);

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

export const getComments = handlerWrapper(async (req, res) => {
  assertRole(req, 'admin', 'agent');
  const { id } = req.params;

  const list = await getRepository(TaskComment)
    .createQueryBuilder('c')
    .leftJoin(q => q.from(User, 'u'), 'u', `u.id = c."senderId"`)
    .where(`"taskId" = :id`, { id })
    .orderBy('c.id')
    .select([
      `u."givenName" as "givenName"`,
      `u."surname" as "surname"`,
      `c."senderId" as "senderId"`,
      `c.content as content`,
      `c."createdAt" as "createdAt"`,
    ])
    .execute();

  res.json(list);
});

export const newComment = handlerWrapper(async (req, res) => {
  assertRole(req, 'admin', 'agent');
  const { id } = req.params;
  const { content } = req.body;
  assert(content?.trim(), 400, 'Empty comment body');
  const { user: { id: userId } } = req as any;

  const comment = new TaskComment();
  comment.taskId = id;
  comment.senderId = userId;
  comment.content = content;

  await getRepository(TaskComment).save(comment);

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