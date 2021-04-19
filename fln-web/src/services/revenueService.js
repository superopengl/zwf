import { httpGet } from './http';

export async function getRevenueChartData(period) {
  return httpGet(`revenue`, { period });
}

