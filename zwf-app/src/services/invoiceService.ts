import * as fs from 'fs';
import * as handlebars from 'handlebars';
import * as moment from 'moment';
import * as _ from 'lodash';
import { OrgSubscriptionPeriodHistoryInformation } from '../entity/views/OrgSubscriptionPeriodHistoryInformation';
import { generatePdfBufferFromHtml } from '../utils/generatePdfBufferFromHtml';

const invoiceTemplateHtml = fs.readFileSync(`${__dirname}/../_assets/invoice_template.html`);
const compiledTemplate = handlebars.compile(invoiceTemplateHtml.toString());

function getSubscriptionDescription(invoice: OrgSubscriptionPeriodHistoryInformation) {
  const start = moment(invoice.periodFrom).format('D MMM YYYY');
  const end = moment(invoice.periodTo).format('D MMM YYYY');

  return `ZeeWorkflow All-In-One Plan (${start} - ${end})`;
}

function getVarBag(invoice: OrgSubscriptionPeriodHistoryInformation): {[key: string]: any} {
  const payable = (+invoice.payable || 0);
  const gst = +((payable / 11).toFixed(2));
  const payableExcludingGst = payable - gst;
  return {
    invoiceNumber: invoice.invoiceNumber,
    date: moment(invoice.checkoutDate).format('D MMM YYYY'),
    subscriptionDescription: getSubscriptionDescription(invoice),
    planFullPrice: (+invoice.planFullPrice || 0).toFixed(2),
    periodDays: invoice.periodDays,
    promotionCode: invoice.promotionCode ?? '',
    promotionPlanPrice: invoice.promotionCode ? (+invoice.promotionPlanPrice || 0).toFixed(2) : '',
    payableDays: invoice.payableDays,
    payableMonths: (invoice.payableDays/invoice.periodDays).toFixed(2),
    cardLast4: invoice.cardLast4,
    payable: payable.toFixed(2),
    gst: gst.toFixed(2),
    payableExcludingGst: payableExcludingGst.toFixed(2),
  };
}

export async function generateInvoicePdfStream(invoice: OrgSubscriptionPeriodHistoryInformation): Promise<{ pdfStream, fileName: string }> {
  const varBag = getVarBag(invoice);
  const html = compiledTemplate(varBag);

  const pdfStream = await generatePdfBufferFromHtml(html);
  const fileName = `Invoice_${varBag.invoiceNumber}.pdf`;

  return { pdfStream, fileName };
}