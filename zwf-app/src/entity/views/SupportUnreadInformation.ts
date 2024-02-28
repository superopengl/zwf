import { SupportMessage } from '../SupportMessage';
import { UserInformation } from './UserInformation';
import { ViewEntity, Connection, ViewColumn, PrimaryColumn } from 'typeorm';
import { SubscriptionStatus } from '../../types/SubscriptionStatus';
import { Subscription } from '../Subscription';
import { Payment } from '../Payment';
import { User } from '../User';
import { UserProfile } from '../UserProfile';
import { Org } from '../Org';
import { Role } from '../../types/Role';
import { UserStatus } from '../../types/UserStatus';
import { SupportLastRead } from '../SupportLastRead';


@ViewEntity({
  expression: (connection: Connection) => connection.createQueryBuilder()
    .from(SupportMessage, 'x')
    .leftJoin(q => q.from(SupportLastRead, 'r')
      .innerJoin(SupportMessage, 'm', 'r."userId" = m."userId" AND r."userLastReadMessageId" = m.id')
      .select([
        `r.userId as "userId"`,
        `m."createdAt" as "lastReadAt"`
      ])
      , 'u', 'x."userId" = u."userId"')
    .where(`x."createdAt" > u."lastReadAt"`)
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


