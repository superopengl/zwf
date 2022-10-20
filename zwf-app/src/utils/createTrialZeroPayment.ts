import { Org } from './../entity/Org';
import moment = require('moment');
import { Payment } from '../entity/Payment';


export function createTrialZeroPayment(org: Org) {
  const payment = new Payment();
  payment.orgId = org.id;
  payment.periodFrom = org.createdAt;
  payment.periodTo = moment(org.createdAt).add(14, 'days').toDate();
  payment.succeeded = true;
  payment.amount = 0;
  payment.payable = 0;
  return payment;
}
