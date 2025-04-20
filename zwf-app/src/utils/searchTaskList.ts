import { db } from '../db';
import { TaskInformation } from '../entity/views/TaskInformation';
import { Role } from '../types/Role';
import { TaskTagsTag } from '../entity/TaskTagsTag';
import { existsQuery } from './existsQuery';
import { ISearchTaskQuery } from '../api/taskController';
import { TaskWatcher } from '../entity/TaskWatcher';

export async function searchTaskList(userId: string, role: string, orgId: string, condition: ISearchTaskQuery) {
  const { text, status, page, assigneeId, orderDirection, orderField, femplateId, tags, clientId, watchedOnly } = condition;
  const size = condition.size || 50;
  const skip = (page - 1) * size;
  const isClient = role === Role.Client;

  let query = db.manager
    .createQueryBuilder()
    .from(TaskInformation, 'x')

  query = query.where(`1 = 1`, { tags, userId });
  if (watchedOnly) {
    // query = query.andWhere(TaskWatcher, 'w', 'x."userId" = w."userId" AND w."taskId" = x.id')
    query = query.andWhere(
      existsQuery(
        query.createQueryBuilder()
          .from(TaskWatcher, 'w')
          .where(`w."userId" = :userId`)
          .andWhere(`w."taskId" = x.id`)
      )
    );
  }

  if (isClient) {
    query = query.andWhere(`x."userId" = :userId`);
  } else {
    query = query.andWhere(`x."orgId" = :orgId`, { orgId });
  }
  if (status?.length) {
    query = query.andWhere(`x.status IN (:...status)`, { status });
  }
  if (assigneeId) {
    query = query.andWhere('x."assigneeId" = :assigneeId', { assigneeId });
  }
  if (femplateId) {
    query = query.andWhere(`x."femplateId" = :femplateId`, { femplateId });
  }
  if (tags?.length) {
    query = query.andWhere(
      existsQuery(
        query.createQueryBuilder()
          .from(TaskTagsTag, 'ttt')
          .where(`ttt."tagId" IN (:...tags)`)
          .andWhere(`x.id = ttt."taskId"`)
      )
    );
  }
  if (clientId) {
    query = query.andWhere(`x."orgClientId" = :clientId`, { clientId });
  }

  if (text) {
    if (isClient) {
      query = query.andWhere('(x.name ILIKE :text OR x."femplateName" ILIKE :text)', { text: `%${text}%` });
    } else {
      query = query.andWhere('(x.name ILIKE :text OR x."femplateName" ILIKE :text OR x.email ILIKE :text OR x."givenName" ILIKE :text OR x.surname ILIKE :text)', { text: `%${text}%` });
    }
  }

  query = query.select('x.*')

  const total = await query.getCount();
  const list = await query
    .orderBy(`"${orderField}"`, orderDirection)
    .offset(skip)
    .limit(size)
    .execute();

  return { data: list, pagination: { page, size, total } };
}
