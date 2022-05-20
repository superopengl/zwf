import { AppDataSource } from './../db';
import { OrgEmailTemplateInformation } from './../entity/views/OrgEmailTemplateInformation';

import { getManager, getRepository } from 'typeorm';
import { assert } from '../utils/assert';
import { assertRole } from "../utils/assertRole";
import { handlerWrapper } from '../utils/asyncHandler';
import { SystemEmailSignature } from '../entity/SystemEmailSignature';
import { SystemEmailTemplate } from '../entity/SystemEmailTemplate';
import { getReqUser } from '../utils/getReqUser';
import { Org } from '../entity/Org';
import { getOrgIdFromReq } from '../utils/getOrgIdFromReq';
import { OrgEmailTemplate } from '../entity/OrgEmailTemplate';
import { Locale } from '../types/Locale';

export const listEmailTemplate = handlerWrapper(async (req, res) => {
  assertRole(req, 'system');
  const orgId = getOrgIdFromReq(req);

  const list = await AppDataSource.getRepository(SystemEmailTemplate).find({order: {
      key: 'ASC',
      locale: 'ASC'
    }});

  res.json(list);
});


export const saveEmailTemplate = handlerWrapper(async (req, res) => {
  assertRole(req, 'system');
  const orgId = getOrgIdFromReq(req);
  const { key, locale } = req.params;
  const { subject, body } = req.body;

  if (orgId) {
    const entity = new OrgEmailTemplate();
    entity.orgId = orgId;
    entity.key = key;
    entity.locale = locale;
    entity.subject = subject;
    entity.body = body;
    await AppDataSource
      .createQueryBuilder()
      .insert()
      .into(OrgEmailTemplate)
      .values(entity)
      .onConflict(`("orgId", key, locale) DO UPDATE SET subject = excluded.subject, body = excluded.body`)
      .execute();
  } else {
    await AppDataSource.getRepository(SystemEmailTemplate)
      .update({ key, locale: locale as Locale }, { subject, body });
  }

  res.json();
});

