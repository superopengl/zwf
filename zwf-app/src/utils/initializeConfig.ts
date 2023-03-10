import { SYSTEM_EMAIL_SENDER, SYSTEM_EMAIL_BCC } from './constant';
import { db } from '../db';
import { SystemConfig } from '../entity/SystemConfig';

export async function initializeConfig() {
  const noreply = new SystemConfig();
  noreply.key = 'email.sender.noreply';
  noreply.value = SYSTEM_EMAIL_SENDER;

  const contacat = new SystemConfig();
  contacat.key = 'email.contact.recipient';
  contacat.value = 'contact@zeeworkflow.com';

  const bcc = new SystemConfig();
  bcc.key = 'email.sender.bcc';
  bcc.value = SYSTEM_EMAIL_BCC;

  const entities = [
    noreply,
    contacat,
    bcc
  ];

  await db.manager
    .createQueryBuilder()
    .insert()
    .into(SystemConfig)
    .values(entities)
    .orIgnore()
    .execute();
}
