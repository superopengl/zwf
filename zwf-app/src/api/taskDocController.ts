import { createPdfFromDocTemplate } from './docTemplateController';
import { getUtcNow } from './../utils/getUtcNow';
import { TaskDoc } from '../entity/TaskDoc';

import { getManager, getRepository, In, Not, IsNull } from 'typeorm';
import { assert } from '../utils/assert';
import { assertRole } from "../utils/assertRole";
import { handlerWrapper } from '../utils/asyncHandler';
import * as _ from 'lodash';
import { Role } from '../types/Role';
import { getRoleFromReq } from '../utils/getRoleFromReq';
import { getUserIdFromReq } from '../utils/getUserIdFromReq';
import { File } from '../entity/File';
import { computeTaskDocSignedHash } from '../utils/computeTaskDocSignedHash';
import { logTaskDocSignedByClient } from '../services/taskTrackingService';
import { assertTaskAccess } from '../utils/assertTaskAccess';
import { streamFileToResponse } from '../utils/streamFileToResponse';
import { DocTemplate } from '../entity/DocTemplate';
import { getOrgIdFromReq } from '../utils/getOrgIdFromReq';
import { tryGenDocFile } from '../services/genDocService';

export const generateAutoDoc = handlerWrapper(async (req, res) => {
  assertRole(req, 'admin', 'agent');
  const { id } = req.params;
  const orgId = getOrgIdFromReq(req);

  await getManager().transaction(async m => {
    const taskDoc = await m.findOne(TaskDoc, {
      where: {
        id,
      },
      relations: ['task']
    });

    assert(taskDoc.task.orgId === orgId, 404, 'Task doc is not found');
    assert(taskDoc?.docTemplateId, 404, 'Task doc is not found');
    const docTemplate = await m.findOne(DocTemplate, taskDoc.docTemplateId);
    assert(docTemplate, 404, 'Doc template is not found');

    const file = await tryGenDocFile(m, docTemplate, taskDoc.task.fields);
    taskDoc.fileId = file.id;
    await m.save(taskDoc);
  })

  res.json();
});

export const createOrphanTaskDoc = handlerWrapper(async (req, res) => {
  const { fileId, docTemplateId } = req.body;
  assert(fileId || docTemplateId, 400);
  if (docTemplateId) {
    assertRole(req, 'admin', 'agent');
  } else {
    assertRole(req, 'admin', 'agent', 'client');
  }
  const role = getRoleFromReq(req);

  const taskDoc = new TaskDoc();
  taskDoc.createdBy = getUserIdFromReq(req);
  taskDoc.taskId = null; // This is an orphan TaskDoc having no associated Task
  if (fileId) {
    // File has been uploaded
    const file = await getRepository(File).findOne(fileId, { select: ['fileName'] });
    assert(file, 400);

    taskDoc.type = role === Role.Client ? 'client' : 'agent';
    taskDoc.fileId = fileId;
    taskDoc.name = file.fileName;
    taskDoc.status = 'done';
  } else if (docTemplateId) {
    // Create task doc from a doc template
    const docTemplate = await getRepository(DocTemplate).findOne({
      where: {
        id: docTemplateId,
        orgId: getOrgIdFromReq(req)
      },
      select: [
        'name'
      ]
    });
    assert(docTemplate, 400);

    taskDoc.type = 'auto';
    taskDoc.docTemplateId = docTemplateId;
    taskDoc.name = `${docTemplate.name}.pdf`;
    taskDoc.status = 'pending';
  }

  await getManager().save(taskDoc);

  res.json(taskDoc);
});

export const searchTaskDocs = handlerWrapper(async (req, res) => {
  assertRole(req, 'admin', 'agent', 'client');
  const { ids } = req.body;
  assert(ids?.length, 400);

  const role = getRoleFromReq(req);
  const query = role === Role.Client ? {
    id: In(ids),
    officialOnly: false,
    fileId: Not(IsNull()),
  } : {
    id: In(ids)
  }

  const list = await getRepository(TaskDoc).find({
    where: query,
    order: {
      createdAt: 'ASC'
    }
  });

  res.json(list);
});

export const setTaskDocOfficialOnly = handlerWrapper(async (req, res) => {
  assertRole(req, 'admin', 'agent');
  const { id } = req.params;
  const { officialOnly } = req.body;

  await getRepository(TaskDoc).update(id, { officialOnly });

  res.json();
});

export const setTaskDocRequiresSign = handlerWrapper(async (req, res) => {
  assertRole(req, 'admin', 'agent');
  const { id } = req.params;
  const { requiresSign } = req.body;

  await getRepository(TaskDoc).update({
    id,
    signedAt: IsNull(),
    requiresSign: !requiresSign,
  }, requiresSign ? {
    requiresSign: true,
    officialOnly: false,
  } : {
    requiresSign: false
  });

  res.json();
});


export const getTaskDocFileStream = handlerWrapper(async (req, res) => {
  assertRole(req, 'admin', 'client', 'agent');
  const { id } = req.params;
  const role = getRoleFromReq(req);
  assertTaskAccess(req, id);

  const taskDoc = await getRepository(TaskDoc).findOne(id, { relations: ['file'] });
  assert(taskDoc?.file, 400, 'File does not exist');

  if (role === Role.Client) {
    await getRepository(TaskDoc).update(id, {
      lastClientReadAt: getUtcNow()
    })
  }

  streamFileToResponse(taskDoc.file, res);
});

export const signTaskDoc = handlerWrapper(async (req, res) => {
  assertRole(req, 'client');
  const { id } = req.params;
  const userId = getUserIdFromReq(req);

  await getManager().transaction(async m => {
    const taskDoc = await m.findOneOrFail(TaskDoc, {
      where: {
        id,
        type: In(['agent', 'auto']),
        signedAt: IsNull(),
        requiresSign: true,
      },
      relations: ['file', 'task']
    });
    assert(taskDoc.task.userId === userId, 403, 'Wrong person attempts to sign the task doc.')
    assert(taskDoc, 400, 'The task doc cannot be found or has been signed already');

    const now = getUtcNow();
    const { md5 } = taskDoc.file;
    taskDoc.signedAt = now;
    taskDoc.signedHash = computeTaskDocSignedHash(md5, userId, now);
    taskDoc.requiresSign = false;

    await m.save(taskDoc);
    await logTaskDocSignedByClient(m, taskDoc.taskId, userId, taskDoc.id, taskDoc.name);
  })

  res.json();
});