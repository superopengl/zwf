import { DocTemplate } from './../entity/DocTemplate';
import { TaskActionType } from './../types/TaskActionType';
import { TaskTrackingInformation } from './../entity/views/TaskTrackingInformation';
import { getUtcNow } from './../utils/getUtcNow';
import { db } from './../db';
import { TaskField } from './../entity/TaskField';
import { TaskHistoryInformation } from './../entity/views/TaskHistoryInformation';
import { TaskAction } from './../entity/TaskAction';
import { OrgClientInformation } from './../entity/views/OrgClientInformation';
import { TaskInformation } from './../entity/views/TaskInformation';
import * as _ from 'lodash';
import * as moment from 'moment';
import { EntityManager, In, Not, IsNull } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { TaskTemplate } from '../entity/TaskTemplate';
import { Task } from '../entity/Task';
import { Message } from '../entity/Message';
import { User } from '../entity/User';
import { TaskStatus } from '../types/TaskStatus';
import { sendEmailForUserId } from '../services/emailService';
import { assert } from '../utils/assert';
import { assertRole } from '../utils/assertRole';
import { handlerWrapper } from '../utils/asyncHandler';
import { createTaskByTaskTemplateAndUserEmail } from '../utils/createTaskByTaskTemplateAndUserEmail';
import { getNow } from '../utils/getNow';
import { Role } from '../types/Role';
import { getOrgIdFromReq } from '../utils/getOrgIdFromReq';
import { getRoleFromReq } from '../utils/getRoleFromReq';
import { getUserIdFromReq } from '../utils/getUserIdFromReq';
import { Tag } from '../entity/Tag';
import { logTaskStatusChange, logTaskAssigned, logTaskChat } from '../services/taskTrackingService';
import { File } from '../entity/File';
import { getEventChannel, publishEvent } from '../services/globalEventSubPubService';
import { assertTaskAccess } from '../utils/assertTaskAccess';
import { filter } from 'rxjs/operators';
import { uploadToS3 } from '../utils/uploadToS3';
import { streamFileToResponse } from '../utils/streamFileToResponse';
import { computeTaskFileSignedHash } from '../utils/computeTaskFileSignedHash';
import { EmailTemplateType } from '../types/EmailTemplateType';
import { TaskDoc } from '../entity/TaskDoc';
import { Org } from '../entity/Org';

export const createNewTask = handlerWrapper(async (req, res) => {
  assertRole(req, ['admin', 'client']);
  const { id, taskTemplateId, clientEmail, taskName } = req.body;
  const creatorId = getUserIdFromReq(req);
  const orgId = getOrgIdFromReq(req);

  const task = await createTaskByTaskTemplateAndUserEmail(db.manager, taskTemplateId, taskName, clientEmail, creatorId, id, orgId);

  res.json(task);
});

const TASK_CONTENT_EVENT_TYPE = 'task.content';

export const subscribeTaskContent = handlerWrapper(async (req, res) => {
  // assertRole(req,[ 'admin', 'agent', 'client', 'guest']);
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

export const downloadTaskFile = handlerWrapper(async (req, res) => {
  assert(getUserIdFromReq(req), 404);

  assertRole(req, ['system', 'admin', 'client', 'agent']);
  const { fileId } = req.params;
  const role = getRoleFromReq(req);
  const isClient = role === Role.Client;

  const file = await db.getRepository(File).findOne({
    where: {
      id: fileId,
    },
    // relations: {
    //   field: isClient
    // }
  });

  assert(file, 404);
  // await assertTaskAccess(req, file.taskId);

  if (isClient) {
    // const taskField = file.field;
    // const { value } = taskField;
    // value.lastClientReadAt = getUtcNow();
    // await db.getRepository(TaskField).save(taskField);
  }

  streamFileToResponse(file, res);
});

export const signTaskFile = handlerWrapper(async (req, res) => {
  assertRole(req, ['client']);
  const { fileId } = req.params;

  const file = await db.getRepository(File).findOne({
    where: {
      id: fileId,
    },
    relations: {
      // field: true,
      // task: true,
    }
  });

  const userId = getUserIdFromReq(req);
  // assert(file?.task?.userId === userId, 404);
  // assert(!file.esign, 400, 'Has been esigned');

  // const taskField = file.field;
  // const { value, type } = taskField;
  // let fileItem;
  // if (type === 'upload') {
  //   fileItem = value.find(x => x.fileId === fileId);
  // } else if (type === 'autodoc') {
  //   fileItem = value;
  // } else {
  //   assert(false, 400, `Invalid field type '${type}'`);
  // }

  const now = getUtcNow();
  // file.signedBy = userId;
  // file.signedAt = now;
  // file.esign = computeTaskFileSignedHash(file.md5, userId, now);

  // fileItem.signedAt = now;
  // await db.manager.save([file, taskField]);

  // res.json(fileItem);
  res.json();
});

export const updateTaskFields = handlerWrapper(async (req, res) => {
  assertRole(req, ['admin', 'agent']);
  const { fields } = req.body;
  const { id } = req.params;

  assert(fields.length, 400, 'No fields to update');

  const query: any = { id, orgId: getOrgIdFromReq(req) };
  const task = await db.getRepository(Task).findOne({
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

  fields.forEach((f, index) => {
    f.taskId = id;
    f.ordinal = index + 1;
  });

  const originalFieldIds = task.fields.map(x => x.id);
  const currentFieldIds = fields.map(x => x.id);
  const deletedFieldIds = _.difference(originalFieldIds, currentFieldIds);

  await db.transaction(async m => {
    if (deletedFieldIds?.length) {
      await m.getRepository(TaskField).delete(deletedFieldIds);
    }
    await m.getRepository(TaskField).save(fields);
  });

  res.json();
});

export const saveTaskFieldValue = handlerWrapper(async (req, res) => {
  assertRole(req, ['admin', 'agent', 'client']);
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
      };
      break;
    case Role.Client:
      query = {
        ...query,
        userId: getUserIdFromReq(req),
      };
      break;
    default:
      assert(false, 404, 'Task is not found');
  }

  const task = await db.getRepository(Task).findOne({ where: query, select: { id: true } });
  assert(task, 404);

  const fieldEntities = Object.entries(fields).map(([key, value]) => ({ id: key, value: value, }));

  await db.getRepository(TaskField).save(fieldEntities);

  publishEvent({
    type: 'task',
    subtype: 'fields',
    userId: task.userId,
    taskId: task.id,
    orgId: task.orgId,
    payload: {
      taskId: task.id,
      fields,
    }
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

const getFullTask = async (m: EntityManager, taskId: string, orgId: string) => {
  const task = await m.getRepository(Task).findOne({
    where: {
      id: taskId,
      orgId
    },
    order: {
      fields: {
        ordinal: 'ASC'
      }
    },
    relations: [
      'fields',
      'docs',
      'docs.sign',
      'tags',
    ]
  });

  return task;
}

export const searchTask = handlerWrapper(async (req, res) => {
  assertRole(req, ['admin', 'agent', 'client']);
  const option: ISearchTaskQuery = { ...defaultSearch, ...req.body };

  const { text, status, page, assignee, orderDirection, orderField, dueDateRange, taskTemplateId, portfolioId, clientId } = option;
  const size = option.size;
  const skip = (page - 1) * size;
  const { role, id } = (req as any).user;
  const isClient = role === Role.Client;

  let query = db.manager
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
      query = query.andWhere('(x.name ILIKE :text OR x."taskTemplateName" ILIKE :text)', { text: `%${text}%` });
    } else {
      query = query.andWhere('(x.name ILIKE :text OR x."taskTemplateName" ILIKE :text OR x.email ILIKE :text OR x."givenName" ILIKE :text OR x.surname ILIKE :text)', { text: `%${text}%` });
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
  assertRole(req, ['client']);
  const userId = getUserIdFromReq(req);

  const list = await db.getRepository(TaskInformation).find({
    where: {
      userId,
      status: In([TaskStatus.TODO, TaskStatus.IN_PROGRESS, TaskStatus.ACTION_REQUIRED, TaskStatus.DONE]),
    },
    select: [
      'id',
      'name',
      'status',
      'orgName',
      'taskTemplateName',
      'createdAt',
      'updatedAt'
    ]
  });

  res.json(list);
});


export const getTask = handlerWrapper(async (req, res) => {
  assertRole(req, ['admin', 'agent', 'client']);
  const { id } = req.params;
  const role = getRoleFromReq(req);

  let query: any;
  let relations = {
    fields: true,
    tags: true,
    docs: true,
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

  const task = await db.getRepository(Task).findOne({
    where: query,
    relations,
    order: {
      fields: {
        ordinal: 'ASC'
      },
      docs: {
        createdAt: 'ASC'
      }
    }
  });

  if(role === Role.Client) {
    const {name: orgName} = await db.getRepository(Org).findOneBy({id: task.orgId});
    (task as any).orgName = orgName;
  }

  assert(task, 404);

  res.json(task);
});

export const uploadTaskFile = handlerWrapper(async (req, res) => {
  assertRole(req, ['admin', 'agent', 'client']);
  const { file } = (req as any).files;
  assert(file, 400, 'No file to upload');
  const { name, data, mimetype, md5 } = file;
  const userId = getUserIdFromReq(req);
  const orgId = getOrgIdFromReq(req);
  const role = getRoleFromReq(req);
  const { taskId } = req.params;

  const query = role === Role.Client ? { userId } : { orgId };

  const task = await db.getRepository(Task).findOne({
    where: {
      id: taskId,
      ...query,
    }
  });

  assert(task, 404);

  // Upload file binary to S3
  const fileId = uuidv4();

  const location = await uploadToS3(fileId, name, data);

  await db.transaction(async m => {
    const fileEntity = new File();
    fileEntity.id = fileId;
    fileEntity.fileName = name;
    fileEntity.createdBy = userId;
    fileEntity.mime = mimetype;
    fileEntity.location = location;
    fileEntity.md5 = md5;
    fileEntity.public = false;

    await m.save(fileEntity);

    const taskDoc = new TaskDoc();
    taskDoc.taskId = taskId;
    taskDoc.orgId = task.orgId;
    taskDoc.type = 'upload';
    taskDoc.name = name;
    taskDoc.fileId = fileId;
    taskDoc.uploadedBy = userId;

    await m.save(taskDoc);
  });

  res.json({
    fileId: fileId,
  });
});

export const addDocTemplateToTask = handlerWrapper(async (req, res) => {
  assertRole(req, ['admin', 'agent']);
  const { docTemplateIds } = req.body
  assert(docTemplateIds?.length, 400, 'docTemplateIds is empty');
  const userId = getUserIdFromReq(req);
  const orgId = getOrgIdFromReq(req);
  const { taskId } = req.params;


  // Upload file binary to S3
  let taskDocs: TaskDoc[] = [];

  await db.transaction(async m => {
    const docTemplates = await m.getRepository(DocTemplate).findBy({
      id: In(docTemplateIds),
      orgId,
    });

    if (docTemplates.length) {
      const fieldCounts = await m.getRepository(TaskField).countBy({
        taskId
      })

      const fieldsNamesToAdd = new Set<string>();
      docTemplates.forEach(d => d.refFieldNames.forEach(n => fieldsNamesToAdd.add(n)));
      const taskFields = Array.from(fieldsNamesToAdd).map((n, index) => {
        const taskField = new TaskField();
        taskField.taskId = taskId;
        taskField.name = n;
        taskField.type = 'text';
        taskField.ordinal = fieldCounts + index;
        taskField.required = true;
        taskField.official = false;
        return taskField;
      });

      await m.createQueryBuilder()
        .insert()
        .into(TaskField)
        .values(taskFields)
        .orUpdate(['required', 'official'], ['taskId', 'name'])
        .execute();

      taskDocs = docTemplates.map(t => {
        const taskDoc = new TaskDoc();
        taskDoc.id = uuidv4();
        taskDoc.orgId = orgId;
        taskDoc.taskId = taskId;
        taskDoc.uploadedBy = userId;
        taskDoc.type = 'autogen';
        taskDoc.docTemplateId = t.id;
        taskDoc.name = `${t.name}.pdf`;
        taskDoc.fieldBag = t.refFieldNames.reduce((pre, curr) => {
          pre[curr] = null;
          return pre;
        }, {});
        return taskDoc;
      })

      await m.save([...taskFields, ...taskDocs]);
    };
  });

  res.json(taskDocs);
});

export const getDeepLinkedTask = handlerWrapper(async (req, res) => {
  assertRole(req, ['admin', 'agent', 'client']);
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
      };
      break;
    default:
      assert(false, 500);
  }

  const task = await db.getRepository(Task).findOne({
    where: query,
    select: {
      id: true,
    }
  });

  assert(task, 404);

  res.json(task);
});

export const updateTaskTags = handlerWrapper(async (req, res) => {
  assertRole(req, ['admin', 'agent']);
  const { id } = req.params;
  const { tags: tagIds } = req.body;

  await db.transaction(async m => {
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
  assertRole(req, ['admin', 'agent']);
  const { id } = req.params;
  const { name } = req.body;
  const orgId = getOrgIdFromReq(req);

  await db.getRepository(Task).update({
    id,
    orgId,
  }, { name });

  res.json();
});

export const assignTask = handlerWrapper(async (req, res) => {
  assertRole(req, ['admin', 'agent']);
  const { id } = req.params;
  const { agentId } = req.body;
  const orgId = getOrgIdFromReq(req);
  const userId = getUserIdFromReq(req);

  await db.transaction(async m => {
    const task = await m.findOneByOrFail(Task, { id, orgId });
    await m.update(Task, { id, orgId }, { agentId });
    await logTaskAssigned(m, task, userId, agentId);
  });

  res.json();
});

export const changeTaskStatus = handlerWrapper(async (req, res) => {
  assertRole(req, ['admin', 'agent']);
  const { id, status } = req.params;
  const orgId = getOrgIdFromReq(req);
  const userId = getUserIdFromReq(req);

  await db.transaction(async m => {
    const task = await m.findOneOrFail(Task, { where: { id, orgId } });
    const oldStatus = task.status;
    const newStatus = status as TaskStatus;
    if (oldStatus !== newStatus) {
      await m.update(Task, { id }, { status: newStatus });
      await logTaskStatusChange(m, task, userId, oldStatus, newStatus);
    }
  });

  res.json();
});

export const notifyTask = handlerWrapper(async (req, res) => {
  assertRole(req, ['admin', 'agent']);
  const { id } = req.params;
  const orgId = getOrgIdFromReq(req);
  const userId = getUserIdFromReq(req);

  const task = await db.getRepository(TaskInformation).findOne({
    where: {
      id,
      orgId
    }
  });
  assert(task, 404);

  const message = req.body.message?.trim();
  if (message) {
    await logTaskChat(db.manager, task, userId, message);
  }

  const url = `${process.env.ZWF_API_DOMAIN_NAME}/t/${task.deepLinkId}`;

  sendEmailForUserId(task.userId, EmailTemplateType.TaskRequireAction, {
    task: task.name,
    url,
    message,
    org: task.orgName,
  });

  res.json();
});

export const getTaskLog = handlerWrapper(async (req, res) => {
  assertRole(req, ['admin', 'agent', 'client']);
  const { id } = req.params;
  let query: any = { taskId: id, action: Not(TaskActionType.Chat) };
  const role = getRoleFromReq(req);
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
        clientId: getUserIdFromReq(req)
      };
    default:
      break;
  }
  const list = await db.getRepository(TaskTrackingInformation).find({ where: query });

  res.json(list);
});

export const deleteTaskDoc = handlerWrapper(async (req, res) => {
  assertRole(req, ['admin', 'agent']);
  const { docId } = req.params;
  const orgId = getOrgIdFromReq(req);

  await db.transaction(async m => {
    const taskDoc = await m.getRepository(TaskDoc).findOneBy({ id: docId, orgId });
    assert(taskDoc, 404);

    assert(!taskDoc.esign, 400, 'Cannot delete a signed doc');

    await m.softDelete(TaskDoc, { id: docId });
  });

  res.json();
});

export const requestSignTaskDoc = handlerWrapper(async (req, res) => {
  assertRole(req, ['admin', 'agent']);
  const { docId } = req.params;
  const orgId = getOrgIdFromReq(req);
  const userId = getUserIdFromReq(req);

  let taskDoc: TaskDoc = null;
  await db.transaction(async m => {
    taskDoc = await m.getRepository(TaskDoc).findOneByOrFail({ id: docId, orgId });
    assert(taskDoc, 404);
    assert(!taskDoc.esign, 400, 'Cannot change sign request for a signed doc');

    if (!taskDoc.signRequestedAt) {
      taskDoc.signRequestedAt = getUtcNow();
      taskDoc.signRequestedBy = userId;
      await m.save(taskDoc);
    }
  })

  res.json(taskDoc);
});

export const unrequestSignTaskDoc = handlerWrapper(async (req, res) => {
  assertRole(req, ['admin', 'agent']);
  const { docId } = req.params;
  const orgId = getOrgIdFromReq(req);
  const userId = getUserIdFromReq(req);

  let taskDoc: TaskDoc = null;
  await db.transaction(async m => {
    taskDoc = await m.getRepository(TaskDoc).findOneByOrFail({ id: docId, orgId });
    assert(taskDoc, 404);
    assert(!taskDoc.esign, 400, 'Cannot change sign request for a signed doc');

    taskDoc.signRequestedAt = null;
    taskDoc.signRequestedBy = null;

    await m.save(taskDoc)
  })

  res.json(taskDoc);
});