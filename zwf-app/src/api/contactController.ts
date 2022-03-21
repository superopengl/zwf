import { UserContactInformation } from './../entity/views/UserContactInformation';
import { UserInformation } from './../entity/views/UserInformation';
import { getManager, getRepository } from 'typeorm';

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
import { Contact } from '../entity/Contact';
import { assertRole } from '../utils/assertRole';

const CONTACT_EVENT_TYPE = 'contact'

export const listContact = handlerWrapper(async (req, res) => {
  assertRole(req, 'system', 'admin', 'agent', 'client');
  const userId = getUserIdFromReq(req);
  const role = getRoleFromReq(req);

  let list: any;

  if (role === Role.System) {
    list = await getRepository(UserContactInformation).find();
  } else {
    list = await getRepository(Contact).find({
      where: {
        userId
      },
      order: {
        createdAt: 'ASC'
      }
    });
  }

  res.json(list);
});

export const listUserContact = handlerWrapper(async (req, res) => {
  assertRole(req, 'system');
  const { userId } = req.params;

  const list = await getRepository(Contact).find({
    where: {
      userId
    },
    order: {
      createdAt: 'ASC'
    }
  });

  res.json(list);
});

export const saveContact = handlerWrapper(async (req, res) => {
  assertRole(req, 'system', 'admin', 'agent', 'client');
  const { capturedUrl, message, replyToUserId } = req.body;
  assert(message, 404, `Invalid contact information`);
  const userId = getUserIdFromReq(req);
  const role = getRoleFromReq(req);

  const contact = new Contact();

  if (role === Role.System) {
    assert(replyToUserId, 400, 'replyToUserId is not specified');
    contact.userId = replyToUserId;
  } else {
    contact.userId = userId;
    contact.capturedUrl = capturedUrl;
  }
  contact.by = userId;
  contact.message = message;
  await getManager().save(contact);

  publishEvent(CONTACT_EVENT_TYPE, {
    userId: contact.userId,
    message,
    createdAt: contact.createdAt,
    by: contact.by,
  });

  res.json();
});

export const subscribeContact = handlerWrapper(async (req, res) => {
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
