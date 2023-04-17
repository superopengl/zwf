import { getManager } from 'typeorm';
import { SystemConfig } from '../entity/Config';

export async function initializeConfig() {
  const noreply = new SystemConfig();
  noreply.key = 'email.sender.noreply';
  noreply.value = 'noreply@ziledin.com';

  const contacat = new SystemConfig();
  contacat.key = 'email.contact.recipient';
  contacat.value = 'contact@ziledin.com';

  const bcc = new SystemConfig();
  bcc.key = 'email.sender.bcc';
  bcc.value = 'admin@ziledin.com';

  const entities = [
    noreply,
    contacat,
    bcc
  ];

  await getManager()
    .createQueryBuilder()
    .insert()
    .into(SystemConfig)
    .values(entities)
    .orIgnore()
    .execute();
}
