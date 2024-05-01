import { TaskField } from './../entity/TaskField';
import { createPdfFromDocTemplate } from './docTemplateController';
import { getUtcNow } from './../utils/getUtcNow';

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
import { AppDataSource } from '../db';

export const generateAutoDoc = handlerWrapper(async (req, res) => {
  assertRole(req, 'admin', 'agent');
  const { fieldId } = req.params;
  const orgId = getOrgIdFromReq(req);

  let file: File;
  await AppDataSource.transaction(async m => {
    const taskField = await m.getRepository(TaskField).findOne({
      where: {
        id: fieldId
      },
      relations: {
        task: {
          fields: true
        }
      }
    });

    assert(taskField, 404, 'Task doc is not found');
    await assertTaskAccess(req, taskField.taskId);

    const { fields } = taskField.task;
    const { docTemplateId } = taskField.value;

    const docTemplate = await m.getRepository(DocTemplate).findOneBy({ id: docTemplateId });

    file = await tryGenDocFile(m, docTemplate, fields);

    taskField.value = {
      ...taskField.value,
      fileId: file.id
    }

    await m.save(taskField);
  })

  res.json({
    fileId: file.id
  });
});

export const searchTaskDocs = handlerWrapper(async (req, res) => {
  assertRole(req, 'admin', 'agent', 'client');
  const { ids } = req.body;
  assert(ids?.length, 400);

  const role = getRoleFromReq(req);

  // let query = await AppDataSource.getRepository(TaskDoc)
  //   .createQueryBuilder('t')
  //   .orderBy(`t."createdAt"`, 'ASC')
  //   .where(`t.id = ANY(:ids)`, { ids });

  // if (role === Role.Client) {
  //   query = query.andWhere(`official IS FALSE`)
  //     .andWhere(`"fileId" IS NOT NULL`)
  //     .select('*')
  // } else {
  //   query = query.leftJoin(DocTemplate, 'd', `t."docTemplateId" = d.id`)
  //     .select([
  //       't.*',
  //       'd.variables as variables'
  //     ])
  // }

  // const list = await query.execute()

  // res.json(list);
  res.json();
});

export const setTaskDocRequiresSign = handlerWrapper(async (req, res) => {
  assertRole(req, 'admin', 'agent');
  const { id } = req.params;
  const { requiresSign } = req.body;

  // await AppDataSource.getRepository(TaskDoc).update({
  //   id,
  //   signedAt: IsNull(),
  //   requiresSign: !requiresSign,
  // }, {
  //   requiresSign,
  // });

  res.json();
});


export const getTaskDocFileStream = handlerWrapper(async (req, res) => {
  assertRole(req, 'admin', 'client', 'agent');
  const { id } = req.params;
  const role = getRoleFromReq(req);
  assertTaskAccess(req, id);

  const file = await AppDataSource.getRepository(File).findOneBy({ id });
  assert(file, 404);

  if (role === Role.Client) {
    await AppDataSource.getRepository(File).update(id, {
      lastClientReadAt: getUtcNow()
    })
  }

  streamFileToResponse(file, res);
});

export const signTaskDoc = handlerWrapper(async (req, res) => {
  assertRole(req, 'client');
  const { id } = req.params;
  const userId = getUserIdFromReq(req);

  // await AppDataSource.transaction(async m => {
  //   const taskDoc = await m.findOneOrFail(TaskDoc, {
  //     where: {
  //       id,
  //       type: In(['agent', 'auto']),
  //       signedAt: IsNull(),
  //       requiresSign: true,
  //     },
  //     relations: ['file']
  //   });
  //   assert(taskDoc, 400, 'The task doc cannot be found or has been signed already');

  //   const now = getUtcNow();
  //   const { md5 } = taskDoc.file;
  //   taskDoc.signedAt = now;
  //   taskDoc.signedHash = computeTaskDocSignedHash(md5, userId, now);
  //   taskDoc.requiresSign = false;

  //   await m.save(taskDoc);
  //   await logTaskDocSignedByClient(m, taskDoc.taskId, userId, taskDoc.id, taskDoc.name);
  // })

  res.json();
});