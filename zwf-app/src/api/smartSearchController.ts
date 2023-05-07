import { TaskStatus } from './../types/TaskStatus';
import { OrgClientInformation } from './../entity/views/OrgClientInformation';

import { getRepository, ILike, Not } from 'typeorm';
import { Femplate } from '../entity/Femplate';
import { Task } from '../entity/Task';
import { assert } from '../utils/assert';
import { assertRole } from '../utils/assertRole';
import { handlerWrapper } from '../utils/asyncHandler';
import * as _ from 'lodash';
import { getOrgIdFromReq } from '../utils/getOrgIdFromReq';
import { DocTemplate } from '../entity/DocTemplate';
import { db } from '../db';

export const smartSearchTask = handlerWrapper(async (req, res) => {
  assertRole(req,[ 'admin', 'agent']);
  const { text } = req.body;
  assert(text, 400);
  const orgId = getOrgIdFromReq(req);
  const size = 20;

  const list = await db.getRepository(Task).find({
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
      updatedAt: 'DESC'
    },
    take: size
  });

  res.json(list);
});

export const smartSearchFemplate = handlerWrapper(async (req, res) => {
  assertRole(req,[ 'admin', 'agent']);
  const { text } = req.body;
  assert(text, 400);
  const orgId = getOrgIdFromReq(req);
  const size = 20;

  const list = await db.getRepository(Femplate).find({
    where: {
      orgId,
      name: ILike(`%${text}%`)
    },
    order: {
      updatedAt: 'DESC'
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
  assertRole(req,[ 'admin', 'agent']);
  const { text } = req.body;
  assert(text, 400);
  const orgId = getOrgIdFromReq(req);
  const size = 20;

  const list = await db.getRepository(DocTemplate).find({
    where: {
      orgId,
      name: ILike(`%${text}%`)
    },
    order: {
      updatedAt: 'DESC'
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
  assertRole(req,[ 'admin', 'agent']);
  const { text } = req.body;
  assert(text, 400);
  const orgId = getOrgIdFromReq(req);
  const size = 20;

  const list = await db.getRepository(OrgClientInformation)
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