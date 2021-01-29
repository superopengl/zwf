import { request } from './http';

export async function handleDownloadCsv() {
  return request('GET', `member/csv`, null, null, 'blob')
}


