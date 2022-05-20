import { SystemEmailTemplate } from "../entity/SystemEmailTemplate";
import { getManager } from 'typeorm';
import { EmailTemplateType } from "../types/EmailTemplateType";
import { Locale } from '../types/Locale';
import { defaultEmailTemplateDef } from './defaultEmailTemplateDef';

export async function initializeEmailTemplates() {
  const entities = Object.entries(defaultEmailTemplateDef).map(([key, def]) => {
    const entity = new SystemEmailTemplate();
    entity.key = key;
    entity.locale = Locale.Engish;
    entity.subject = def.subject;
    entity.body = def.body;
    entity.vars = def.vars;
    return entity;
  });

  await AppDataSource.manager
    .createQueryBuilder()
    .insert()
    .into(SystemEmailTemplate)
    .values(entities)
    .orIgnore()
    .execute();
}
