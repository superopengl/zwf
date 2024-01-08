
import { getRepository } from 'typeorm';
import { handlerWrapper } from '../utils/asyncHandler';
import { assertRole } from "../utils/assertRole";
import { Task } from '../entity/Task';
import { User } from '../entity/User';
import { Portfolio } from '../entity/Portfolio';

async function getUserStats() {
  const result = await getRepository(User)
    .createQueryBuilder('x')
    .select('x.role as name')
    .addSelect(`COUNT(1) AS count`)
    .groupBy('x.role')
    .execute();

  return result.reduce((pre, cur) => {
    pre[cur.name] = +cur.count;
    return pre;
  }, {
    admin: 0,
    agent: 0,
    client: 0,
  });
}

async function getTaskStat() {
  const result = await getRepository(Task)
    .createQueryBuilder('x')
    .select('x.status as name')
    .addSelect(`COUNT(1) AS count`)
    .groupBy('x.status')
    .execute();

  return result.reduce((pre, cur) => {
    pre[cur.name] = +cur.count;
    return pre;
  }, {
    todo: 0,
    to_sign: 0,
    signed: 0,
    complete: 0,
    archive: 0,
  });
}

export const getAdminStats = handlerWrapper(async (req, res) => {
  assertRole(req, 'admin', 'agent');

  const taskStat = await getRepository(Task)
    .createQueryBuilder('x')
    .select('x.status as name')
    .addSelect(`COUNT(1) AS count`)
    .groupBy('x.status')
    .execute();

  const stats = {
    user: await getUserStats(),
    task: await getTaskStat(),
  };

  res.json(stats);
});
