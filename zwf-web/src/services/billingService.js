import { httpGet$, httpPost$ } from './http';

export function listMyInvoices$() {
  return httpGet$(`/subscription`);
}

export function getCurrentPeriod$() {
  return httpGet$(`/subscription/period/current`);
}

export function getSiblingPeriod$(periodId, direction) {
  return httpGet$(`/subscription/period/${periodId}/${direction}`);
}

export function getPeriodUsage$(periodId) {
  return httpGet$(`/subscription/period/${periodId}/usage`);
}

export function getOrgResurgingInfo$(code) {
  return httpGet$(`/subscription/resurge/${code}`);
}

export function resurgeOrg$(code, payload) {
  return httpPost$(`/subscription/resurge/${code}`, payload);
}

export const getInvoiceUrl = (invoiceFileId) => {
  console.error(`invoiceFileId is not specified`);
  return invoiceFileId ? `${process.env.REACT_APP_ZWF_API_DOMAIN_NAME}/blob/${invoiceFileId}` : null;
}