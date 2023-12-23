import { SelectQueryBuilder } from 'typeorm';


export function existsQuery<T>(builder: SelectQueryBuilder<T>) {
  return `(exists (${builder.getQuery()}))`;
}

