import * as fs from 'fs';
import * as handlebars from 'handlebars';
import * as moment from 'moment';
import * as _ from 'lodash';
import { OrgSubscriptionPeriodHistoryInformation } from '../entity/views/OrgSubscriptionPeriodHistoryInformation';
import { generatePdfBufferFromHtml } from '../utils/generatePdfBufferFromHtml';

const invoiceTemplateHtml = fs.readFileSync(`${__dirname}/../_assets/invoice_template.html`);
const compiledTemplate = handlebars.compile(invoiceTemplateHtml.toString());

function getPaymentMethodName(cardLast4: string) {
  return `Card ending with ${cardLast4}`;
}

function getSubscriptionDescription(invoice: OrgSubscriptionPeriodHistoryInformation) {
  const start = moment(invoice.periodFrom).format('D MMM YYYY');
  const end = moment(invoice.periodTo).format('D MMM YYYY');

  return `ZeeWorkflow Invoice (${start} - ${end})`;
}

function getVarBag(invoice: OrgSubscriptionPeriodHistoryInformation): {[key: string]: any} {
  const subscriptionPrice = +invoice.payable || 0;
  return {
    invoiceNumber: invoice.invoiceNumber,
    date: moment(invoice.checkoutDate).format('D MMM YYYY'),
    subscriptionDescription: getSubscriptionDescription(invoice),
    subscriptionPrice: subscriptionPrice.toFixed(2),
    paymentMethod: getPaymentMethodName(invoice.cardLast4),
    payableAmount: (+invoice.amount || 0).toFixed(2),
  };
}

export async function generateInvoicePdfStream(invoice: OrgSubscriptionPeriodHistoryInformation): Promise<{ pdfStream, fileName: string }> {
  const varBag = getVarBag(invoice);
  const html = compiledTemplate(varBag);

  const pdfStream = await generatePdfBufferFromHtml(html);
  const fileName = `Invoice_${varBag.invoiceNumber}.pdf`;

  return { pdfStream, fileName };
}