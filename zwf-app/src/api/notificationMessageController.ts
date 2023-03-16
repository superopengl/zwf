import { IsNull } from 'typeorm';
import { db } from '../db';
import { assertRole } from '../utils/assertRole';
import { handlerWrapper } from '../utils/asyncHandler';
import { getUserIdFromReq } from '../utils/getUserIdFromReq';
import { NotificationMessage } from "../entity/NotificationMessage";


export const getMyNotificationMessages = handlerWrapper(async (req, res) => {
  assertRole(req, ['client', 'agent', 'admin', 'system']);

  const page = +req.body.page;
  const size = +req.body.size;
  const pageNo = page || 1;
  const pageSize = size || 20;

  const userId = getUserIdFromReq(req);

  let list;
  let count;

  await db.transaction(async m => {
    const query = {
      where: {
        notifiee: userId,
        reactedAt: IsNull()
      }
    };
    list = await m.find(NotificationMessage, {
      ...query,
      order: {
        createdAt: 'DESC'
      },
      skip: (pageNo - 1) * pageSize,
      take: pageSize,
    });
    count = await m.count(NotificationMessage, query);
  });

  res.json({
    list,
    count,
  });
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
