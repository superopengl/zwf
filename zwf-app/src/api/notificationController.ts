import { SupportMessageLastSeen } from './../entity/SupportMessageLastSeen';
import { SupportMessage } from './../entity/SupportMessage';
import { IsNull } from 'typeorm';
import { db } from '../db';
import { assertRole } from '../utils/assertRole';
import { handlerWrapper } from '../utils/asyncHandler';
import { getUserIdFromReq } from '../utils/getUserIdFromReq';
import { NotificationMessage } from "../entity/NotificationMessage";
import { TaskEventLastSeen } from '../entity/TaskEventLastSeen';
import { TaskActivityInformation } from '../entity/views/TaskActivityInformation';
import { TaskEventType } from '../types/TaskEventType';
import { Role } from '../types/Role';
import { ClientTaskEventAckInformation } from '../entity/views/ClientTaskEventAckInformation';
import { getRoleFromReq } from '../utils/getRoleFromReq';
import { getOrgIdFromReq } from '../utils/getOrgIdFromReq';
import { OrgMemberInformation } from '../entity/views/OrgMemberInformation';
import { UserTaskEventAckInformation } from '../entity/views/UserTaskEventAckInformation';
import { OrgMemberTaskEventNotificationInformation } from '../entity/views/OrgMemberTaskEventNotificationInformation';
import { ClientTaskEventNotificationInformation } from '../entity/views/ClientTaskEventNotificationInformation';


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

  let result: any;

  const pipeline = {
    skip,
    take,
    distinct: true,
    select: {
      taskId: true,
      taskName: true,
      type: true,
      info: true,
      eventAt: true,
      eventBy: true,
    }
  }

  if (role === Role.Client) {
    result = await db
      .getRepository(ClientTaskEventNotificationInformation)
      .createQueryBuilder('x')
      .where({
        userId,
      })
      .skip(skip)
      .take(take)
      .getMany();
  } else {
    const orgId = getOrgIdFromReq(req);
    result = await db
      .getRepository(OrgMemberTaskEventNotificationInformation)
      .createQueryBuilder('x')
      .where({
        orgId,
      })
      .skip(skip)
      .take(take)
      .getMany();


    // result = await db.createQueryBuilder()
    //   .from(OrgMemberTaskEventAckInformation, 'x')
    //   .where(`x."orgId" = :orgId`, { orgId })
    //   .andWhere(`x."ackAt" IS NULL`)
    //   .groupBy('x."taskId"')
    //   .addGroupBy('x."taskName"')
    //   .select([
    //     '"taskId"',
    //     '"taskName"',
    //     'COUNT(*) as count'
    //   ])
    //   .skip(skip)
    //   .take(take)
    //   .execute();
  }

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
