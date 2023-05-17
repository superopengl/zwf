import { getManager } from 'typeorm';
import { SubscriptionStatus } from '../types/SubscriptionStatus';
import { Payment } from '../entity/Payment';
import { PaymentStatus } from '../types/PaymentStatus';
import { getUtcNow } from './getUtcNow';
import { User } from '../entity/User';
import { Subscription } from '../entity/Subscription';
import * as moment from 'moment';

export async function commitSubscription(payment: Payment) {
  await getManager().transaction(async (m) => {
    payment.status = PaymentStatus.Paid;
    payment.paidAt = getUtcNow();

    const now = moment();

    const subscription = payment.subscription;
    subscription.start = now.toDate();
    subscription.status = SubscriptionStatus.Alive;
    const { orgId } = subscription;

    await m.update(Subscription, {
      orgId,
      status: SubscriptionStatus.Alive
    }, {
      end: now.toDate(),
      status: SubscriptionStatus.Terminated
    });

    await m.save(payment);

    await m.save(subscription);

    await m.getRepository(User).update({
      orgId,
    }, {
      paid: true
    });
  });
}

