import { SupportMessage } from '../SupportMessage';
import { ViewEntity, DataSource, ViewColumn, PrimaryColumn } from 'typeorm';

@ViewEntity({
  expression: (connection: DataSource) => connection.createQueryBuilder()
    .from(SupportMessage, 'x')
    .leftJoin(q => q.from(SupportMessage, 'm')
      .where(`m.by != m."userId"`)
      .distinctOn(['m."userId"'])
      .orderBy('"userId"')
      .addOrderBy('"createdAt"', 'DESC')
      .select([
        `m.userId as "userId"`,
        `m."createdAt" as "lastReplyAt"`
      ]),
      'u', 'x."userId" = u."userId"')
    .where(`(x."createdAt" > u."lastReplyAt" OR u."lastReplyAt" IS NULL)`)
    .andWhere(`x.by = x."userId"`)
    .groupBy('x."userId"')
    .select([
      'x."userId" as "userId"',
      'COUNT(1) as count',
    ]),
  dependsOn: [SupportMessage]
})
export class SupportPendingReplyInformation {
  @ViewColumn()
  @PrimaryColumn()
  userId: string;

  @ViewColumn()
  count: number;
}
