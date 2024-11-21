import * as fs from 'fs';
import * as handlebars from 'handlebars';
import * as moment from 'moment';
import * as _ from 'lodash';
import { OrgSubscriptionPeriodHistoryInformation } from '../entity/views/OrgSubscriptionPeriodHistoryInformation';
import { generatePdfBufferFromHtml } from '../utils/generatePdfBufferFromHtml';

const receiptTemplateHtml = fs.readFileSync(`${__dirname}/../_assets/receipt_template.html`);
const compiledTemplate = handlebars.compile(receiptTemplateHtml.toString());

function getPaymentMethodName(cardLast4: string) {
  return `Card ending with ${cardLast4}`;
}

function getSubscriptionDescription(receipt: OrgSubscriptionPeriodHistoryInformation) {
  const start = moment(receipt.periodFrom).format('D MMM YYYY');
  const end = moment(receipt.periodTo).format('D MMM YYYY');

  return `ZeeWorkflow Invoice (${start} - ${end})`;
}

function getVarBag(receipt: OrgSubscriptionPeriodHistoryInformation): {[key: string]: any} {
  const subscriptionPrice = +receipt.payable || 0;
  return {
    receiptNumber: receipt.receiptNumber,
    date: moment(receipt.issuedAt).format('D MMM YYYY'),
    subscriptionDescription: getSubscriptionDescription(receipt),
    subscriptionPrice: subscriptionPrice.toFixed(2),
    paymentMethod: getPaymentMethodName(receipt.cardLast4),
    payableAmount: (+receipt.amount || 0).toFixed(2),
  };
}

export async function generateReceiptPdfStream(receipt: OrgSubscriptionPeriodHistoryInformation): Promise<{ pdfStream, fileName: string }> {
  const varBag = getVarBag(receipt);
  const html = compiledTemplate(varBag);

  const pdfStream = await generatePdfBufferFromHtml(html);
  const fileName = `Receipt_${varBag.receiptNumber}.pdf`;

  return { pdfStream, fileName };
}