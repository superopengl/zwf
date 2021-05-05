
import { getManager, getRepository } from 'typeorm';
import { assert, assertRole } from '../utils/assert';
import { handlerWrapper } from '../utils/asyncHandler';
import { SystemEmailSignature } from '../entity/EmailSignature';
import { SystemEmailTemplate } from '../entity/EmailTemplate';
import { getReqUser } from '../utils/getReqUser';
import { Org } from '../entity/Org';
import { getOrgIdFromReq } from '../utils/getOrgIdFromReq';
import { OrgEmailTemplate } from '../entity/OrgEmailTemplate';

export const listEmailTemplate = handlerWrapper(async (req, res) => {
  assertRole(req, 'admin');
  const orgId = getOrgIdFromReq(req);

  const whereClause = orgId ? { where: { orgId }} : null;
  const list = await getRepository(orgId ? OrgEmailTemplate : SystemEmailTemplate).find({
    ...whereClause,
    order: {
      key: 'ASC',
      locale: 'ASC'
    }
  });
  res.json(list);
});


export const saveEmailTemplate = handlerWrapper(async (req, res) => {
  assertRole(req, 'admin');
  const orgId = getOrgIdFromReq(req);
  const { key, locale } = req.params;
  const { subject, body } = req.body;
  // await getRepository(EmailTemplate).update({ key, locale: locale as Locale }, { subject, body });

  const entity = new SystemEmailTemplate();
  entity.key = key;
  entity.locale = 'en-US';
  entity.subject = subject;
  entity.body = body;

  await getManager()
    .createQueryBuilder()
    .insert()
    .into(SystemEmailTemplate)
    .values(entity)
    .onConflict(`(${orgId ? `"orgId", ` :''} key, locale) DO UPDATE SET subject = excluded.subject, body = excluded.body`)
    .execute();

  res.json();
});

