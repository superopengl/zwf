import { SupportUserUnreadInformation } from './../entity/views/SupportUnreadInformation';
import { getUtcNow } from './../utils/getUtcNow';
import { SupportLastRead } from './../entity/SupportLastRead';
import { SupportInformation } from '../entity/views/SupportInformation';
import { UserInformation } from '../entity/views/UserInformation';
import { getManager, getRepository } from 'typeorm';
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

export const listAllSupport = handlerWrapper(async (req, res) => {
  assertRole(req, 'system');
  const list = await getRepository(SupportInformation).find();
  list.forEach(x => {
    x.unreadCount = +x.unreadCount;
  })
  res.json(list);
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

  const supportEntity = new SupportMessage();
  const lastReadEntity = new SupportLastRead();

  supportEntity.id = uuidv4();
  supportEntity.by = userId;
  supportEntity.message = message;

  if (role === Role.System) {
    assert(replyToUserId, 400, 'replyToUserId is not specified');
    supportEntity.userId = replyToUserId;
    lastReadEntity.supporterLastReadMessageId = supportEntity.id;
  } else {
    supportEntity.userId = userId;
    supportEntity.capturedUrl = capturedUrl;
    lastReadEntity.userLastReadMessageId = supportEntity.id;
  }

  lastReadEntity.userId = supportEntity.userId;

  await getManager().save([supportEntity, lastReadEntity])

  publishEvent(CONTACT_EVENT_TYPE, {
    id: supportEntity.id,
    userId: supportEntity.userId,
    message,
    createdAt: supportEntity.createdAt,
    by: supportEntity.by,
  });

  res.json();
});

export const nudgeMyLastReadSupportMessage = handlerWrapper(async (req, res) => {
  assertRole(req, 'admin', 'agent', 'client');
  const { messageId } = req.body;
  assert(messageId, 400, `messageId is not specified.`);
  const userId = getUserIdFromReq(req);

  const lastReadEntity = new SupportLastRead();

  lastReadEntity.userId = userId;
  lastReadEntity.userLastReadMessageId = messageId;

  await getManager().save(lastReadEntity)

  res.json();
});

export const nudgeUserLastReadBySupporter = handlerWrapper(async (req, res) => {
  assertRole(req, 'system');
  const {userId} = req.params;
  const { messageId } = req.body;
  assert(messageId, 400, `messageId is not specified.`);

  const lastReadEntity = new SupportLastRead();

  lastReadEntity.userId = userId;
  lastReadEntity.supporterLastReadMessageId = messageId;

  await getManager().save(lastReadEntity)

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
