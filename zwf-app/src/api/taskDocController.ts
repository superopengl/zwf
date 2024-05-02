import { TaskField } from './../entity/TaskField';
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
import { generatePdfDocFile } from '../services/genDocService';
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

    file = await generatePdfDocFile(m, docTemplate, fields);

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

