import { from, tap } from 'rxjs';
import { httpGet$, httpPost$, request } from './http';

export function downloadInvoice$(paymentId) {
  if (!paymentId) {
    throw new Error('paymentId is null');
  }
  const path = `/subscription/invoice/${paymentId}`;
  return from(request('GET', path, null, null, 'blob'))
    .pipe(
      tap(data => {
        const fileUrl = URL.createObjectURL(data);
        window.open(fileUrl);
      })
    );
}

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