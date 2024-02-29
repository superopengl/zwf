import { SupportMessage } from '../SupportMessage';
import { ViewEntity, Connection, ViewColumn, PrimaryColumn } from 'typeorm';
import { SupportUserLastAccess } from '../SupportUserLastAccess';


@ViewEntity({
  expression: (connection: Connection) => connection.createQueryBuilder()
    .from(SupportMessage, 'x')
    .leftJoin(SupportUserLastAccess, 'u', 'x."userId" = u."userId"')
    .where(`x."createdAt" > u."lastAccessAt"`)
    .andWhere(`x.by != x."userId"`)
    .groupBy('x."userId"')
    .select([
      'x."userId" as "userId"',
      'COUNT(1) as count',
    ])
})
export class SupportUserUnreadInformation {
  @ViewColumn()
  @PrimaryColumn()
  userId: string;

  @ViewColumn()
  count: number;
}


