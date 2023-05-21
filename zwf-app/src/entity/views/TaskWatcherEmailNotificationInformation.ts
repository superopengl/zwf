import { ViewEntity, DataSource, ViewColumn } from 'typeorm';
import { UserInformation } from './UserInformation';
import { TaskWatcherUiNotificationInformation } from './TaskWatcherUiNotificationInformation';

@ViewEntity({
  expression: (connection: DataSource) => connection
    .createQueryBuilder()
    .from(TaskWatcherUiNotificationInformation, 'x')
    .innerJoin(UserInformation, 'u', `u.id = x."userId"`)
    .where(`x."unackDays" IN (1, 3, 7, 15, 30)`)
    .select([
      `x."taskId" as "taskId"`,
      `x."taskName" as "taskName"`,
      `x."userId" as "userId"`,
      `u."email" as "email"`,
      `u."givenName" as "givenName"`,
      `u."surname" as "surname"`,
    ]),
  dependsOn: [TaskWatcherUiNotificationInformation]
}) export class TaskWatcherEmailNotificationInformation {
  @ViewColumn()
  userId: string;

  @ViewColumn()
  taskId: string;

  @ViewColumn()
  taskName: string;

  @ViewColumn()
  email: string;

  @ViewColumn()
  givenName: string;

  @ViewColumn()
  surname: string;
}



