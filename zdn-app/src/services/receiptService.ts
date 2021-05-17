import * as fs from 'fs';
import * as pdf from 'html-pdf';
import * as handlebars from 'handlebars';
import { Stream } from 'stream';
import * as moment from 'moment';
import { PaymentMethod } from '../types/PaymentMethod';
import * as _ from 'lodash';
import { SubscriptionType } from '../types/SubscriptionType';
import { assert } from '../utils/assert';
import { ReceiptInformation } from '../entity/views/ReceiptInformation';

const receiptTemplateHtml = fs.readFileSync(`${__dirname}/../_assets/receipt_template.html`);
const compiledTemplate = handlebars.compile(receiptTemplateHtml.toString());

async function generatePdfStream(html, options) {
  return new Promise<any>((res, rej) => {
    pdf.create(html, options).toStream((err, stream) => {
      if (err) return rej(err);
      res(stream);
    })
  })
}

function getPaymentMethodName(paymentMethod: PaymentMethod) {
  return _.capitalize(paymentMethod);
}

function getSubscriptionDescription(receipt: ReceiptInformation) {
  const type = receipt.subscriptionType;

  const subscriptionName = type === SubscriptionType.Montly ? 'Pro Member Monthly' :
    type === SubscriptionType.Yearly ? 'Pro Member Annually' :
      null;
  assert(subscriptionName, 400, `Unsupported subscription type for receipt ${type}`);

  const start = moment(receipt.start).format('D MMM YYYY');
  const end = moment(receipt.end).format('D MMM YYYY');

  return `${subscriptionName} (${start} - ${end})`;
}

function getVars(receipt: ReceiptInformation) {
  const subscriptionPrice = (+receipt.payable || 0) + (+receipt.deduction || 0);
  return {
    receiptNumber: receipt.receiptNumber,
    date: moment(receipt.paidAt).format('D MMM YYYY'),
    subscriptionDescription: getSubscriptionDescription(receipt),
    subscriptionPrice: subscriptionPrice.toFixed(2),
    creditDeduction: (+receipt.deduction || 0).toFixed(2),
    payableAmount: (+receipt.payable || 0).toFixed(2),
  };
}

export async function generateReceiptPdfStream(receipt: ReceiptInformation): Promise<{ pdfStream: Stream, fileName: string }> {
  const vars = getVars(receipt);
  const html = compiledTemplate(vars);
  const options = { format: 'A4' };

  const pdfStream = await generatePdfStream(html, options);
  const fileName = `Receipt_${vars.receiptNumber}.pdf`;

  return { pdfStream, fileName };
}