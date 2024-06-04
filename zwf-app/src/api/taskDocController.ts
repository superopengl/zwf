import { TaskField } from './../entity/TaskField';
import { getUtcNow } from './../utils/getUtcNow';

import { assert } from '../utils/assert';
import { assertRole } from '../utils/assertRole';
import { handlerWrapper } from '../utils/asyncHandler';
import * as _ from 'lodash';
import { Role } from '../types/Role';
import { getRoleFromReq } from '../utils/getRoleFromReq';
import { getUserIdFromReq } from '../utils/getUserIdFromReq';
import { File } from '../entity/File';
import { computeTaskFileSignedHash } from '../utils/computeTaskFileSignedHash';
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

  let result: any;
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

    const file = await generatePdfDocFile(m, docTemplate, fields);
    file.taskId = taskField.taskId;
    file.fieldId = taskField.id;

    taskField.value = {
      ...taskField.value,
      fileId: file.id
    };

    await m.save([taskField, file]);

    result = {
      fileId: file.id,
      name: file.fileName,
    };
  });

  res.json(result);
});
