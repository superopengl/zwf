import { SupportMessage } from './../entity/SupportMessage';
import { IsNull } from 'typeorm';
import { db } from '../db';
import { assertRole } from '../utils/assertRole';
import { handlerWrapper } from '../utils/asyncHandler';
import { getUserIdFromReq } from '../utils/getUserIdFromReq';
import { TaskActivityInformation } from '../entity/views/TaskActivityInformation';
import { Role } from '../types/Role';
import { getRoleFromReq } from '../utils/getRoleFromReq';
import { TaskWatcherEventAckInformation } from '../entity/views/TaskWatcherEventAckInformation';
import { assert } from '../utils/assert';
import { emitTaskEventAcks } from '../utils/emitTaskEventAcks';
import { ZeventDef } from '../entity/ZeventDef';
import { TaskWatcherUiNotificationInformation } from '../entity/views/TaskWatcherUiNotificationInformation';

export const loadMyUnackZevents = handlerWrapper(async (req, res) => {
  assertRole(req, [Role.Client, Role.Agent, Role.Admin, Role.System]);

  const page = +req.body.page;
  const size = +req.body.size;
  const pageNo = page || 1;
  const pageSize = size || 100;
  const skip = (pageNo - 1) * pageSize;
  const take = pageSize;
  const role = getRoleFromReq(req);
  const userId = getUserIdFromReq(req);
  // const eventTypes = role === Role.Client ? CLIENT_WATCH_EVENTS : ORG_MEMBER_WATCH_EVENTS;

  let result: any[];
  if (role === Role.System) {
    result = [];
  } else {
    const taskEvents = await db.getRepository(TaskWatcherUiNotificationInformation)
      .findBy({
        userId
      })

    // const taskEvents = await db.manager.find(TaskWatcherEventAckInformation, {
    //   where: [{
    //     userId,
    //     ackAt: IsNull()
    //   }, {
    //     userId,
    //     ackAt: MoreThan(`now() - interval '30 minutes'`)
    //   }],
    //   select: {
    //     eventId: true,
    //     taskId: true,
    //     taskName: true,
    //     type: true,
    //     info: true,
    //     createdAt: true,
    //     by: true,
    //   }
    // });

    result = taskEvents.map(t => ({
      type: 'taskEvent',
      userId,
      payload: t
    }))
  }

  res.json(result);
});

export const ackZevent = handlerWrapper(async (req, res) => {
  assertRole(req, ['client', 'agent', 'admin']);
  const userId = getUserIdFromReq(req);
  const { taskId, type } = req.body;

  assert(taskId, 400, 'taskId is not specified');
  assert(type, 400, 'type is not specified');

  await db.transaction(async m => {
    const taskEvents = await m.find(TaskWatcherEventAckInformation, {
      where: {
        userId,
        taskId,
        type,
        ackAt: IsNull()
      },
      select: {
        eventId: true
      }
    });

    emitTaskEventAcks(m, taskEvents.map(x => x.eventId), userId);
  });

  res.json();
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
    // const unreadSupportMsgCount = await m.createQueryBuilder()
    //   .from(SupportMessage, 's')
    //   .leftJoin(SupportMessageLastSeen, 'a', 's."userId" = a."userId"')
    //   .where(`s."userId" = :userId`, { userId })
    //   .andWhere(`s."by" != :userId`, { userId })
    //   .andWhere(`(a."lastSeenAt" IS NULL OR a."lastSeenAt" < s."createdAt")`)
    //   .getCount()

    // Get unread task comment messages
    const changedTasks = await m.createQueryBuilder()
      .from(TaskActivityInformation, 't')
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
    }
  })

  res.json(result);
});
