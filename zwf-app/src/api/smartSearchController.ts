import { TaskStatus } from './../types/TaskStatus';
import { OrgClientInformation } from './../entity/views/OrgClientInformation';

import { getRepository, ILike, Not } from 'typeorm';
import { TaskTemplate } from '../entity/TaskTemplate';
import { Task } from '../entity/Task';
import { assert } from '../utils/assert';
import { assertRole } from "../utils/assertRole";
import { handlerWrapper } from '../utils/asyncHandler';
import * as _ from 'lodash';
import { getOrgIdFromReq } from '../utils/getOrgIdFromReq';
import { DocTemplate } from '../entity/DocTemplate';

export const smartSearchTask = handlerWrapper(async (req, res) => {
  assertRole(req, 'admin', 'agent');
  const { text } = req.body;
  assert(text, 400);
  const orgId = getOrgIdFromReq(req);
  const size = 20;

  const list = await getRepository(Task).find({
    where: {
      orgId,
      name: ILike(`%${text}%`),
      status: Not(TaskStatus.ARCHIVED)
    },
    select: [
      'id',
      'name',
      'status',
    ],
    order: {
      lastUpdatedAt: 'DESC'
    },
    take: size
  });

  res.json(list);
});

export const smartSearchTaskTemplate = handlerWrapper(async (req, res) => {
  assertRole(req, 'admin', 'agent');
  const { text } = req.body;
  assert(text, 400);
  const orgId = getOrgIdFromReq(req);
  const size = 20;

  const list = await getRepository(TaskTemplate).find({
    where: {
      orgId,
      name: ILike(`%${text}%`)
    },
    order: {
      lastUpdatedAt: 'DESC'
    },
    select: [
      'id',
      'name',
    ],
    take: size
  });

  res.json(list);
});

export const smartSearchDocTemplate = handlerWrapper(async (req, res) => {
  assertRole(req, 'admin', 'agent');
  const { text } = req.body;
  assert(text, 400);
  const orgId = getOrgIdFromReq(req);
  const size = 20;

  const list = await getRepository(DocTemplate).find({
    where: {
      orgId,
      name: ILike(`%${text}%`)
    },
    order: {
      lastUpdatedAt: 'DESC'
    },
    select: [
      'id',
      'name',
    ],
    take: size
  });

  res.json(list);
});

export const smartSearchClient = handlerWrapper(async (req, res) => {
  assertRole(req, 'admin', 'agent');
  const { text } = req.body;
  assert(text, 400);
  const orgId = getOrgIdFromReq(req);
  const size = 20;

  const list = await getRepository(OrgClientInformation)
    .createQueryBuilder()
    .where('"orgId" = :orgId', {orgId})
    .andWhere('(email ILIKE :text OR "givenName" ILIKE :text OR surname ILIKE :text)', { text: `%${text}%` })
    .select([
      'id',
    ])
    .take(size)
    .execute();

  res.json(list);
});