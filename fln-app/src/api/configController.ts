
import { getManager, getRepository } from 'typeorm';
import { assert, assertRole } from '../utils/assert';
import { handlerWrapper } from '../utils/asyncHandler';
import { Locale } from '../types/Locale';
import { Config } from '../entity/Config';

export const listConfig = handlerWrapper(async (req, res) => {
  assertRole(req, 'admin');
  const list = await getRepository(Config).find({ order: { key: 'ASC' } });
  res.json(list);
});

export const saveConfig = handlerWrapper(async (req, res) => {
  assertRole(req, 'admin');
  const { key, value } = req.body;
  assert(key, 400, 'Translation value is empty');
  const item = new Config();
  item.key = key;
  item.value = value;
  await getManager()
    .createQueryBuilder()
    .insert()
    .into(Config)
    .values(item)
    .onConflict(`(key) DO UPDATE SET value = excluded.value`)
    .execute();

  res.json();
});
