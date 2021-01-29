import { httpGet, httpPost, httpDelete } from './http';
import _ from 'lodash';

export async function getBusiness(id) {
  return httpGet(`business/${id}`);
}

export async function saveBusiness(gallery) {
  return httpPost('business', gallery);
}

export async function deleteBusiness(id) {
  return httpDelete(`business/${id}`);
}

export async function listBusiness(group = null) {
  const list = await httpGet('business', { group });
  const orderDef = {
    'top': 0,
    'new': 1,
    'restaurant': 2,
    'life': 3,
    'auto': 4
  };
  return _.orderBy(list, [x => orderDef[x.group]]);
}