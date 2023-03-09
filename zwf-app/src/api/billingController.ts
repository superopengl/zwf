import { OrgSubscriptionPeriod } from './../entity/OrgSubscriptionPeriod';
import { LicenseTicketUsageInformation } from './../entity/views/LicenseTicketUsageInformation';
import { OrgBasicInformation } from './../entity/views/OrgBasicInformation';
import { getUtcNow } from './../utils/getUtcNow';
import { PaymentRollupInfo } from '../services/payment/PaymentRollupInfo';
import { assert } from '../utils/assert';
import { assertRole } from '../utils/assertRole';
import { handlerWrapper } from '../utils/asyncHandler';
import * as _ from 'lodash';
import { generateInvoicePdfStream } from '../services/invoiceService';
import { OrgSubscriptionPeriodHistoryInformation } from '../entity/views/OrgSubscriptionPeriodHistoryInformation';
import { getOrgIdFromReq } from '../utils/getOrgIdFromReq';
import { db } from '../db';
import { LessThan, MoreThan } from 'typeorm';
import { Org } from '../entity/Org';
import { checkoutSubscriptionPeriod } from '../utils/checkoutSubscriptionPeriod';
import { createNewPendingCheckoutSubscriptionPeriod } from '../utils/createNewPendingCheckoutSubscriptionPeriod';
import { calcBillingAmountForPeriod } from '../services/payment/calcBillingAmountForPeriod';
import { getStripeClientSecretForOrg } from '../services/stripeService';

async function getOrgPaymentHistory(orgId) {
  const list = db.getRepository(OrgSubscriptionPeriodHistoryInformation).find({
    where: {
      orgId
    },
    order: {
      periodFrom: 'ASC',
    },
  });

  return list;
}

export const getOrgResurgingInfo = handlerWrapper(async (req, res) => {
  assertRole(req, ['guest']);
  const { code } = req.params;
  assert(code, 400, 'Missing code');

  let result
  await db.manager.transaction(async m => {
    const org = await db.manager.findOneByOrFail(Org, { resurgingCode: code, suspended: true });
    const duePeriod = await m.getRepository(OrgSubscriptionPeriod)
      .createQueryBuilder()
      .where(`"orgId" = :orgId`, { orgId: org.id })
      .andWhere(`"paymentId" IS NULL`)
      .andWhere(`tail IS TRUE`)
      .andWhere('"periodTo"::date <= NOW()::date')
      .getOneOrFail();
    
    const billingInfo = await calcBillingAmountForPeriod(m, duePeriod);
    const clientSecret = await getStripeClientSecretForOrg(m, org.id);

    result = {
      orgName: org.name,
      period: duePeriod,
      billingInfo,
      clientSecret
    }
  })

  res.json(result);
});

export const resurgeOrg = handlerWrapper(async (req, res) => {
  assertRole(req, ['guest']);
  const { code } = req.params;
  assert(code, 400, 'Missing code');

  const org = await db.manager.findOneBy(Org, { resurgingCode: code, suspended: true });
  assert(org, 404);

  await db.manager.transaction(async m => {
    const duePeriod = await m.getRepository(OrgSubscriptionPeriod)
      .createQueryBuilder()
      .where(`"orgId" = :orgId`, { orgId: org.id })
      .andWhere(`"paymentId" IS NULL`)
      .andWhere(`tail IS TRUE`)
      .andWhere('"periodTo"::date <= NOW()::date')
      .getOneOrFail();
    const canRenew = await checkoutSubscriptionPeriod(m, duePeriod);
    if (canRenew) {
      await createNewPendingCheckoutSubscriptionPeriod(m, duePeriod);
    } else {
      throw new Error(`Failed to resurge the organization. Please contact customer support.`);
    }
  })

  res.json();
});

export const listMyInvoices = handlerWrapper(async (req, res) => {
  assertRole(req, ['admin']);
  const orgId = getOrgIdFromReq(req);

  const list = await getOrgPaymentHistory(orgId);

  res.json(list);
});

export const getCurrentPeriod = handlerWrapper(async (req, res) => {
  assertRole(req, ['admin']);
  const orgId = getOrgIdFromReq(req);

  const currentPeriod = await db.getRepository(OrgSubscriptionPeriod).findOne({
    where: {
      orgId,
      tail: true
    },
    relations: {
      payment: true,
    }
  });

  res.json(currentPeriod);
});

export const getSiblingPeriod = handlerWrapper(async (req, res) => {
  assertRole(req, ['admin']);
  const orgId = getOrgIdFromReq(req);
  const { periodId, direction } = req.params;

  const pivotPeriod = await db.getRepository(OrgSubscriptionPeriod).findOneOrFail({
    where: { orgId, id: periodId },
    select: { seq: true }
  });
  const { seq } = pivotPeriod;

  let siblingPeriod: OrgSubscriptionPeriod = null;
  if (direction === 'next') {
    siblingPeriod = await db.getRepository(OrgSubscriptionPeriod).findOne({
      where: {
        orgId,
        seq: MoreThan(seq)
      },
      order: {
        orgId: 'ASC',
        seq: 'ASC'
      },
      relations: {
        payment: true,
      }
    });
  } else if (direction === 'previous') {
    siblingPeriod = await db.getRepository(OrgSubscriptionPeriod).findOne({
      where: {
        orgId,
        seq: LessThan(seq)
      },
      order: {
        orgId: 'ASC',
        seq: 'DESC'
      },
      relations: {
        payment: true,
      }
    })
  } else {
    assert(false, 400, `Invalid direction '${direction}'`);
  }

  res.json(siblingPeriod);
});

export const getPeriodUsage = handlerWrapper(async (req, res) => {
  assertRole(req, ['admin']);
  const orgId = getOrgIdFromReq(req);

  const { periodId } = req.params;

  const list = await db.getRepository(LicenseTicketUsageInformation)
    .find({
      where: {
        orgId,
        periodId
      },
      select: {
        email: true,
        givenName: true,
        surname: true,
        usedDays: true,
        ticketDays: true,
        ticketFrom: true,
        ticketTo: true,
      }
    })

  res.json(list);
});

export const downloadInvoice = handlerWrapper(async (req, res) => {
  assertRole(req, ['admin']);
  const { paymentId } = req.params;
  const orgId = getOrgIdFromReq(req);

  const period = await db.getRepository(OrgSubscriptionPeriodHistoryInformation).findOneBy({ paymentId, orgId });
  assert(period, 404);

  const { pdfStream, fileName } = await generateInvoicePdfStream(period);

  res.set('Cache-Control', `public, max-age=36536000, immutable`);
  res.attachment(fileName);
  res.send(pdfStream);
  // pdfStream.pipe(res);
});


