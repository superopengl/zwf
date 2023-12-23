import { SelectQueryBuilder } from 'typeorm';


export function notExistsQuery<T>(builder: SelectQueryBuilder<T>) {
  return `(not exists (${builder.getQuery()}))`;
}
