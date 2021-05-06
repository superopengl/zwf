
import { getRepository, getManager } from 'typeorm';
import { assertRole } from '../utils/assert';
import { getOrgIdFromReq } from '../utils/getOrgIdFromReq';
import { Org } from '../entity/Org';
import { User } from '../entity/User';
import { v4 as uuidv4 } from 'uuid';
import { handlerWrapper } from '../utils/asyncHandler';
import { SystemEmailTemplate } from '../entity/SystemEmailTemplate';
import { OrgEmailTemplate } from '../entity/OrgEmailTemplate';
import { SystemEmailSignature } from '../entity/SystemEmailSignature';
import { OrgEmailSignature } from '../entity/OrgEmailSignature';

export const getMyOrgProfile = handlerWrapper(async (req, res) => {
  assertRole(req, 'admin');
  const { user: { id } } = req as any;
  const { orgId } = await getRepository(User).findOne(id);
  const org = orgId ? await getRepository(Org).findOne({ id: orgId }) : null;
  res.json(org);
});

export const saveMyOrgProfile = handlerWrapper(async (req, res) => {
  assertRole(req, 'admin');
  const { user: { id } } = req as any;
  const { name, domain, businessName, country, address, tel, abn } = req.body;
  const userEnitty = await getRepository(User).findOne(id);

  const isFirstSave = !userEnitty.orgId;

  const org = new Org();
  org.id = isFirstSave ? uuidv4() : userEnitty.orgId;
  org.name = name?.trim();
  org.domain = domain?.trim();
  org.businessName = businessName?.trim();
  org.country = country;
  org.address = address?.trim();
  org.tel = tel?.trim();
  org.abn = abn?.trim();

  const entities: any[] = [org];
  if (isFirstSave) {
    userEnitty.orgId = org.id;
    entities.push(userEnitty);
  }

  await getManager().transaction(async m => {
    
    // Copy email templates to org
    const systemEmailTemplates = await m.getRepository(SystemEmailTemplate).find({});
    const orgEmailTemplates = systemEmailTemplates.map(x => {
      const entity = new OrgEmailTemplate();
      Object.assign(entity, x);
      entity.id = uuidv4();
      entity.orgId = org.id;
      return entity;
    })

    // Copy email signatures to org
    const systemEmailSignatures = await m.getRepository(SystemEmailSignature).find({});
    const orgEmailSignatures = systemEmailSignatures.map(x => {
      const entity = new OrgEmailSignature();
      Object.assign(entity, x);
      entity.id = uuidv4();
      entity.orgId = org.id;
      return entity;
    })
    
    await m.save([...entities, ...orgEmailTemplates, ...orgEmailSignatures]);
  })

  res.json();
});
