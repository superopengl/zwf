
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
  const list = await getManager() //getRepository(EmailTemplate)
    .createQueryBuilder()
    .from(q => q
      .from(EmailTemplate, 's')
      .innerJoin(q => q.from(Org, 'g'), 'g', `s."orgId" = g.id`)
      .where(`g.name = :name`, { name: 'System' }),
      'default')

    .where(`"orgId" = :id`, { id: user.org.id })
    .
  
  .find({
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

