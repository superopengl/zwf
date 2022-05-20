import { getManager } from 'typeorm';
import { SystemConfig } from '../entity/SystemConfig';

export async function initializeConfig() {
  const noreply = new SystemConfig();
  noreply.key = 'email.sender.noreply';
  noreply.value = 'noreply@zeeworkflow.com';

  const contacat = new SystemConfig();
  contacat.key = 'email.contact.recipient';
  contacat.value = 'contact@zeeworkflow.com';

  const bcc = new SystemConfig();
  bcc.key = 'email.sender.bcc';
  bcc.value = 'noreply@zeeworkflow.com';

  const entities = [
    noreply,
    contacat,
    bcc
  ];

  await AppDataSource.manager
    .createQueryBuilder()
    .insert()
    .into(SystemConfig)
    .values(entities)
    .orIgnore()
    .execute();
}
