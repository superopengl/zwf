import { db } from './../db';
import { SupportInformation } from '../entity/views/SupportInformation';
import { v4 as uuidv4 } from 'uuid';

import { assert } from '../utils/assert';
import * as _ from 'lodash';
import { handlerWrapper } from '../utils/asyncHandler';
import { publishZevent } from '../services/zeventSubPubService';
import { Role } from '../types/Role';
import { getRoleFromReq } from '../utils/getRoleFromReq';
import { getUserIdFromReq } from '../utils/getUserIdFromReq';
import { SupportMessage } from '../entity/SupportMessage';
import { assertRole } from '../utils/assertRole';
import { emitTaskEvent } from '../utils/emitTaskEvent';
import { ZeventName } from '../types/ZeventName';
import { IsNull } from 'typeorm';

export const listMySupportMessages = handlerWrapper(async (req, res) => {
  assertRole(req, [Role.Client, Role.Agent, Role.Admin], true);
  const userId = getUserIdFromReq(req);
  assert(userId, 404);

  let list: SupportMessage[];
  await db.transaction(async m => {
    list = await m.getRepository(SupportMessage).find({
      where: {
        userId
      },
      order: {
        createdAt: 'ASC'
      }
    });
  });

  res.json(list);
});

export const searchSupportList = handlerWrapper(async (req, res) => {
  assertRole(req, [Role.System]);
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
    .orderBy('"unreadCount"', 'DESC')
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

  await db.transaction(async m => {
    await m.save(sm);

    publishZevent({
      type: 'support',
      userId: sm.userId,
      payload: sm,
    });
  });

  res.json();
});

export const nudgeMyLastReadSupportMessage = handlerWrapper(async (req, res) => {
  assertRole(req, ['admin', 'agent', 'client']);
  const userId = getUserIdFromReq(req);

  await db.manager.update(SupportMessage, {
    userId,
    userLastSeenAt: IsNull()
  }, {
    userLastSeenAt: () => `NOW()`,
  });

  res.json();
});

