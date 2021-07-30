
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
  assertRole(req, 'system', 'admin');
  const orgId = getOrgIdFromReq(req);

  const whereClause = orgId ? { where: { orgId } } : null;
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
  assertRole(req, 'system', 'admin');
  const orgId = getOrgIdFromReq(req);
  const { key, locale } = req.params;
  const { subject, body } = req.body;

  if (orgId) {
    await getRepository(OrgEmailTemplate)
      .update({ key, locale: locale as Locale, orgId }, { subject, body });
  } else {
    await getRepository(SystemEmailTemplate)
      .update({ key, locale: locale as Locale }, { subject, body });
  }

  res.json();
});

