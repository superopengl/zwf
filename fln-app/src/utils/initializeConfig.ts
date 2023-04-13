import { getManager } from 'typeorm';
import { SystemConfig } from '../entity/Config';

export async function initializeConfig() {
  const noreply = new SystemConfig();
  noreply.key = 'email.sender.noreply';
  noreply.value = 'noreply@filedin.com';

  const contacat = new SystemConfig();
  contacat.key = 'email.contact.recipient';
  contacat.value = 'contact@filedin.com';

  const bcc = new SystemConfig();
  bcc.key = 'email.sender.bcc';
  bcc.value = 'admin@filedin.com';

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
