import { RecurringInformation } from './../entity/views/RecurringInformation';
import { db } from './../db';
import { User } from '../entity/User';
import { assert } from '../utils/assert';
import * as _ from 'lodash';
import { v4 as uuidv4 } from 'uuid';
import { handlerWrapper } from '../utils/asyncHandler';
import { Femplate } from '../entity/Femplate';
import { Recurring } from '../entity/Recurring';
import { CLIENT_TZ, CRON_EXECUTE_TIME, testRunRecurring } from '../services/recurringService';
import * as moment from 'moment-timezone';
import { calculateRecurringNextRunAt } from '../utils/calculateRecurringNextRunAt';
import { assertRole } from '../utils/assertRole';
import { getOrgIdFromReq } from '../utils/getOrgIdFromReq';
import { getUserIdFromReq } from '../utils/getUserIdFromReq';

export const saveRecurring = handlerWrapper(async (req, res) => {
  assertRole(req, ['admin', 'agent']);
  const { id, orgClientId, name, femplateId, firstRunOn, every, period } = req.body;
  const orgId = getOrgIdFromReq(req);

  const femplate = await db.getRepository(Femplate).findOne({ where: { id: femplateId } });
  assert(femplate, 404, 'Femplate is not found');

  const recurring = new Recurring();
  recurring.id = id || uuidv4();
  recurring.name = name;
  recurring.orgId = orgId;
  recurring.femplateId = femplateId;
  recurring.orgClientId = orgClientId;
  recurring.firstRunOn = firstRunOn ? moment.tz(`${moment(firstRunOn).format('YYYY-MM-DD')} ${CRON_EXECUTE_TIME}`, 'YYYY-MM-DD HH:mm', CLIENT_TZ).toDate() : null;
  recurring.every = every;
  recurring.period = period;
  recurring.nextRunAt = calculateRecurringNextRunAt(recurring);

  const repo = db.getRepository(Recurring);
  await repo.save(recurring);

  res.json();
});

export const listRecurring = handlerWrapper(async (req, res) => {
  assertRole(req, ['admin', 'agent']);
  const orgId = getOrgIdFromReq(req);

  const list = await db.getRepository(RecurringInformation)
    .findBy({
      orgId
    });

  res.json(list);
});

export const getRecurring = handlerWrapper(async (req, res) => {
  assertRole(req, ['admin', 'agent']);
  const { id } = req.params;
  const orgId = getOrgIdFromReq(req);
  const repo = db.getRepository(Recurring);
  const recurring = await repo.findOneBy({ id, orgId });
  assert(recurring, 404);

  res.json(recurring);
});

export const deleteRecurring = handlerWrapper(async (req, res) => {
  assertRole(req, ['admin', 'agent']);
  const { id } = req.params;
  const orgId = getOrgIdFromReq(req);
  await db.getRepository(Recurring).delete({ id, orgId });

  res.json();
});

export const runRecurring = handlerWrapper(async (req, res) => {
  assertRole(req, ['admin', 'agent']);
  const { id } = req.params;
  const orgId = getOrgIdFromReq(req);
  const userId = getUserIdFromReq(req);

  const task = await testRunRecurring(id, orgId, userId);

  res.json(task);
});


