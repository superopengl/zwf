import { TaskEvent } from '../entity/TaskEvent';
import { Demplate } from './../entity/Demplate';
import { ZeventType } from '../types/ZeventTypeDef';
import { TaskActivityInformation } from '../entity/views/TaskActivityInformation';
import { getUtcNow } from './../utils/getUtcNow';
import { db } from './../db';
import { TaskField } from './../entity/TaskField';
import { TaskInformation } from './../entity/views/TaskInformation';
import * as _ from 'lodash';
import { In, IsNull, Not } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { Task } from '../entity/Task';
import { TaskStatus } from '../types/TaskStatus';
import { sendEmailForUserId } from '../services/emailService';
import { assert } from '../utils/assert';
import { assertRole } from '../utils/assertRole';
import { handlerWrapper } from '../utils/asyncHandler';
import { createTaskForClient } from '../utils/createTaskForClient';
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
import { emitTaskEvent } from '../utils/emitTaskEvent';
import { TaskWatcher } from '../entity/TaskWatcher';
import { searchTaskList } from '../utils/searchTaskList';
import { addTaskWatcher } from '../utils/addWTaskWatcher';

export const createNewTask = handlerWrapper(async (req, res) => {
  assertRole(req, ['admin', 'agent']);
  const { id, femplateId, orgClientId, name } = req.body;
  const creatorId = getUserIdFromReq(req);
  const orgId = getOrgIdFromReq(req);

  let task: Task = null;
  await db.transaction(async m => {
    task = await createTaskForClient(m, femplateId, name, orgClientId, creatorId, id, orgId);
  })

  res.json(task);
});

export const downloadTaskFile = handlerWrapper(async (req, res) => {
  assert(getUserIdFromReq(req), 404);

  assertRole(req, ['admin', 'client', 'agent']);
  const { fileId } = req.params;
  const role = getRoleFromReq(req);
  const isClient = role === Role.Client;
  const userId = getUserIdFromReq(req);

  const query: any = isClient ? {
    taskDoc: {
      task: {
        userId,
      }
    }
  } : {
    taskDoc: {
      orgId: getOrgIdFromReq(req)
    }
  }

  const file = await db.getRepository(File).findOne({
    where: {
      id: fileId,
      ...query
    },
    relations: {
      taskDoc: {
        task: isClient
      },
    }
  });

  assert(file, 404);

  if (isClient) {
    await emitTaskEvent(db.manager, ZeventType.ClientDownloadedDoc, userId);
  }

  streamFileToResponse(file, res);
});


export const updateTaskFields = handlerWrapper(async (req, res) => {
  assertRole(req, ['admin', 'agent']);
  const { fields } = req.body;
  const { id } = req.params;
  const userId = getUserIdFromReq(req);

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

  // const originalFieldIds = task.fields.map(x => x.id);
  // const currentFieldIds = fields.map(x => x.id);
  // const deletedFieldIds = _.difference(originalFieldIds, currentFieldIds);

  await db.transaction(async m => {
    const existingFields = await m.getRepository(TaskField).findBy({ taskId: id });
    const valueMap = new Map(existingFields.map(x => [x.name, x]));
    fields.forEach((f, index) => {
      const existingField = valueMap.get(f.name);
      f.taskId = id;
      f.ordinal = index + 1;
      f.value = existingField?.value;
    });

    await m.getRepository(TaskField).delete({ taskId: id });
    await m.getRepository(TaskField).save(fields);

    await emitTaskEvent(m, ZeventType.TaskFormSchemaChanged, id, userId, fields);
  });

  res.json();
});

export const watchTask = handlerWrapper(async (req, res) => {
  assertRole(req, ['admin', 'agent']);
  const { watch } = req.body;
  const { id } = req.params;
  const orgId = getOrgIdFromReq(req);
  const userId = getUserIdFromReq(req);

  await db.transaction(async m => {
    const task = await m.getRepository(Task).findOneByOrFail({
      id,
      orgId,
    });

    if (watch) {
      // watch task
      await addTaskWatcher(m, id, userId, 'watch');
    } else {
      // unwatch task
      assert(task.assigneeId !== userId, 400, 'Cannot unwatch because you are the assignee of this task.')
      await m.getRepository(TaskWatcher).delete({
        taskId: id,
        userId,
      })
    }
  });

  res.json();
});

export const listMyWatchedTasks = handlerWrapper(async (req, res) => {
  assertRole(req, ['admin', 'agent']);
  const orgId = getOrgIdFromReq(req);
  const userId = getUserIdFromReq(req);
  const role = getRoleFromReq(req);

  const condition: ISearchTaskQuery = {
    ...defaultSearch,
    ...req.body,
    watchedOnly: true
  };

  const result = await searchTaskList(userId, role, orgId, condition);

  res.json(result);
});



export const saveTaskFieldValue = handlerWrapper(async (req, res) => {
  assertRole(req, ['admin', 'agent', 'client']);
  const { fields } = req.body;
  const { id } = req.params;
  const role = getRoleFromReq(req);
  const userId = getUserIdFromReq(req);

  const isClient = role === Role.Client;

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
        orgClient: {
          userId,
        }
      };
      break;
    default:
      assert(false, 404, 'Task is not found');
  }

  let task: Task;
  await db.transaction(async m => {
    task = await m.getRepository(Task).findOne({
      where: query,
      relations: {
        orgClient: isClient,
        fields: true,
      }
    });
    assert(task, 404);

    const fieldToSave: TaskField[] = [];
    task.fields.forEach(f => {
      if (f.id in fields) {
        f.value = fields[f.id];
        fieldToSave.push(f);
      }
    });

    if (fieldToSave.length) {
      await m.getRepository(TaskField).save(fieldToSave);
      await emitTaskEvent(m, ZeventType.TaskFieldValueChanged, id, userId, fields);
      if (isClient) {
        await emitTaskEvent(m, ZeventType.ClientSubmittedForm, id, userId, fields);
      }
    }
  })

  res.json();
});

export interface ISearchTaskQuery {
  text?: string;
  page?: number;
  size?: number;
  status?: TaskStatus[];
  assigneeId?: string;
  femplateId?: string;
  tags?: string[];
  clientId?: string;
  watchedOnly: boolean;
  dueDateRange?: [string, string];
  orderField?: string;
  orderDirection?: 'ASC' | 'DESC';
}

const defaultSearch: ISearchTaskQuery = {
  page: 1,
  size: 50,
  status: [TaskStatus.TODO, TaskStatus.IN_PROGRESS, TaskStatus.ACTION_REQUIRED, TaskStatus.DONE],
  watchedOnly: false,
  orderField: 'updatedAt',
  orderDirection: 'DESC'
};


export const searchTask = handlerWrapper(async (req, res) => {
  assertRole(req, ['admin', 'agent', 'client']);
  const option: ISearchTaskQuery = { ...defaultSearch, ...req.body };
  const role = getRoleFromReq(req);
  const userId = getUserIdFromReq(req);
  const orgId = getOrgIdFromReq(req);

  const result = await searchTaskList(userId, role, orgId, option);

  res.json(result);
});

export const listMyCases = handlerWrapper(async (req, res) => {
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
        query = {
          id,
          orgClient: {
            userId
          },
          // docs: {
          //   fileId: Not(IsNull()),
          // }
        };
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
      const { name: orgName } = await m.getRepository(Org).findOneBy({ id: task.orgId });
      (task as any).orgName = orgName;

      task.docs = task.docs.filter(d => d.fileId);
    } else {
      const watched = await m.getRepository(TaskWatcher).findOneBy({ taskId: task.id, userId });
      (task as any).watched = !!watched;
    }
  })

  res.json(task);
});

export const addDemplateToTask = handlerWrapper(async (req, res) => {
  assertRole(req, ['admin', 'agent']);
  const { demplateIds } = req.body
  assert(demplateIds?.length, 400, 'demplateIds is empty');
  const userId = getUserIdFromReq(req);
  const orgId = getOrgIdFromReq(req);
  const { taskId } = req.params;


  // Upload file binary to S3
  let taskDocs: TaskDoc[] = [];
  let task: Task;
  await db.transaction(async m => {
    task = await m.getRepository(Task).findOneByOrFail({ id: taskId, orgId });
    const demplates = await m.getRepository(Demplate).findBy({
      id: In(demplateIds),
      orgId,
    });

    if (!demplates.length) {
      return;
    }
    const fieldCount = await m.getRepository(TaskField).countBy({
      taskId
    })

    const fieldsNamesToAdd = new Set<string>();
    demplates.forEach(d => d.refFieldNames.forEach(n => fieldsNamesToAdd.add(n)));
    const taskFields = Array.from(fieldsNamesToAdd).map((fieldName, index) => {
      const taskField = new TaskField();
      taskField.taskId = taskId;
      taskField.name = fieldName;
      taskField.type = 'text';
      taskField.ordinal = fieldCount + 1 + index;
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

    taskDocs = demplates.map(t => {
      const taskDoc = new TaskDoc();
      taskDoc.id = uuidv4();
      taskDoc.orgId = orgId;
      taskDoc.taskId = taskId;
      taskDoc.uploadedBy = userId;
      taskDoc.type = 'autogen';
      taskDoc.demplateId = t.id;
      taskDoc.name = `${t.name}.pdf`;
      taskDoc.fieldBag = t.refFieldNames.reduce((pre, curr) => {
        pre[curr] = null;
        return pre;
      }, {});
      return taskDoc;
    })

    await m.save(taskDocs);

    await emitTaskEvent(m, ZeventType.TaskAddedDoc, taskId, userId, taskDocs);
  });

  res.json();
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
        orgClient: {
          userId: getUserIdFromReq(req)
        }
      };
      break;
    default:
      assert(false, 500);
  }

  const task = await db.getRepository(Task).findOne({
    where: query,
    select: {
      id: true,
    },
    relations: {
      orgClient: true,
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

export const renameTask = handlerWrapper(async (req, res) => {
  assertRole(req, ['admin', 'agent']);
  const { id } = req.params;
  const { name } = req.body;
  const orgId = getOrgIdFromReq(req);

  await db.transaction(async m => {
    const result = await m.update(Task, { id, orgId }, { name });

    if (result.affected) {
      await emitTaskEvent(m, ZeventType.TaskRenamed, id, getUserIdFromReq(req), { name });
    }
  })

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
    if (task.assigneeId === assigneeId) {
      return;
    }

    await m.update(Task, { id, orgId }, { assigneeId });

    if (assigneeId) {
      await addTaskWatcher(m, id, assigneeId, 'assignee');
    } else {
      // Unassign
      await m.delete(TaskWatcher, { taskId: id, userId: assigneeId, reason: 'assignee' });
    }

    await emitTaskEvent(m, ZeventType.TaskAssigned, id, userId, { assigneeId });
  });

  res.json();
});

const statusMapping = new Map([
  [`${TaskStatus.TODO}>${TaskStatus.IN_PROGRESS}`, ZeventType.TaskStatusToInProgress],
  [`${TaskStatus.TODO}>${TaskStatus.ACTION_REQUIRED}`, ZeventType.TaskStatusAwaitClient],
  [`${TaskStatus.TODO}>${TaskStatus.DONE}`, ZeventType.TaskStatusCompleted],
  [`${TaskStatus.TODO}>${TaskStatus.ARCHIVED}`, ZeventType.TaskStatusArchived],
  [`${TaskStatus.IN_PROGRESS}>${TaskStatus.TODO}`, ZeventType.TaskStatusMovedBackToDo],
  [`${TaskStatus.IN_PROGRESS}>${TaskStatus.ACTION_REQUIRED}`, ZeventType.TaskStatusAwaitClient],
  [`${TaskStatus.IN_PROGRESS}>${TaskStatus.DONE}`, ZeventType.TaskStatusCompleted],
  [`${TaskStatus.IN_PROGRESS}>${TaskStatus.ARCHIVED}`, ZeventType.TaskStatusArchived],
  [`${TaskStatus.ACTION_REQUIRED}>${TaskStatus.TODO}`, ZeventType.TaskStatusMovedBackToDo],
  [`${TaskStatus.ACTION_REQUIRED}>${TaskStatus.IN_PROGRESS}`, ZeventType.ClientSubmittedForm],
  [`${TaskStatus.ACTION_REQUIRED}>${TaskStatus.DONE}`, ZeventType.TaskStatusCompleted],
  [`${TaskStatus.ACTION_REQUIRED}>${TaskStatus.ARCHIVED}`, ZeventType.TaskStatusArchived],
  [`${TaskStatus.DONE}>${TaskStatus.TODO}`, ZeventType.TaskStatusMovedBackToDo],
  [`${TaskStatus.DONE}>${TaskStatus.IN_PROGRESS}`, ZeventType.TaskStatusToInProgress],
  [`${TaskStatus.DONE}>${TaskStatus.ACTION_REQUIRED}`, ZeventType.TaskStatusAwaitClient],
  [`${TaskStatus.DONE}>${TaskStatus.ARCHIVED}`, ZeventType.TaskStatusArchived],
  [`${TaskStatus.ARCHIVED}>${TaskStatus.TODO}`, ZeventType.TaskStatusMovedBackToDo],
  [`${TaskStatus.ARCHIVED}>${TaskStatus.IN_PROGRESS}`, ZeventType.TaskStatusToInProgress],
  [`${TaskStatus.ARCHIVED}>${TaskStatus.ACTION_REQUIRED}`, ZeventType.TaskStatusAwaitClient],
  [`${TaskStatus.ARCHIVED}>${TaskStatus.DONE}`, ZeventType.TaskStatusCompleted],
]);


export const changeTaskStatus = handlerWrapper(async (req, res) => {
  assertRole(req, ['admin', 'agent']);
  const { id, status } = req.params;
  const orgId = getOrgIdFromReq(req);
  const userId = getUserIdFromReq(req);

  await db.transaction(async m => {
    const task = await m.findOneOrFail(Task, {
      where: { id, orgId },
      select: {
        status: true,
      }
    });
    const oldStatus = task.status;
    const newStatus = status as TaskStatus;

    if (oldStatus === newStatus) {
      return;
    }
    await m.update(Task, { id, orgId }, { statusBefore: oldStatus, status: newStatus });

    const eventType = statusMapping.get(`${oldStatus}>${newStatus}`);

    await emitTaskEvent(m, eventType, id, userId, { statusBefore: oldStatus, statusAfter: newStatus })
  });


  res.json();
});

export const requestClientAction = handlerWrapper(async (req, res) => {
  assertRole(req, ['admin', 'agent']);
  const { id } = req.params;
  const { comment } = req.body;
  const orgId = getOrgIdFromReq(req);
  const userId = getUserIdFromReq(req);

  await db.transaction(async m => {
    const task = await m.findOneOrFail(Task, {
      where: {
        id,
        orgId,
      }
    });

    await emitTaskEvent(m, ZeventType.RequestClientFillForm, id, userId);
    const message = comment?.trim();
    if (message) {
      await emitTaskEvent(m, ZeventType.TaskComment, id, userId, { message });
    }

    task.status = TaskStatus.ACTION_REQUIRED;

    await m.save(task);
  });


  res.json();
});

export const getTaskTimeline = handlerWrapper(async (req, res) => {
  assertRole(req, ['admin', 'agent', 'client']);
  const { id } = req.params;
  let query: any = { taskId: id, type: Not(ZeventType.TaskComment) };
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
  const userId = getUserIdFromReq(req);

  await db.transaction(async m => {
    const taskDoc = await m.getRepository(TaskDoc).findOne({
      where: {
        id: docId, orgId
      },
      relations: {
        task: true,
      }
    });
    assert(taskDoc, 404);
    assert(!taskDoc.esign, 400, 'Cannot delete a signed doc');

    await m.softDelete(TaskDoc, { id: docId });

    await emitTaskEvent(m, ZeventType.TaskDeletedDoc, taskDoc.task.id, userId, { docId });
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

      await emitTaskEvent(m, ZeventType.RequestClientSignDoc, taskDoc.task.id, userId, {
        docId: taskDoc.id,
        docName: taskDoc.name
      });
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
    await emitTaskEvent(m, ZeventType.UnrequestClientSignDoc, taskDoc.task.id, userId, {
      docId: taskDoc.id,
      docName: taskDoc.name
    });
  })

  res.json(taskDoc);
});


