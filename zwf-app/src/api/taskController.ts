import { AppDataSource } from './../db';
import { TaskField } from './../entity/TaskField';
import { TaskDoc } from './../entity/TaskDoc';
import { TaskHistoryInformation } from './../entity/views/TaskHistoryInformation';
import { TaskAction } from './../entity/TaskAction';
import { OrgClientInformation } from './../entity/views/OrgClientInformation';
import { TaskInformation } from './../entity/views/TaskInformation';
import * as _ from 'lodash';
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
import { uploadToS3 } from '../utils/uploadToS3';
import { streamFileToResponse } from '../utils/streamFileToResponse';

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

export const downloadTaskFieldFile = handlerWrapper(async (req, res) => {
  assert(getUserIdFromReq(req), 404);
  
  assertRole(req, 'system', 'admin', 'client', 'agent');
  const { fieldId, docId } = req.params;
  const role = getRoleFromReq(req);

  const taskRepo = AppDataSource.getRepository(TaskDoc);
  const taskDoc = await taskRepo.findOne({
    where: {
      id: docId,
      fieldId
    },
    relations: { file: true }
  });

  assert(taskDoc, 404);
  await assertTaskAccess(req, taskDoc.taskId);

  if (role === 'client') {
    const now = getNow();
    taskDoc.lastClientReadAt = now;
    await taskRepo.save(taskDoc);
  }

  streamFileToResponse(taskDoc.file, res);
});

export const updateTaskFields = handlerWrapper(async (req, res) => {
  assertRole(req, 'admin', 'agent');
  const { fields } = req.body;
  const { id } = req.params;

  assert(fields.length, 400, 'No fields to update');

  const query: any = { id, orgId: getOrgIdFromReq(req) };
  const task = await AppDataSource.getRepository(Task).findOne({
    where: query,
    relations: {
      fields: true,
    },
    select: {
      id: true,
      fields: {
        id: true
      }
    }
  });
  assert(task, 404);

  fields.forEach(f => {
    f.taskId = id;
  })

  const originalFieldIds = task.fields.map(x => x.id);
  const currentFieldIds = fields.map(x => x.id);
  const deletedFieldIds = _.difference(originalFieldIds, currentFieldIds);

  await AppDataSource.transaction(async m => {
    await m.getRepository(TaskField).save(fields);
    if (deletedFieldIds?.length) {
      await m.getRepository(TaskField).delete(deletedFieldIds);
    }
  })

  res.json();
})

export const saveTaskFieldValue = handlerWrapper(async (req, res) => {
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

  const task = await AppDataSource.getRepository(Task).findOne({ where: query, select: { id: true } });
  assert(task, 404);

  const fieldEntities = Object.entries(fields).map(([key, value]) => ({ id: key, value: value, }));

  await AppDataSource.getRepository(TaskField).save(fieldEntities);
  publishEvent(TASK_CONTENT_EVENT_TYPE, {
    taskId: id,
    fields,
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

  let query = AppDataSource.manager
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

  const list = await AppDataSource.getRepository(TaskInformation).find({
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
  let relations = {
    fields: {
      docs: true
    },
    tags: true
  };

  switch (role) {
    case Role.Admin:
    case Role.Agent:
      query = { id, orgId: getOrgIdFromReq(req) };
      relations = {
        ...relations,
        tags: true
      };
      break;
    case Role.Client:
      query = { id, userId: getUserIdFromReq(req) };
      // relations = ['fields', 'fields.docs', 'fields.docs.file'];
      relations = {
        ...relations,
        tags: false
      };
      break;
    default:
      assert(false, 404);
      break;
  }

  const task = await AppDataSource.getRepository(Task).findOne({
    where: query,
    relations,
    order: {
      fields: {
        ordinal: 'ASC'
      }
    }
  })

  assert(task, 404);

  res.json(task);
});

export const uploadTaskFieldFile = handlerWrapper(async (req, res) => {
  assertRole(req, 'admin', 'agent', 'client');
  const { file } = (req as any).files;
  assert(file, 400, 'No file to upload');
  const { name, data, mimetype, md5 } = file;
  const userId = getUserIdFromReq(req);
  const role = getRoleFromReq(req);
  const { fieldId } = req.params;

  const taskField = await AppDataSource.getRepository(TaskField).findOne({
    where: {
      id: fieldId,
    },
    select: {
      id: true,
      taskId: true,
      value: true,
    }
  });
  assert(taskField, 404);

  await assertTaskAccess(req, taskField.taskId);

  // Upload file binary to S3
  const taskDocId = uuidv4();
  const fileId = uuidv4();

  const location = await uploadToS3(fileId, name, data);
  const fileEntity = new File();
  fileEntity.id = fileId;
  fileEntity.fileName = name;
  fileEntity.createdBy = userId;
  fileEntity.mime = mimetype;
  fileEntity.location = location;
  fileEntity.md5 = md5;
  fileEntity.public = false;


  await AppDataSource.transaction(async m => {
    const taskDoc = new TaskDoc();
    taskDoc.id = taskDocId;
    taskDoc.taskId = taskField.taskId,
      taskDoc.fieldId = fieldId;
    taskDoc.file = fileEntity;
    taskDoc.name = name;
    taskDoc.type = role === Role.Client ? 'client' : 'agent';
    taskDoc.status = 'done';

    await m.save([fileEntity, taskDoc]);
  });

  res.json({
    id: taskDocId,
  });
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

  const task = await AppDataSource.getRepository(Task).findOne({
    where: query,
    select: {
      id: true,
    }
  })

  assert(task, 404);

  res.json(task);
});

export const updateTaskTags = handlerWrapper(async (req, res) => {
  assertRole(req, 'admin', 'agent');
  const { id } = req.params;
  const { tags: tagIds } = req.body;

  await AppDataSource.transaction(async m => {
    const task = await m.findOne(Task, {
      where: { id },
      select: {
        id: true,
      }
    });
    const tags = await m.find(Tag, { where: { id: In(tagIds) } });
    task.tags = tags;
    await m.save(task);
  });

  res.json();
});

export const updateTaskName = handlerWrapper(async (req, res) => {
  assertRole(req, 'admin', 'agent');
  const { id } = req.params;
  const { name } = req.body;
  const orgId = getOrgIdFromReq(req);

  await AppDataSource.getRepository(Task).update({
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

  await AppDataSource.transaction(async m => {
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

  await AppDataSource.transaction(async m => {
    const task = await m.findOneOrFail(Task, { where: { id, orgId } });
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
  const user = await AppDataSource.getRepository(User).findOne({ where: { id: Task.userId } });
  assert(user, 404);

  const message = new Message();
  message.senderId = senderId;
  message.taskId = Task.id;
  message.recipientId = Task.userId;
  message.content = content;

  await AppDataSource.getRepository(Message).save(message);

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

  const task = await AppDataSource.getRepository(Task).findOne({ where: { id } });
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

  let query = AppDataSource.getRepository(Message).createQueryBuilder()
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
      const task = await AppDataSource.getRepository(Task).findOne({ where: { id: taskId } });
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

  await AppDataSource.getRepository(Message).update(query, { readAt: now });

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
  const list = await AppDataSource.getRepository(TaskHistoryInformation).find({ where: query });

  res.json(list);
});