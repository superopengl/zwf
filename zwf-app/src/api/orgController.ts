
import { getRepository, getManager } from 'typeorm';
import { assertRole } from "../utils/assertRole";
import { getOrgIdFromReq } from '../utils/getOrgIdFromReq';
import { Org } from '../entity/Org';
import { User } from '../entity/User';
import { v4 as uuidv4 } from 'uuid';
import { handlerWrapper } from '../utils/asyncHandler';
import { SystemEmailTemplate } from '../entity/SystemEmailTemplate';
import { OrgEmailTemplate } from '../entity/OrgEmailTemplate';
import { SystemEmailSignature } from '../entity/SystemEmailSignature';
import { OrgEmailSignature } from '../entity/OrgEmailSignature';
import { OrgBasicInformation } from '../entity/views/OrgBasicInformation';
import { createOrgTrialSubscription } from '../utils/createOrgTrialSubscription';
import * as moment from 'moment';
import { Subscription } from '../entity/Subscription';
import { SubscriptionStatus } from '../types/SubscriptionStatus';
import { SubscriptionType } from '../types/SubscriptionType';
import { getUserIdFromReq } from '../utils/getUserIdFromReq';
import { assert } from '../utils/assert';

export const getMyOrgProfile = handlerWrapper(async (req, res) => {
  assertRole(req, 'admin');
  const { user: { id } } = req as any;
  const { orgId } = await getRepository(User).findOne(id);
  const org = orgId ? await getRepository(Org).findOne({ id: orgId }) : null;
  res.json(org);
});

export const listOrg = handlerWrapper(async (req, res) => {
  assertRole(req, 'system');
  const { user: { id } } = req as any;
  const list = await getRepository(OrgBasicInformation).find({});
  res.json(list);
});

export const saveOrgProfile = handlerWrapper(async (req, res) => {
  assertRole(req, 'admin');
  const userId = getUserIdFromReq(req);
  const orgId = getOrgIdFromReq(req);

  const org = await getRepository(Org).findOne(orgId);
  assert(org, 404);

  Object.assign(org, req.body);

  await getManager().save(org);

  res.json();
})

export const createMyOrg = handlerWrapper(async (req, res) => {
  assertRole(req, 'admin');
  const userId = getUserIdFromReq(req);
  const { name, domain, businessName, country, address, tel, abn } = req.body;
  const userEnitty = await getRepository(User).findOne(userId);

  const isFirstSave = !userEnitty.orgId;

  const org = new Org();
  const orgId = isFirstSave ? uuidv4() : userEnitty.orgId;
  org.id = orgId;
  org.name = name?.trim();
  org.domain = domain?.trim();
  org.businessName = businessName?.trim();
  org.country = country;
  org.address = address?.trim();
  org.tel = tel?.trim();
  org.abn = abn?.trim();

  await getManager().transaction(async m => {
    
    if (isFirstSave) {
      userEnitty.orgId = orgId;
      userEnitty.orgOwner = true;
      userEnitty.paid = false;
      await m.save(userEnitty);
    }
    // Copy email templates to org
    const systemEmailTemplates = await m.getRepository(SystemEmailTemplate).find({});
    const orgEmailTemplates = systemEmailTemplates.map(x => {
      const emailTemplateEntity = new OrgEmailTemplate();
      Object.assign(emailTemplateEntity, x);
      emailTemplateEntity.id = uuidv4();
      emailTemplateEntity.orgId = orgId;
      return emailTemplateEntity;
    })

    // Copy email signatures to org
    const systemEmailSignatures = await m.getRepository(SystemEmailSignature).find({});
    const orgEmailSignatures = systemEmailSignatures.map(x => {
      const orgEmailSignatureEntity = new OrgEmailSignature();
      Object.assign(orgEmailSignatureEntity, x);
      orgEmailSignatureEntity.id = uuidv4();
      orgEmailSignatureEntity.orgId = orgId;
      return orgEmailSignatureEntity;
    })

    await m.save([org, ...orgEmailTemplates, ...orgEmailSignatures]);
    await createOrgTrialSubscription(m, orgId);
  })

  res.json();
});
