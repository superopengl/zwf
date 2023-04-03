import { db } from './../db';
import { SupportUserUnreadInformation } from '../entity/views/SupportUserUnreadInformation';
import { SupportUserLastAccess } from '../entity/SupportUserLastAccess';
import { SupportInformation } from '../entity/views/SupportInformation';
import { v4 as uuidv4 } from 'uuid';

import { assert } from '../utils/assert';
import * as _ from 'lodash';
import { handlerWrapper } from '../utils/asyncHandler';
import { publishEvent } from '../services/zeventSubPubService';
import { Role } from '../types/Role';
import { getRoleFromReq } from '../utils/getRoleFromReq';
import { getUserIdFromReq } from '../utils/getUserIdFromReq';
import { SupportMessage } from '../entity/SupportMessage';
import { assertRole } from '../utils/assertRole';

export const listMySupportMessages = handlerWrapper(async (req, res) => {
  const userId = getUserIdFromReq(req);
  assert(userId, 404);

  const list = await db.getRepository(SupportMessage).find({
    where: {
      userId
    },
    order: {
      createdAt: 'ASC'
    }
  });
  const unreadCountResult = await db.getRepository(SupportUserUnreadInformation).findOne({ where: { userId } });
  const unreadCount = +unreadCountResult?.count ?? 0;

  const result = {
    list,
    unreadCount
  };

  res.json(result);
});

export const searchSupportList = handlerWrapper(async (req, res) => {
  assertRole(req, ['system']);
  const userId = getUserIdFromReq(req);
  const { text, page, size, orderField, orderDirection, tags } = req.body;

  const pageNo = page || 1;
  const pageSize = size || 50;
  assert(pageNo >= 1 && pageSize > 0, 400, 'Invalid page and size parameter');

  let query = db.getRepository(SupportInformation)
    .createQueryBuilder()
    .where('"userId" != :userId', { userId });

  if (text) {
    query = query.andWhere('(email ILIKE :text OR "givenName" ILIKE :text OR "surname" ILIKE :text OR "orgName" ILIKE :text)', { text: `%${text}%` });
  }

  const count = await query.getCount();

  const data = await query // .orderBy(`"${orderField}"`, orderDirection)
    .offset((pageNo - 1) * pageSize)
    .limit(pageSize)
    .getMany();

  data.forEach(x => {
    x.unreadCount = +x.unreadCount;
  });

  const result = {
    count,
    page: pageNo,
    data
  };

  res.json(result);
});

export const getUserSupport = handlerWrapper(async (req, res) => {
  assertRole(req, ['system']);
  const { userId } = req.params;

  const list = await db.getRepository(SupportMessage).find({
    where: {
      userId
    },
    order: {
      createdAt: 'ASC'
    }
  });

  res.json(list);
});

export const createSupportMessage = handlerWrapper(async (req, res) => {
  const { capturedUrl, message, replyToUserId } = req.body;
  assert(message, 404, `Invalid contact information`);
  const userId = getUserIdFromReq(req);
  assert(userId, 404);

  const role = getRoleFromReq(req);

  const sm = new SupportMessage();

  sm.id = uuidv4();
  sm.by = userId;
  sm.message = message;

  if (role === Role.System) {
    assert(replyToUserId, 400, 'replyToUserId is not specified');
    sm.userId = replyToUserId;
  } else {
    sm.userId = userId;
    sm.capturedUrl = capturedUrl;
  }

  await db.manager.save(sm);

  publishEvent({
    type: 'support',
    userId: sm.userId,
    payload: sm,
    by: userId,
  });

  res.json();
});

export const nudgeMyLastReadSupportMessage = handlerWrapper(async (req, res) => {
  assertRole(req, ['admin', 'agent', 'client']);
  const { messageId } = req.body;
  assert(messageId, 400, `messageId is not specified.`);
  const userId = getUserIdFromReq(req);

  const lastReadEntity = new SupportUserLastAccess();
  lastReadEntity.userId = userId;

  await db.createQueryBuilder()
    .insert()
    .into(SupportUserLastAccess)
    .values({ ...lastReadEntity, lastAccessAt: () => `NOW()` })
    .orUpdate(['lastAccessAt'])
    .execute();

  res.json();
});

