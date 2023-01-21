
import { getManager, getRepository } from 'typeorm';
import { assert, assertRole } from '../utils/assert';
import { handlerWrapper } from '../utils/asyncHandler';
import { Locale } from '../types/Locale';
import { EmailSignature } from '../entity/EmailSignature';
import { EmailTemplate } from '../entity/EmailTemplate';

export const listEmailTemplate = handlerWrapper(async (req, res) => {
  assertRole(req, 'admin');
  const list = await getRepository(EmailTemplate).find({
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
  assert(locale === Locale.Engish || locale == Locale.ChineseTraditional || locale == Locale.ChineseSimple, 400, `Unsupported locale ${locale}`);
  const { subject, body } = req.body;
  // await getRepository(EmailTemplate).update({ key, locale: locale as Locale }, { subject, body });

  const entity = new EmailTemplate();
  entity.key = key;
  entity.locale = locale as Locale;
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

