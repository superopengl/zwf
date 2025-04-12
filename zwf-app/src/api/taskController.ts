import { TaskActivity } from './../entity/TaskActivity';
import { DocTemplate } from './../entity/DocTemplate';
import { TaskActionType } from './../types/TaskActionType';
import { TaskActivityInformation } from '../entity/views/TaskActivityInformation';
import { getUtcNow } from './../utils/getUtcNow';
import { db } from './../db';
import { TaskField } from './../entity/TaskField';
import { TaskInformation } from './../entity/views/TaskInformation';
import * as _ from 'lodash';
import { In, Not } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { Task } from '../entity/Task';
import { TaskStatus } from '../types/TaskStatus';
import { sendEmailForUserId } from '../services/emailService';
import { assert } from '../utils/assert';
import { assertRole } from '../utils/assertRole';
import { handlerWrapper } from '../utils/asyncHandler';
import { createTaskByTaskTemplateForClient } from '../utils/createTaskByTaskTemplateAndUserEmail';
import { Role } from '../types/Role';
import { getOrgIdFromReq } from '../utils/getOrgIdFromReq';
import { getRoleFromReq } from '../utils/getRoleFromReq';
import { getUserIdFromReq } from '../utils/getUserIdFromReq';
import { Tag } from '../entity/Tag';
import { createTaskComment } from '../services/taskCommentService';
import { File } from '../entity/File';
import { streamFileToResponse } from '../utils/streamFileToResponse';
import { EmailTemplateType } from '../types/EmailTemplateType';
import { TaskDoc } from '../entity/TaskDoc';
import { Org } from '../entity/Org';
import { publishTaskChangeZevent } from '../utils/publishTaskChangeZevent';
import { TaskActivityLastSeen } from '../entity/TaskActivityLastSeen';
import { TaskTagsTag } from '../entity/TaskTagsTag';
import { existsQuery } from '../utils/existsQuery';

export const createNewTask = handlerWrapper(async (req, res) => {
  assertRole(req, ['admin', 'agent']);
  const { id, formTemplateId, orgClientId, taskName, startAt, every, period } = req.body;
  const creatorId = getUserIdFromReq(req);
  const orgId = getOrgIdFromReq(req);

  const task = await createTaskByTaskTemplateForClient(db.manager, formTemplateId, taskName, orgClientId, creatorId, id, orgId);

  res.json(task);
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
      },
      orgId: true,
      orgClient: {
        userId: true,
      },
    }
  });
  assert(task, 404);

  fields.forEach((f, index) => {
    f.taskId = id;
    f.ordinal = index + 1;
  });

  // const originalFieldIds = task.fields.map(x => x.id);
  // const currentFieldIds = fields.map(x => x.id);
  // const deletedFieldIds = _.difference(originalFieldIds, currentFieldIds);

  await db.transaction(async m => {
    await m.getRepository(TaskField).delete({ taskId: id });
    await m.getRepository(TaskField).save(fields);

    const taskActivity = new TaskActivity();
    taskActivity.type = TaskActionType.FieldChange;
    taskActivity.taskId = task.id;
    taskActivity.by = getUserIdFromReq(req);
    taskActivity.info = fields;

    await m.save(taskActivity);
  });

  publishTaskChangeZevent(task, getUserIdFromReq(req));

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

  let task: Task;
  await db.transaction(async m => {
    task = await m.getRepository(Task).findOneBy(query);
    assert(task, 404);

    const fieldEntities = Object.entries(fields).map(([key, value]) => ({ id: key, value: value, }));

    await m.getRepository(TaskField).save(fieldEntities);

    const taskActivity = new TaskActivity();
    taskActivity.type = TaskActionType.FieldChange;
    taskActivity.taskId = task.id;
    taskActivity.by = getUserIdFromReq(req);
    taskActivity.info = fields;

    await m.save(taskActivity);

  })


  publishTaskChangeZevent(task, getUserIdFromReq(req));

  res.json();
});

interface ISearchTaskQuery {
  text?: string;
  page?: number;
  size?: number;
  status?: TaskStatus[];
  assigneeId?: string;
  taskTemplateId?: string;
  tags?: string[];
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
  assertRole(req, ['admin', 'agent', 'client']);
  const option: ISearchTaskQuery = { ...defaultSearch, ...req.body };

  const { text, status, page, assigneeId, orderDirection, orderField, taskTemplateId, tags, clientId } = option;
  const size = option.size;
  const skip = (page - 1) * size;
  const { role, id } = (req as any).user;
  const isClient = role === Role.Client;

  let query = db.manager
    .createQueryBuilder()
    .from(TaskInformation, 'x')
    .where(`1 = 1`, { tags });
  if (isClient) {
    query = query.andWhere(`x."userId" = :id`, { id });
  } else {
    const orgId = getOrgIdFromReq(req);
    query = query.andWhere(`x."orgId" = :orgId`, { orgId });
  }
  if (status?.length) {
    query = query.andWhere(`x.status IN (:...status)`, { status });
  }
  if (assigneeId) {
    query = query.andWhere('x."assigneeId" = :assigneeId', { assigneeId });
  }
  if (taskTemplateId) {
    query = query.andWhere(`x."taskTemplateId" = :taskTemplateId`, { taskTemplateId });
  }
  if (tags?.length) {
    query = query.andWhere(
      existsQuery(
        query.createQueryBuilder()
          .from(TaskTagsTag, 'ttt')
          .where(`ttt."tagId" IN (:...tags)`)
          .andWhere(`x.id = ttt."taskId"`)
      )
    );
  }
  if (clientId) {
    query = query.andWhere(`x."orgClientId" = :clientId`, { clientId });
  }

  if (text) {
    if (isClient) {
      query = query.andWhere('(x.name ILIKE :text OR x."taskTemplateName" ILIKE :text)', { text: `%${text}%` });
    } else {
      query = query.andWhere('(x.name ILIKE :text OR x."taskTemplateName" ILIKE :text OR x.email ILIKE :text OR x."givenName" ILIKE :text OR x.surname ILIKE :text)', { text: `%${text}%` });
    }
  }

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
      status: In([
        // TaskStatus.TODO, 
        TaskStatus.IN_PROGRESS,
        TaskStatus.ACTION_REQUIRED,
        TaskStatus.DONE
      ]),
    },
    select: [
      'id',
      'name',
      'status',
      'orgName',
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
  const userId = getUserIdFromReq(req);

  let query: any;
  let relations = {
    fields: true,
    tags: true,
    docs: true,
    orgClient: false,
  };

  let task: Task;
  await db.transaction(async m => {
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
        query = { id };
        // relations = ['fields', 'fields.docs', 'fields.docs.file'];
        relations = {
          ...relations,
          tags: false,
          orgClient: true,
        };
        break;
      default:
        assert(false, 404);
        break;
    }


    task = await m.getRepository(Task).findOne({
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
    assert(task, 404);
    if (role === Role.Client) {
      assert(task.orgClient.userId === userId, 404);
    }

    await m.createQueryBuilder()
      .insert()
      .into(TaskActivityLastSeen)
      .values({ taskId: task.id, userId, lastHappenAt: () => `NOW()` })
      .orUpdate(['lastHappenAt'], ['taskId', 'userId'])
      .execute();

    if (role === Role.Client) {
      const { name: orgName } = await m.getRepository(Org).findOneBy({ id: task.orgId });
      (task as any).orgName = orgName;
    }
  })



  res.json(task);
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
  let task: Task;
  await db.transaction(async m => {
    task = await m.getRepository(Task).findOneByOrFail({ id: taskId, orgId });
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

      const taskActivity = new TaskActivity();
      taskActivity.type = TaskActionType.DocChange;
      taskActivity.taskId = task.id;
      taskActivity.by = getUserIdFromReq(req);
      taskActivity.info = taskDocs;

      await m.save([...taskFields, ...taskDocs, taskActivity]);
    };
  });

  publishTaskChangeZevent(task, getUserIdFromReq(req));

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

  let task: Task;
  await db.transaction(async m => {
    task = await m.getRepository(Task).findOneBy({
      id,
      orgId,
    });
    task.name = name;

    const taskActivity = new TaskActivity();
    taskActivity.type = TaskActionType.Renamed;
    taskActivity.taskId = task.id;
    taskActivity.by = getUserIdFromReq(req);
    taskActivity.info = name;

    await m.save([task, taskActivity]);
  })

  publishTaskChangeZevent(task, getUserIdFromReq(req));

  res.json();
});

export const assignTask = handlerWrapper(async (req, res) => {
  assertRole(req, ['admin', 'agent']);
  const { id } = req.params;
  const { assigneeId } = req.body;
  const orgId = getOrgIdFromReq(req);
  const userId = getUserIdFromReq(req);

  await db.transaction(async m => {
    const task = await m.findOneByOrFail(Task, { id, orgId });
    await m.update(Task, { id, orgId }, { assigneeId });
  });

  res.json();
});

export const updateTask = handlerWrapper(async (req, res) => {
  assertRole(req, ['admin', 'agent']);
  const { id, status } = req.params;
  const orgId = getOrgIdFromReq(req);
  const payload = req.body || {};

  let task: Task;
  await db.transaction(async m => {
    task = await m.findOneOrFail(Task, { where: { id, orgId } });
    Object.assign(task, payload);

    await m.save(task);
  });

  publishTaskChangeZevent(task, getUserIdFromReq(req));

  res.json();
});

export const changeTaskStatus = handlerWrapper(async (req, res) => {
  assertRole(req, ['admin', 'agent']);
  const { id, status } = req.params;
  const orgId = getOrgIdFromReq(req);
  const userId = getUserIdFromReq(req);

  let task: Task;
  await db.transaction(async m => {
    task = await m.findOneOrFail(Task, { where: { id, orgId } });
    const oldStatus = task.status;
    const newStatus = status as TaskStatus;
    if (oldStatus !== newStatus) {
      await m.update(Task, { id }, { status: newStatus });

      const taskActivity = new TaskActivity();
      taskActivity.type = TaskActionType.StatusChange;
      taskActivity.taskId = task.id;
      taskActivity.by = getUserIdFromReq(req);
      taskActivity.info = newStatus;

      await m.save(taskActivity);
    }
  });

  publishTaskChangeZevent(task, getUserIdFromReq(req));

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
    await createTaskComment(db.manager, task, userId, message);
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
  let query: any = { taskId: id, type: Not(TaskActionType.Comment) };
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
        userId: getUserIdFromReq(req)
      };
    default:
      break;
  }
  const list = await db.getRepository(TaskActivityInformation).find({ where: query });

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
    taskDoc = await m.getRepository(TaskDoc).findOneOrFail({
      where: { id: docId, orgId },
      relations: {
        task: true
      }
    });
    assert(taskDoc, 404);
    assert(!taskDoc.esign, 400, 'Cannot change sign request for a signed doc');

    if (!taskDoc.signRequestedAt) {
      taskDoc.signRequestedAt = getUtcNow();
      taskDoc.signRequestedBy = userId;
      await m.save(taskDoc);
    }
  })

  publishTaskChangeZevent(taskDoc.task, getUserIdFromReq(req));

  res.json(taskDoc);
});

export const unrequestSignTaskDoc = handlerWrapper(async (req, res) => {
  assertRole(req, ['admin', 'agent']);
  const { docId } = req.params;
  const orgId = getOrgIdFromReq(req);

  let taskDoc: TaskDoc = null;
  await db.transaction(async m => {
    taskDoc = await m.getRepository(TaskDoc).findOneOrFail({
      where: { id: docId, orgId },
      relations: {
        task: true
      }
    });
    assert(taskDoc, 404);
    assert(!taskDoc.signedAt, 400, 'Cannot change sign request for a signed doc');

    taskDoc.signRequestedAt = null;
    taskDoc.signRequestedBy = null;

    await m.save(taskDoc)
  })

  publishTaskChangeZevent(taskDoc.task, getUserIdFromReq(req));

  res.json(taskDoc);
});