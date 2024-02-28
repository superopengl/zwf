import { SupportMessage } from '../SupportMessage';
import { ViewEntity, Connection, ViewColumn, PrimaryColumn } from 'typeorm';
import { SupportLastRead } from '../SupportLastRead';



@ViewEntity({
  expression: (connection: Connection) => connection.createQueryBuilder()
    .from(SupportMessage, 'x')
    .leftJoin(q => q.from(SupportLastRead, 'r')
      .innerJoin(SupportMessage, 'm', 'r."userId" = m."userId" AND r."supporterLastReadMessageId" = m.id')
      .select([
        `r.userId as "userId"`,
        `m."createdAt" as "lastReadAt"`
      ]),
      'u', 'x."userId" = u."userId"')
    .where(`x."createdAt" > u."lastReadAt"`)
    .groupBy('x."userId"')
    .select([
      'x."userId" as "userId"',
      'COUNT(1) as count',
    ])
})
export class SupportSupporterUnreadInformation {
  @ViewColumn()
  @PrimaryColumn()
  userId: string;

  @ViewColumn()
  count: number;
}
