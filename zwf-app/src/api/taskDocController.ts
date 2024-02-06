import { TaskDoc } from '../entity/TaskDoc';

import { getManager, getRepository } from 'typeorm';
import { assert } from '../utils/assert';
import { assertRole } from "../utils/assertRole";
import { handlerWrapper } from '../utils/asyncHandler';
import * as _ from 'lodash';
import { Role } from '../types/Role';
import { getRoleFromReq } from '../utils/getRoleFromReq';
import { getUserIdFromReq } from '../utils/getUserIdFromReq';
import { File } from '../entity/File';


export const createOrphanTaskDoc = handlerWrapper(async (req, res) => {
  assertRole(req, 'admin', 'agent', 'client');
  const role = getRoleFromReq(req);
  const { fileId } = req.body;
  assert(fileId, 400);

  const file = await getRepository(File).findOne(fileId, { select: ['fileName'] });
  assert(file, 400);

  const taskDoc = new TaskDoc();
  taskDoc.createdBy = getUserIdFromReq(req);
  taskDoc.fileId = fileId;
  taskDoc.name = file.fileName;
  taskDoc.type = role === Role.Client ? 'client' : 'agent';
  taskDoc.taskId = null; // This is an orphan TaskDoc having no associated Task

  await getManager().save(taskDoc);

  res.json(taskDoc);
});

export const searchTaskDocs = handlerWrapper(async (req, res) => {
  assertRole(req, 'admin', 'agent', 'client');
  const { ids } = req.body;
  assert(ids?.length, 400);

  const list = await getRepository(TaskDoc).findByIds(ids);

  res.json(list);
});