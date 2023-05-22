import { OrgClientStatInformation } from './../entity/views/OrgClientStatInformation';
import { getRepository } from 'typeorm';
import { assert } from './assert';
import { OrgClientInformation } from '../entity/views/OrgClientInformation';
import { db } from '../db';

export type SearchOrgClientParams = {
  text?: string;
  page: number;
  size: number;
  orderField: string;
  orderDirection: 'ASC' | 'DESC';
  tags: string[];
  showDeactive?: boolean;
};

export async function searchOrgClients(orgId: string, queryInfo: SearchOrgClientParams) {
  const { text, page, size, orderField, orderDirection, tags, showDeactive } = queryInfo;

  const pageNo = page || 1;
  const pageSize = size || 50;
  assert(pageNo >= 1 && pageSize > 0, 400, 'Invalid page and size parameter');

  let query = db.getRepository(OrgClientStatInformation)
    .createQueryBuilder()
    .where('"orgId" = :orgId', { orgId })

  if (text) {
    query = query.andWhere('("clientAlias" ILIKE :text OR email ILIKE :text OR "givenName" ILIKE :text OR "surname" ILIKE :text)', { text: `%${text}%` });
  }

  if (tags?.length) {
    query = query.andWhere('(tags && array[:...tags]::uuid[]) IS TRUE', { tags });
  }

  if (!showDeactive) {
    query = query.andWhere('active IS TRUE');
  }

  const count = await query.getCount();

  const data = await query.orderBy(orderField, orderDirection)
    // .addOrderBy('email', 'ASC')
    .offset((pageNo - 1) * pageSize)
    .limit(pageSize)
    .getMany();

  return {
    count,
    page: pageNo,
    data
  };
}
