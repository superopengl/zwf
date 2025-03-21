import { SYSTEM_EMAIL_NOREPLY, SYSTEM_EMAIL_INFO } from './constant';
import { db } from '../db';
import { SystemConfig } from '../entity/SystemConfig';

export async function initializeConfig() {
  const noreply = new SystemConfig();
  noreply.key = 'email.sender.noreply';
  noreply.value = SYSTEM_EMAIL_NOREPLY;

  const contacat = new SystemConfig();
  contacat.key = 'email.contact.recipient';
  contacat.value = 'info@zeeworkflow.com';

  const bcc = new SystemConfig();
  bcc.key = 'email.sender.bcc';
  bcc.value = SYSTEM_EMAIL_INFO;

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
