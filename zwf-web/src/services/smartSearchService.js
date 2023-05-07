import { httpPost$ } from './http';
import { EMPTY } from 'rxjs';

export function smartSearchTask$(searchText) {
  const text = searchText?.trim();
  return text ? httpPost$(`smart_search/task`, { text }) : EMPTY;
}

export function smartSearchFemplate$(searchText) {
  const text = searchText?.trim();
  return text ? httpPost$(`smart_search/femplate`, { text }) : EMPTY;
}

export function smartSearchDocTemplate$(searchText) {
  const text = searchText?.trim();
  return text ? httpPost$(`smart_search/demplate`, { text }) : EMPTY;
}


export function smartSearchClient$(searchText) {
  const text = searchText?.trim();
  return text ? httpPost$(`smart_search/client`, { text }) : EMPTY;
}
