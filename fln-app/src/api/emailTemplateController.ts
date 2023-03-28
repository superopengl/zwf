
import { getManager, getRepository } from 'typeorm';
import { assert, assertRole } from '../utils/assert';
import { handlerWrapper } from '../utils/asyncHandler';
import { EmailSignature } from '../entity/EmailSignature';
import { EmailTemplate } from '../entity/EmailTemplate';
import { getReqUser } from '../utils/getReqUser';
import { Org } from '../entity/Org';

export const listEmailTemplate = handlerWrapper(async (req, res) => {
  assertRole(req, 'admin');
  const user = getReqUser(req);
  const list = await getRepository(EmailTemplate).find({
    where: {
      orgId: user.orgId
    },
    order: {
      key: 'ASC',
      locale: 'ASC'
    }
  });
  res.json(list);
});


export const saveEmailTemplate = handlerWrapper(async (req, res) => {
  assertRole(req, 'admin');
  const { key, locale } = req.params;
  const { subject, body } = req.body;
  // await getRepository(EmailTemplate).update({ key, locale: locale as Locale }, { subject, body });

  const entity = new EmailTemplate();
  entity.key = key;
  entity.locale = 'en-US';
  entity.subject = subject;
  entity.body = body;

  await getManager()
    .createQueryBuilder()
    .insert()
    .into(EmailTemplate)
    .values(entity)
    .onConflict(`(key, locale) DO UPDATE SET subject = excluded.subject, body = excluded.body`)
    .execute();

  res.json();
});

