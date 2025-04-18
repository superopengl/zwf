import { SupportMessageLastSeen } from './../entity/SupportMessageLastSeen';
import { SupportMessage } from './../entity/SupportMessage';
import { In, IsNull } from 'typeorm';
import { db } from '../db';
import { assertRole } from '../utils/assertRole';
import { handlerWrapper } from '../utils/asyncHandler';
import { getUserIdFromReq } from '../utils/getUserIdFromReq';
import { NotificationMessage } from "../entity/NotificationMessage";
import { TaskEventLastSeen } from '../entity/TaskEventLastSeen';
import { TaskActivityInformation } from '../entity/views/TaskActivityInformation';
import { TaskEventType } from '../types/TaskEventType';
import { Role } from '../types/Role';
import { getRoleFromReq } from '../utils/getRoleFromReq';
import { getOrgIdFromReq } from '../utils/getOrgIdFromReq';
import { OrgMemberInformation } from '../entity/views/OrgMemberInformation';
import { UserTaskEventAckInformation } from '../entity/views/UserTaskEventAckInformation';
import { UserTaskEventNotificationInformation } from '../entity/views/UserTaskEventNotificationInformation';


export const getMyNotifications = handlerWrapper(async (req, res) => {
  assertRole(req, ['client', 'agent', 'admin']);

  const page = +req.body.page;
  const size = +req.body.size;
  const pageNo = page || 1;
  const pageSize = size || 100;
  const skip = (pageNo - 1) * pageSize;
  const take = pageSize;
  const role = getRoleFromReq(req);
  const userId = getUserIdFromReq(req);
  const eventTypes = role === Role.Client ? [
    TaskEventType.RequestClientInputFields,
    TaskEventType.RequestClientSign,
    TaskEventType.Comment,
    TaskEventType.Complete,
    TaskEventType.Archive
  ] : [
    TaskEventType.ClientSubmit,
    TaskEventType.ClientSignDoc,
    TaskEventType.Comment,
    TaskEventType.CreateByRecurring,
    TaskEventType.OrgStartProceed,
    TaskEventType.Assign,
    TaskEventType.Complete,
    TaskEventType.Archive,
  ];

  const result = await db
    .getRepository(UserTaskEventNotificationInformation)
    .createQueryBuilder('x')
    .where({
      userId,
      type: In(eventTypes)
    })
    .skip(skip)
    .take(take)
    .getMany();


  res.json(result);
});


export const getMyNotifications_old = handlerWrapper(async (req, res) => {
  assertRole(req, ['client', 'agent', 'admin', 'system']);

  const page = +req.body.page;
  const size = +req.body.size;
  const pageNo = page || 1;
  const pageSize = size || 20;

  const userId = getUserIdFromReq(req);

  let result: any;

  await db.transaction(async m => {
    // Get unread support messages
    const unreadSupportMsgCount = await m.createQueryBuilder()
      .from(SupportMessage, 's')
      .leftJoin(SupportMessageLastSeen, 'a', 's."userId" = a."userId"')
      .where(`s."userId" = :userId`, { userId })
      .andWhere(`s."by" != :userId`, { userId })
      .andWhere(`(a."lastSeenAt" IS NULL OR a."lastSeenAt" < s."createdAt")`)
      .getCount()

    // Get unread task comment messages
    const changedTasks = await m.createQueryBuilder()
      .from(TaskActivityInformation, 't')
      .leftJoin(TaskEventLastSeen, 'a', 't."taskId" = a."taskId" AND t."userId" = a."userId"')
      .where(`t.by != :userId`, { userId })
      .andWhere(`t."userId" = :userId`, { userId })
      .andWhere(`(a."lastSeenAt" IS NULL OR a."lastSeenAt" < t."createdAt")`)
      .distinctOn(['t."taskId"', 't."taskName"'])
      .orderBy('t."taskId"')
      .addOrderBy('t."taskName"')
      .select([
        't."taskId" as "taskId"',
        't."taskName" as "taskName"',
      ])
      .execute()


    result = {
      changedTasks,
      unreadSupportMsgCount,
    }
  })

  res.json(result);
});

export const reactOnNotificationMessage = handlerWrapper(async (req, res) => {
  assertRole(req, ['client', 'agent', 'admin', 'system']);
  const { id } = req.params;
  const userId = getUserIdFromReq(req);

  await db.manager.update(NotificationMessage, {
    id,
    notifiee: userId,
    reactedAt: IsNull(),
  }, {
    reactedAt: () => `NOW()`
  })

  res.json();
});
