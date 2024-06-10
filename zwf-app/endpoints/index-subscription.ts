import { UserAliveSubscriptionInformation } from './../src/entity/views/UserAliveSubscriptionInformation';
import { AppDataSource } from './../src/db';
import { SubscriptionEndingNotificationEmailInformation } from './../src/entity/views/SubscriptionEndingNotificationEmailInformation';
import { In, IsNull, Between, EntityManager } from 'typeorm';
import { Subscription } from '../src/entity/Subscription';
import { SubscriptionStatus } from '../src/types/SubscriptionStatus';
import { SubscriptionType } from '../src/types/SubscriptionType';
import { Payment } from '../src/entity/Payment';
import { User } from '../src/entity/User';
import { PaymentStatus } from '../src/types/PaymentStatus';
import * as moment from 'moment';
import { Role } from '../src/types/Role';
import { start } from './jobStarter';
import { enqueueEmailInBulk } from '../src/services/emailService';
import { EmailTemplateType } from '../src/types/EmailTemplateType';
import { EmailRequest } from '../src/types/EmailRequest';
import { getEmailRecipientName, getEmailRecipientNameByNames } from '../src/utils/getEmailRecipientName';
import { SysLog } from '../src/entity/SysLog';
import { assert } from '../src/utils/assert';
import { chargeStripeForCardPayment, getOrgStripeCustomerId } from '../src/services/stripeService';
import { getUtcNow } from '../src/utils/getUtcNow';
import { OrgAliveSubscription } from '../src/entity/views/OrgAliveSubscription';
import { v4 as uuidv4 } from 'uuid';
import { calcNewSubscriptionPaymentInfo } from '../src/utils/calcNewSubscriptionPaymentInfo';
import { CreditTransaction } from '../src/entity/CreditTransaction';
import { UserInformation } from '../src/entity/views/UserInformation';
import * as _ from 'lodash';

const JOB_NAME = 'daily-subscription';

async function getOrgAdminUsers(orgId: string) {
  const users = await AppDataSource.getRepository(UserInformation).find({
    where: {
      orgId,
      role: Role.Admin,
    },
    select: {
      email: true,
      givenName: true,
      surname: true,
    }
  });
  return users;
}

async function enqueueRecurringSucceededEmail(m: EntityManager, activeSubscription: OrgAliveSubscription, payment: Payment) {
  const { orgId, subscriptionId } = activeSubscription;
  const adminUsers = await getOrgAdminUsers(orgId);
  const emailRequests = adminUsers.map(user => {
    const req: EmailRequest = {
      to: user.email,
      template: EmailTemplateType.SubscriptionAutoRenewSuccessful,
      shouldBcc: true,
      vars: {
        toWhom: getEmailRecipientName(user),
        subscriptionId: subscriptionId,
        endDate: moment(payment.end).format('D MMM YYYY'),
      }
    };
    return req;
  });

  await enqueueEmailInBulk(m, emailRequests);
}

async function enqueueRecurringFailedEmail(m: EntityManager, activeSubscription: OrgAliveSubscription) {
  const { orgId, subscriptionId, end } = activeSubscription;
  const adminUsers = await getOrgAdminUsers(orgId);
  const emailRequests = adminUsers.map(user => {
    const req: EmailRequest = {
      to: user.email,
      template: EmailTemplateType.SubscriptionAutoRenewFailed,
      shouldBcc: true,
      vars: {
        toWhom: getEmailRecipientName(user),
        subscriptionId: subscriptionId,
        endDate: moment(end).format('D MMM YYYY')
      }
    };
    return req;
  });

  await enqueueEmailInBulk(m, emailRequests);
}

async function expireSubscriptions() {
  await AppDataSource.transaction(async m => {
    const list = await m.getRepository(UserAliveSubscriptionInformation)
      .createQueryBuilder()
      .where('"end" < CURRENT_DATE')
      .getMany();

    if (list.length) {
      // Set subscriptions to be expired
      const subscriptionIds = _.uniq(list.map(x => x.subscriptionId));
      await m.update(Subscription,
        {
          id: In(subscriptionIds),
        }, {
        status: SubscriptionStatus.Expired
      });

      // Set user to be unpaid users
      const userIds = list.map(x => x.userId);
      await m.update(User, { id: In(userIds) }, { paid: false });
      console.log(`Expired subscriptions for user ${subscriptionIds.join(', ')}`);

      // Compose email requests
      const emailRequests = list.map(x => {
        const emailRequest: EmailRequest = {
          to: x.email,
          template: EmailTemplateType.SubscriptionExpired,
          shouldBcc: true,
          vars: {
            toWhom: getEmailRecipientNameByNames(x.givenName, x.surname),
            subscriptionId: x.subscriptionId,
            endDate: moment(x.end).format('D MMM YYYY')
          }
        };
        return emailRequest;
      });

      // Enqueue email notifications
      await enqueueEmailInBulk(m, emailRequests);
    }
  });
}


async function sendEndingNotificationEmails() {
  await AppDataSource.transaction(async m => {

    const list = await m.findBy(SubscriptionEndingNotificationEmailInformation, {
      sentAt: IsNull(),
      daysBeforeEnd: Between(1, 7)
    });

    // Compose email requests
    const emailRequests = list.map(x => {
      const emailRequest: EmailRequest = {
        to: x.email,
        template: x.type === SubscriptionType.Trial ? EmailTemplateType.SubscriptionTrialExpiring : EmailTemplateType.SubscriptionAutoRenewing,
        shouldBcc: true,
        vars: {
          toWhom: getEmailRecipientNameByNames(x.givenName, x.surname),
          subscriptionId: x.subscriptionId,
          start: moment(x.start).format('D MMM YYYY'),
          end: moment(x.end).format('D MMM YYYY'),
        }
      };
      return emailRequest;
    });

    // Enqueue email notifications
    await enqueueEmailInBulk(m, emailRequests);
  });
}

async function getLastValidPaymentMethod(m: EntityManager, subscription: Subscription): Promise<Payment> {
  // TODO: Call API to pay by card
  const lastPaidPayment = await AppDataSource
    .getRepository(Payment)
    .findOne({
      where: {
        subscriptionId: subscription.id,
        status: PaymentStatus.Paid,
      },
      order: {
        paidAt: 'DESC'
      }
    });

  assert(lastPaidPayment, 500, `Cannot get last payment information  for subscription ${subscription.id}`);

  return lastPaidPayment;
}

async function renewRecurringSubscription(targetSubscription: OrgAliveSubscription) {
  const { subscriptionId, end } = targetSubscription;

  try {
    await AppDataSource.transaction(async m => {
      const subscription = await m.findOne(Subscription, {
        where: {
          id: subscriptionId,
          recurring: true,
        }
      });
      const { orgId } = subscription;

      const { promotionCode } = await getLastValidPaymentMethod(m, subscription);
      const paymentInfo = await calcNewSubscriptionPaymentInfo(
        m,
        orgId,
        null,
        promotionCode
      );

      const {
        creditBalance,
        deduction,
        payable,
        paymentMethodId,
        stripePaymentMethodId
      } = paymentInfo;

      const stripeCustomerId = await getOrgStripeCustomerId(m, orgId);
      const stripeRawResponse = await chargeStripeForCardPayment(payable, stripeCustomerId, stripePaymentMethodId, false);

      // Extend one month for current subscription
      const oldEnd = subscription.end;
      const newEnd = moment(oldEnd).add(1, 'month').add(-1, 'day').toDate();
      subscription.end = newEnd;

      // Pay with credit as possible
      let deductCreditTransaction = null;
      if (creditBalance > 0) {
        deductCreditTransaction = new CreditTransaction();
        deductCreditTransaction.orgId = orgId;
        deductCreditTransaction.amount = Math.abs(deduction) * -1;
        deductCreditTransaction.type = 'deduct';
        await m.save(deductCreditTransaction);
      }

      // Create payment entity
      const payment = new Payment();
      payment.id = uuidv4();
      payment.orgId = orgId;
      payment.start = oldEnd;
      payment.end = newEnd;
      payment.rawResponse = stripeRawResponse;
      payment.paidAt = getUtcNow();
      payment.amount = payable;
      payment.status = PaymentStatus.Paid;
      payment.auto = false;
      payment.orgPaymentMethodId = paymentMethodId;
      payment.creditTransaction = deductCreditTransaction;
      payment.promotionCode = promotionCode;
      payment.subscription = subscription;

      await m.save([payment, subscription]);

      console.log(`Renewed subscription ${subscription.id} for org ${orgId} at $${payment.amount} from ${payment.start} to ${payment.end}`);
      await enqueueRecurringSucceededEmail(m, targetSubscription, payment);
    });
  } catch (e) {
    await enqueueRecurringFailedEmail(AppDataSource.manager, targetSubscription);

    const sysLog = new SysLog();
    sysLog.level = 'autopay_falied';
    sysLog.message = 'Recurring auto pay failed';
    sysLog.req = targetSubscription;
    await AppDataSource.getRepository(SysLog).insert(sysLog);
  }
}

async function handleRecurringPayments() {
  const list = await AppDataSource.getRepository(OrgAliveSubscription)
    .createQueryBuilder()
    .where({ recurring: true })
    .andWhere('"end" <= CURRENT_DATE')
    .getMany();

  for (const item of list) {
    await renewRecurringSubscription(item);
  }
}

start(JOB_NAME, async () => {
  console.log('Starting recurring payments');
  await handleRecurringPayments();
  console.log('Finished recurring payments');

  console.log('Starting sending notification emails for renewing/expiring subscriptions');
  await sendEndingNotificationEmails();
  console.log('Finished sending notification emails for renewing/expiring subscriptions');

  console.log('Starting expiring subscriptions');
  await expireSubscriptions();
  console.log('Finished expiring subscriptions');
}, { daemon: false });