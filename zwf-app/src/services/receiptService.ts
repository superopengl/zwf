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
import { generatePdfStreamFromHtml } from '../utils/generatePdfStreamFromHtml';

const receiptTemplateHtml = fs.readFileSync(`${__dirname}/../_assets/receipt_template.html`);
const compiledTemplate = handlebars.compile(receiptTemplateHtml.toString());

function getPaymentMethodName(cardLast4: string) {
  return `Card ends with ${cardLast4}`;
}

function getSubscriptionDescription(receipt: ReceiptInformation) {
  const type = receipt.subscriptionType;

  const subscriptionName = type === SubscriptionType.Monthly ? 'Pro Member Monthly' :      null;
  assert(subscriptionName, 400, `Unsupported subscription type for receipt ${type}`);

  const start = moment(receipt.start).format('D MMM YYYY');
  const end = moment(receipt.end).format('D MMM YYYY');

  return `${subscriptionName} (${start} - ${end})`;
}

function getVarBag(receipt: ReceiptInformation): {[key:string]: any} {
  const subscriptionPrice = (+receipt.payable || 0) + (+receipt.deduction || 0);
  return {
    receiptNumber: receipt.receiptNumber,
    date: moment(receipt.paidAt).format('D MMM YYYY'),
    subscriptionDescription: getSubscriptionDescription(receipt),
    subscriptionPrice: subscriptionPrice.toFixed(2),
    creditDeduction: (+receipt.deduction || 0).toFixed(2),
    paymentMethod: getPaymentMethodName(receipt.cardLast4),
    payableAmount: (+receipt.payable || 0).toFixed(2),
  };
}

export async function generateReceiptPdfStream(receipt: ReceiptInformation): Promise<{ pdfStream: Stream, fileName: string }> {
  const varBag = getVarBag(receipt);
  const html = compiledTemplate(varBag);
  const options = { format: 'A4' };

  const pdfStream = await generatePdfStreamFromHtml(html, options);
  const fileName = `Receipt_${varBag.receiptNumber}.pdf`;

  return { pdfStream, fileName };
}