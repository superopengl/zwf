import { SelectQueryBuilder } from 'typeorm';


export function existsQuery<T>(builder: SelectQueryBuilder<T>) {
  return `(exists (${builder.getQuery()}))`;
}

export function notExistsQuery<T>(builder: SelectQueryBuilder<T>) {
  return `(not exists (${builder.getQuery()}))`;
}