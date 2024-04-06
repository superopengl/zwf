import { SupportUserUnreadInformation } from '../entity/views/SupportUserUnreadInformation';
import { getUtcNow } from './../utils/getUtcNow';
import { SupportUserLastAccess } from '../entity/SupportUserLastAccess';
import { SupportInformation } from '../entity/views/SupportInformation';
import { UserInformation } from '../entity/views/UserInformation';
import { getManager, getRepository, Not } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';

import { assert } from '../utils/assert';
import * as _ from 'lodash';
import { handlerWrapper } from '../utils/asyncHandler';
import { sendEmailImmediately } from '../services/emailService';
import * as delay from 'delay';
import { filter } from 'rxjs';
import { getEventChannel, publishEvent } from '../services/globalEventSubPubService';
import { Role } from '../types/Role';
import { assertTaskAccess } from '../utils/assertTaskAccess';
import { getRoleFromReq } from '../utils/getRoleFromReq';
import { getUserIdFromReq } from '../utils/getUserIdFromReq';
import { SupportMessage } from '../entity/SupportMessage';
import { assertRole } from '../utils/assertRole';

const CONTACT_EVENT_TYPE = 'contact'

export const getMySupport = handlerWrapper(async (req, res) => {
  assertRole(req, 'admin', 'agent', 'client');
  const userId = getUserIdFromReq(req);

  const list = await getRepository(SupportMessage).find({
    where: {
      userId
    },
    order: {
      createdAt: 'ASC'
    }
  });
  const unreadCountResult = await getRepository(SupportUserUnreadInformation).findOne(userId);
  const unreadCount = +unreadCountResult?.count ?? 0;

  const result = {
    list,
    unreadCount
  }

  res.json(result);
});

export const searchSupportList = handlerWrapper(async (req, res) => {
  assertRole(req, 'system');
  const userId = getUserIdFromReq(req);
  const { text, page, size, orderField, orderDirection, tags } = req.body;

  const pageNo = page || 1;
  const pageSize = size || 50;
  assert(pageNo >= 1 && pageSize > 0, 400, 'Invalid page and size parameter');

  let query = getRepository(SupportInformation)
    .createQueryBuilder()
    .where('"userId" != :userId', { userId });

  if (text) {
    query = query.andWhere('(email ILIKE :text OR "givenName" ILIKE :text OR "surname" ILIKE :text OR "orgName" ILIKE :text)', { text: `%${text}%` });
  }

  const count = await query.getCount();

  const data = await query //.orderBy(`"${orderField}"`, orderDirection)
    .offset((pageNo - 1) * pageSize)
    .limit(pageSize)
    .getMany();

  data.forEach(x => {
    x.unreadCount = +x.unreadCount;
  })

  const result = {
    count,
    page: pageNo,
    data
  };

  res.json(result);
});

export const getUserSupport = handlerWrapper(async (req, res) => {
  assertRole(req, 'system');
  const { userId } = req.params;

  const list = await getRepository(SupportMessage).find({
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
  assertRole(req, 'system', 'admin', 'agent', 'client');
  const { capturedUrl, message, replyToUserId } = req.body;
  assert(message, 404, `Invalid contact information`);
  const userId = getUserIdFromReq(req);
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

  await getManager().save(sm)

  publishEvent(CONTACT_EVENT_TYPE, {
    id: sm.id,
    userId: sm.userId,
    message,
    createdAt: sm.createdAt,
    by: sm.by,
  });

  res.json();
});

export const nudgeMyLastReadSupportMessage = handlerWrapper(async (req, res) => {
  assertRole(req, 'admin', 'agent', 'client');
  const { messageId } = req.body;
  assert(messageId, 400, `messageId is not specified.`);
  const userId = getUserIdFromReq(req);

  const lastReadEntity = new SupportUserLastAccess();
  lastReadEntity.userId = userId;

  await getManager().createQueryBuilder()
    .insert()
    .into(SupportUserLastAccess)
    .values(lastReadEntity)
    .onConflict(`("userId") DO UPDATE SET "lastAccessAt" = NOW()`)
    .execute();

  res.json();
});

export const subscribeSupportMessage = handlerWrapper(async (req, res) => {
  assertRole(req, 'system', 'admin', 'agent', 'client');
  const role = getRoleFromReq(req);
  const userId = getUserIdFromReq(req);
  const isSystem = role === Role.System;

  // const { user: { id: userId } } = req as any;
  const isProd = process.env.NODE_ENV === 'prod';
  if (!isProd) {
    res.setHeader('Access-Control-Allow-Origin', process.env.ZWF_WEB_DOMAIN_NAME);
  }
  res.sse();

  const channelSubscription$ = getEventChannel(CONTACT_EVENT_TYPE)
    .pipe(
      // System subscribe all contact events. Other users only subscribe themselves'
      filter(x => isSystem || x?.userId === userId)
    )
    .subscribe((event) => {
      res.write(`data: ${JSON.stringify(event)}\n\n`);
      (res as any).flush();
    });

  res.on('close', () => {
    channelSubscription$.unsubscribe();
    res.end();
  });
});
