import { OrgSubscriptionPeriod } from "./../entity/OrgSubscriptionPeriod";
import { db } from './../db';
import { assertRole } from '../utils/assertRole';
import { getOrgIdFromReq } from '../utils/getOrgIdFromReq';
import { Org } from '../entity/Org';
import { User } from '../entity/User';
import { v4 as uuidv4 } from 'uuid';
import { handlerWrapper } from '../utils/asyncHandler';
import { OrgBasicInformation } from '../entity/views/OrgBasicInformation';
import { getUserIdFromReq } from '../utils/getUserIdFromReq';
import { assert } from '../utils/assert';
import { createNewTicketForUser } from '../utils/createNewTicketForUser';
import { getUtcNow } from '../utils/getUtcNow';
import { Payment } from '../entity/Payment';
import moment = require('moment');
import { getRoleFromReq } from "../utils/getRoleFromReq";
import { Role } from "../types/Role";
import { clearJwtCookie } from "../utils/jwt";
import { OrgTermination } from "../entity/OrgTermination";
import { OrgClient } from "../entity/OrgClient";
import { OrgPaymentMethod } from "../entity/OrgPaymentMethod";
import { OrgPromotionCode } from "../entity/OrgPromotionCode";
import { UserInformation } from "../entity/views/UserInformation";
import { UserProfile } from "../entity/UserProfile";
import { In } from "typeorm";
import { checkoutSubscriptionPeriod } from "../utils/checkoutSubscriptionPeriod";
import { getOrgAdminUsers } from "../../endpoints/helpers/getOrgAdminUsers";
import { enqueueEmailInBulk } from "../services/emailService";
import { EmailRequest } from "../types/EmailRequest";
import { EmailTemplateType } from "../types/EmailTemplateType";
import { getEmailRecipientName } from "../utils/getEmailRecipientName";
import { Tag } from "../entity/Tag";

const TRIAL_PERIOD_DAYS = 14;

export const getMyOrgProfile = handlerWrapper(async (req, res) => {
  const role = getRoleFromReq(req);
  const orgId = getOrgIdFromReq(req);
  let org: Org = null;
  if (orgId) {
    assertRole(req, ['admin']);
    org = await db.manager.findOneBy(Org, { id: orgId })
  } else {
    assert(role === Role.Admin, 403);
    // When user hasn't been onboard.
  }

  res.json(org);
});

export const setOrgClientTags = handlerWrapper(async (req, res) => {
  assertRole(req, [Role.Admin, Role.Agent]);
  const { id } = req.params;
  const orgId = getOrgIdFromReq(req);

  const { tags: tagIds } = req.body;
  const repo = db.getRepository(OrgClient);
  const orgClient = await repo.findOneBy({ id, orgId  });
  if (tagIds?.length) {
    orgClient.tags = await db.getRepository(Tag).find({
      where: {
        id: In(tagIds)
      }
    });
  } else {
    orgClient.tags = [];
  }
  await repo.save(orgClient);
  res.json();
});

export const listOrg = handlerWrapper(async (req, res) => {
  assertRole(req, ['system']);
  const { user: { id } } = req as any;
  const list = await db.getRepository(OrgBasicInformation).find({});
  res.json(list);
});

export const saveOrgProfile = handlerWrapper(async (req, res) => {
  assertRole(req, ['admin']);
  const orgId = getOrgIdFromReq(req);
  assert(orgId, 400, 'orgId not found');

  const orgInDb = await db.getRepository(Org).findOneBy({ id: orgId });

  const org = { ...orgInDb, ...req.body, orgId };

  await db.getRepository(Org).save(org);

  res.json();
});

export const createMyOrg = handlerWrapper(async (req, res) => {
  const role = getRoleFromReq(req);
  assert(role === Role.Admin, 403);

  const reqOrgId = getOrgIdFromReq(req);
  assert(!reqOrgId, 400, 'Cannot setup org again');

  const userId = getUserIdFromReq(req);
  const { name, businessName, country, address, tel, abn } = req.body;

  const orgId = uuidv4();
  const now = getUtcNow();

  const org = new Org();
  org.id = orgId;
  org.name = name?.trim();
  org.businessName = businessName?.trim();
  org.country = country;
  org.address = address?.trim();
  org.tel = tel?.trim();
  org.abn = abn?.trim();

  const period = new OrgSubscriptionPeriod()
  period.id = uuidv4();
  period.periodFrom = now;
  period.periodTo = moment(now).add(TRIAL_PERIOD_DAYS - 1, 'days').toDate();
  period.checkoutDate = now;
  period.orgId = orgId;
  period.type = 'trial';
  period.planFullPrice = 0;

  const ticket = createNewTicketForUser(userId, period);

  await db.transaction(async m => {
    const userEnitty = await m.findOneBy(User, { id: userId });

    assert(!userEnitty.orgId, 400, 'The org has been initialized');
    await m.save(org);
    userEnitty.orgId = orgId;
    userEnitty.orgOwner = true;

    await m.save([userEnitty, period, ticket]);
  });

  res.json();
});

export const terminateOrg = handlerWrapper(async (req, res) => {
  assertRole(req, ['admin']);

  const { user } = req as any;
  assert(user.orgOwner, 403, 'Not a org owner');
  const orgId = getOrgIdFromReq(req);

  const { reasons, feedback } = req.body;

  await db.transaction(async m => {
    const org = await m.findOneByOrFail(Org, { id: orgId });

    const termination = new OrgTermination();
    termination.orgId = orgId;
    termination.reasons = reasons;
    termination.feedback = feedback;

    await m.save(termination);

    const period = await m.findOneByOrFail(OrgSubscriptionPeriod, { orgId, tail: true });
    const isTrialPeriod = period.type === 'trial';
    if (!isTrialPeriod) {
      await checkoutSubscriptionPeriod(m, period, true);
    }

    const adminUsers = await getOrgAdminUsers(m, orgId);

    // Delete user profiles
    const userInfos = await m.find(UserInformation, {
      where: { orgId },
      select: {
        profileId: true,
      }
    })
    const profileIds = userInfos.map(u => u.profileId);

    await m.delete(UserProfile, { id: In(profileIds) });
    await m.softDelete(OrgClient, { orgId });
    await m.softDelete(OrgPaymentMethod, { orgId });
    await m.softDelete(OrgPromotionCode, { orgId });
    await m.softDelete(OrgSubscriptionPeriod, { orgId });
    await m.softDelete(User, { orgId });
    await m.softDelete(Org, { id: orgId });

    const emailRequests = adminUsers.map(user => {
      const ret: EmailRequest = {
        to: user.email,
        template: isTrialPeriod ? EmailTemplateType.SubscriptionTerminatedTrial : EmailTemplateType.SubscriptionTerminatedMonthly,
        shouldBcc: true,
        vars: {
          toWhom: getEmailRecipientName(user),
          org: org.name,
        }
      };
      return ret;
    });

    await enqueueEmailInBulk(m, emailRequests);
    // throw new Error('debug');
  });

  clearJwtCookie(res);

  res.json();
});