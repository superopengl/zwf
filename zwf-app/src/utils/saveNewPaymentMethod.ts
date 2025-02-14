import { EntityManager } from 'typeorm';
import { db } from '../db';
import { OrgPaymentMethod } from '../entity/OrgPaymentMethod';
import { retrieveStripePaymentMethod as retrieveStripePaymentMethod } from '../services/stripeService';
import * as moment from 'moment';

export async function saveNewPaymentMethod(m: EntityManager, orgId: string, stripePaymentMethodId: any, forcePrimary: boolean) {
  const paymentMethod = await retrieveStripePaymentMethod(stripePaymentMethodId);

  const entity = new OrgPaymentMethod();
  entity.orgId = orgId;
  entity.stripePaymentMethodId = stripePaymentMethodId;
  entity.cardBrand = paymentMethod.card.brand;
  entity.cardExpiry = moment(`${paymentMethod.card.exp_month}/${paymentMethod.card.exp_year}`, 'M/YYYY').format('MM/YY');
  entity.cardLast4 = paymentMethod.card.last4;

  let hasPrimary = false;
  if (forcePrimary) {
    await m.update(OrgPaymentMethod, { orgId, primary: true }, { primary: false });
  } else {
    hasPrimary = !!(await m.getRepository(OrgPaymentMethod).findOneBy({ orgId, primary: true }));
  }

  entity.primary = !hasPrimary;
  await m.createQueryBuilder()
    .insert()
    .into(OrgPaymentMethod)
    .values(entity)
    .orUpdate(['primary'], ['orgId', 'cardHash'])
    .execute();
}
