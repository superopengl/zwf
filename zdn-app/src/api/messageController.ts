
import { getRepository, IsNull, getManager } from 'typeorm';
import { Task } from '../entity/Task';
import { Message } from '../entity/Message';
import { assert } from '../utils/assert';
import { assertRole } from "../utils/assertRole";
import { handlerWrapper } from '../utils/asyncHandler';
import { getNow } from '../utils/getNow';

async function listMessageForClient(clientId, pagenation, unreadOnly) {
  const query = getManager()
    .createQueryBuilder()
    .select('*')
    .from(q => q.from(Message, 'x')
      .where(`"clientUserId" = :id`, { id: clientId })
      .andWhere(unreadOnly ? `"readAt" IS NULL` : '1 = 1')
      .orderBy('"taskId"')
      .addOrderBy('"createdAt"', 'DESC')
      .distinctOn(['"taskId"'])
      , 'x')
    .innerJoin(q => q.from(Task, 'l').select('*'), 'l', `l.id = x."taskId"`)
    .offset(pagenation.skip)
    .limit(pagenation.limit)
    .select([
      'x.id as id',
      'x."taskId" as "taskId"',
      'x."createdAt" as "createdAt"',
      'l.id as "taskId"',
      'l."forWhom" as "forWhom"',
      'l.name as name',
      'content',
      '"readAt"'
    ]);

  const list = await query.execute();
  return list;
}

async function listMessageForAgent(agentId, pagenation, unreadOnly) {
  const query = getManager()
    .createQueryBuilder()
    .select('*')
    .from(q => q.from(Message, 'x')
      .where(`"agentUserId" = :id`, { id: agentId })
      .andWhere(unreadOnly ? `"readAt" IS NULL` : '1 = 1')
      .orderBy('"taskId"')
      .addOrderBy('"createdAt"', 'DESC')
      .distinctOn(['"taskId"'])
      , 'x')
    .innerJoin(q => q.from(Task, 'l').select('*'), 'l', `l.id = x."taskId"`)
    .offset(pagenation.skip)
    .limit(pagenation.limit)
    .select([
      'x.id as id',
      'x."taskId" as "taskId"',
      'x."createdAt" as "createdAt"',
      'l.id as "taskId"',
      'l."forWhom" as "forWhom"',
      'l.name as name',
      'content',
      '"readAt"'
    ]);
  const list = await query.execute();
  return list;
}

async function listMessageForAdmin(pagenation, unreadOnly) {
  const query = getManager()
    .createQueryBuilder()
    .select('*')
    .from(q => q.from(Message, 'x')
      .andWhere(unreadOnly ? `"readAt" IS NULL` : '1 = 1')
      .orderBy('"taskId"')
      .addOrderBy('"createdAt"', 'DESC')
      .distinctOn(['"taskId"'])
      , 'x')
    .innerJoin(q => q.from(Task, 'l').select('*'), 'l', `l.id = x."taskId"`)
    .offset(pagenation.skip)
    .limit(pagenation.limit)
    .select([
      'x.id as id',
      'x."taskId" as "taskId"',
      'x."createdAt" as "createdAt"',
      'l.id as "taskId"',
      'l."forWhom" as "forWhom"',
      'l.name as name',
      'content',
      '"readAt"'
    ]);
  const list = await query.execute();
  return list;
}

export const listMessage = handlerWrapper(async (req, res) => {
  assertRole(req, 'admin', 'agent', 'client');
  const { user: { id, role } } = req as any;
  const { page, size, unreadOnly } = req.body;
  assert(page >= 0 && size > 0, 400, 'Invalid page and size parameter');

  const pagenation = {
    skip: page * size,
    limit: size,
  };

  let list: Promise<any>;
  switch (role) {
    case 'client':
      list = await listMessageForClient(id, pagenation, unreadOnly);
      break;
    case 'agent':
    // list = await listMessageForAgent(id, pagenation, unreadOnly);
    // break;
    case 'admin':
      list = await listMessageForAdmin(pagenation, unreadOnly);
      break;
    default:
      assert(false, 500, `Unsupported role ${role}`);
  }

  res.json(list);
});

export const getMessage = handlerWrapper(async (req, res) => {
  assertRole(req, 'admin', 'agent', 'client');
  const { id } = req.params;
  const { user: { id: userId, role } } = req as any;
  const repo = getRepository(Message);
  const query: any = { id };
  const isClient = role === 'client';
  if (isClient) {
    query.clientUserId = userId;
  }

  const result = await repo.createQueryBuilder('x')
    .where(query)
    .innerJoin(q => q.from(Task, 'l').select('*'), 'l', `l.id = x.taskId`)
    .select([
      `x.id as id`,
      `x.content as content`,
      `x."createdAt" as "createdAt"`,
      `x."readAt" as "readAt"`,
      `x."taskId" as "taskId"`,
      `l."name" as name`,
      `l."forWhom" as "forWhom"`,
    ])
    .execute();

  const item = result[0];
  assert(item, 404);

  if (isClient) {
    await repo.update(query, { readAt: getNow() });
  }

  res.json(item);
});

export const getMessageUnreadCount = handlerWrapper(async (req, res) => {
  assertRole(req, 'admin', 'agent', 'client');
  const { user: { role, id } } = req as any;

  const info = await getManager()
    .createQueryBuilder()
    .from(q => q.from(Message, 'x')
      .where(`"readAt" IS NULL`)
      .andWhere(role === 'client' ? `x."clientUserId" = :id` : '1=1', { id })
      .orderBy('"taskId"')
      .addOrderBy('"createdAt"', 'DESC')
      .distinctOn(['"taskId"'])
      , 'x')
    .innerJoin(q => q.from(Task, 'l').select('*'), 'l', `l.id = x."taskId"`)
    .select('COUNT(*) as count')
    .execute();

  const count = +info[0]?.count ?? 0;

  res.json(count);
});
