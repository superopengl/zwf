
import { getManager, getRepository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { Portfolio } from '../entity/Portfolio';
import { User } from '../entity/User';
import { assert } from '../utils/assert';
import { assertRole } from "../utils/assertRole";
import { handlerWrapper } from '../utils/asyncHandler';
import { getNow } from '../utils/getNow';
import { guessDisplayNameFromFields } from '../utils/guessDisplayNameFromFields';
import { sendNewPortfolioEmail } from '../utils/sendNewPortfolioEmail';
import { UserProfile } from '../entity/UserProfile';

export const savePortfolio = handlerWrapper(async (req, res) => {
  assertRole(req, 'admin', 'agent', 'client');
  const portfolio = new Portfolio();

  const { user: { id: userId, role } } = req as any;

  const { id, fields, type } = req.body;
  portfolio.id = id || uuidv4();
  portfolio.userId = role === 'client' ? userId : req.params.id;
  portfolio.name = guessDisplayNameFromFields(fields);
  portfolio.fields = fields;
  portfolio.type = type;

  const repo = getRepository(Portfolio);
  await repo.save(portfolio);

  sendNewPortfolioEmail(portfolio);

  res.json();
});

async function listUserPortofolio(userId) {
  const list = await getRepository(Portfolio)
    .createQueryBuilder('x')
    .where({ userId, deleted: false })
    .orderBy('x.name', 'ASC')
    .select(['x.id', 'x.name', 'x.lastUpdatedAt'])
    .getMany();
  return list;
}

async function listAdminPortfolio() {
  const list = await getManager()
    .createQueryBuilder()
    .from(Portfolio, 'x')
    .where({ deleted: false })
    .innerJoin(q => q.from(User, 'u').where(`u.role = 'client'`), 'u', 'u.id = x."userId"')
    .innerJoin(UserProfile, 'p', 'p.id = u."profileId"')
    .orderBy('x.name', 'ASC')
    .select([
      'x.id as id',
      'x.name as name',
      'p.email as email'
    ])
    .execute();
  return list;
}

export const listPortfolio = handlerWrapper(async (req, res) => {
  assertRole(req, 'client', 'admin');
  const { user: { id, role } } = req as any;
  const list = role === 'client' ? await listUserPortofolio(id) :
    role === 'admin' ? await listAdminPortfolio() :
      [];

  res.json(list);
});

export const listPortfolioForUser = handlerWrapper(async (req, res) => {
  assertRole(req, 'agent', 'admin');
  const { id } = req.params;
  const list = await listUserPortofolio(id);
  res.json(list);
});


export const getPortfolio = handlerWrapper(async (req, res) => {
  assertRole(req, 'admin', 'client');
  const { id } = req.params;
  const repo = getRepository(Portfolio);
  const portfolio = await repo.findOne({ id, deleted: false });
  assert(portfolio, 404);

  res.json(portfolio);
});

export const deletePortfolio = handlerWrapper(async (req, res) => {
  assertRole(req, 'admin', 'client');
  const { id } = req.params;
  const repo = getRepository(Portfolio);
  await repo.update({ id }, { deleted: true });

  res.json();
});