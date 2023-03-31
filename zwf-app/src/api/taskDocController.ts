import { publishEvent } from '../services/zeventSubPubService';
import { TaskDoc } from './../entity/TaskDoc';

import { assert } from '../utils/assert';
import { assertRole } from '../utils/assertRole';
import { handlerWrapper } from '../utils/asyncHandler';
import * as _ from 'lodash';
import { getUserIdFromReq } from '../utils/getUserIdFromReq';
import { getOrgIdFromReq } from '../utils/getOrgIdFromReq';
import { generatePdfTaskDocFile } from '../services/genDocService';
import { db } from '../db';
import { IsNull, Not } from 'typeorm';
import { Role } from '../types/Role';
import { computeTaskFileSignedHash } from '../utils/computeTaskFileSignedHash';
import { getRoleFromReq } from '../utils/getRoleFromReq';
import { getUtcNow } from '../utils/getUtcNow';
import { streamFileToResponse } from '../utils/streamFileToResponse';
import { Task } from '../entity/Task';
import { v4 as uuidv4 } from 'uuid';
import { uploadToS3 } from '../utils/uploadToS3';
import { File } from '../entity/File';
import { publishTaskChangeEvent } from '../utils/publishTaskChangeEvent';

export const generateAutoDoc = handlerWrapper(async (req, res) => {
  assertRole(req, ['admin', 'agent']);
  const { docId } = req.params;
  const orgId = getOrgIdFromReq(req);
  const userId = getUserIdFromReq(req);

  let result: any;
  await db.transaction(async m => {
    const doc = await m.getRepository(TaskDoc).findOne({
      where: {
        id: docId,
        orgId,
      },
      relations: {
        task: {
          fields: true
        }
      }
    });

    assert(doc, 404, 'Task doc is not found');

    const fileResult = await generatePdfTaskDocFile(m, doc.id, userId);
    assert(fileResult.succeeded, 400, 'Cannot generate task doc');

    const { file } = fileResult;

    result = {
      fileId: file.id,
      name: file.fileName,
    };
  });

  res.json(result);
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

  publishTaskChangeEvent(task, userId);

  res.json({
    fileId: fileId,
  });
});


export const downloadTaskDoc = handlerWrapper(async (req, res) => {
  assert(getUserIdFromReq(req), 404);

  assertRole(req, ['system', 'admin', 'client', 'agent']);
  const { docId } = req.params;
  const role = getRoleFromReq(req);
  const userId = getUserIdFromReq(req);
  const isClient = role === Role.Client;

  const query: any = {
    id: docId
  }

  switch (role) {
    case Role.Agent:
    case Role.Admin:
      query.orgId = getOrgIdFromReq(req);
      break;
    default:
      break;
  }

  const doc = await db.getRepository(TaskDoc).findOne({
    where: {
      id: docId
    },
    relations: {
      task: true,
      file: true,
    }
  });

  assert(doc, 404);
  assert(role !== Role.Client || doc.task.userId === getUserIdFromReq(req), 404);

  const { file, docTemplateId } = doc;

  if (file) {
    streamFileToResponse(file, res);
  } else if (docTemplateId) {
    // Hand over to frontend.
    const result = await generatePdfTaskDocFile(db.manager, doc.id, userId);
    if (result.succeeded) {
      streamFileToResponse(result.file, res);
    } else {
      res.status(425).json(result).end();
    }
    return;
  } else {
    assert(doc, 500, 'Invalid doc file condition');
  }
});

export const signTaskDoc = handlerWrapper(async (req, res) => {
  assertRole(req, ['client']);
  const { docId } = req.params;
  const userId = getUserIdFromReq(req);

  let doc: TaskDoc;
  await db.transaction(async m => {
    doc = await m.findOne(TaskDoc, {
      where: {
        id: docId,
        fileId: Not(IsNull()),
      },
      relations: {
        file: true,
        task: true,
      },
    });


    assert(doc?.task?.userId === userId, 404);
    assert(!doc.esign, 400, 'The doc has been esigned');

    const now = getUtcNow();
    doc.signedBy = userId;
    doc.signedAt = now;
    doc.esign = computeTaskFileSignedHash(doc.file.md5, userId, now);

    await m.save(doc);
  })

  publishTaskChangeEvent(doc.task, getUserIdFromReq(req));

  res.json(doc);
});