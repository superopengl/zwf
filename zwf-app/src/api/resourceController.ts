import { ResourcePage } from './../entity/ResourcePage';

import { Not, IsNull } from 'typeorm';
import { assertRole } from "../utils/assertRole";
import { handlerWrapper } from '../utils/asyncHandler';
import { assert } from '../utils/assert';
import { htmlToText } from 'html-to-text';
import { AppDataSource } from '../db';

function getBrief(html: string): string {
  const text = htmlToText(html);
  return text.substring(0, 200);
}

export const listPublishedResourcePages = handlerWrapper(async (req, res) => {
  const list = await AppDataSource.getRepository(ResourcePage).find({
    where: {
      publishedAt: Not(IsNull())
    },
    order: {
      publishedAt: 'DESC'
    },
    select: [
      'id',
      'publishedAt',
      'keywords',
      'title',
      'brief',
      'createdAt',
      'updatedAt',
      'imageBase64',
    ]
  });

  res.json(list);
});


export const getPublishedResourcePage = handlerWrapper(async (req, res) => {
  const { id } = req.params;
  const page = await AppDataSource.getRepository(ResourcePage).findOne({
    where: {
      id,
      publishedAt: Not(IsNull())
    }
  });
  assert(page, 404);

  res.json(page);
});

export const listAllResourcePages = handlerWrapper(async (req, res) => {
  assertRole(req, 'system');
  const list = await AppDataSource.getRepository(ResourcePage).find({
    order: {
      createdAt: 'DESC'
    },
    select: [
      'id',
      'publishedAt',
      'keywords',
      'title',
      'brief',
      'createdAt',
      'updatedAt',
      'imageBase64',
    ]
  });

  res.json(list);
});

export const saveResourcePage = handlerWrapper(async (req, res) => {
  assertRole(req, 'system');
  const { id, html } = req.body;

  let page: ResourcePage = null;
  if (id) {
    page = await AppDataSource.getRepository(ResourcePage).findOne({where: {id}});
  }

  page = Object.assign(page || {}, req.body);

  if(html) {
    page.brief = getBrief(html);
  }

  await AppDataSource.getRepository(ResourcePage).save(page);

  res.json();
});

export const getEditResourcePage = handlerWrapper(async (req, res) => {
  assertRole(req, 'system');
  const { id } = req.params;
  const page = await AppDataSource.getRepository(ResourcePage).findOne({where: {id}});
  assert(page, 404);

  res.json(page);
});

export const deleteResourcePage = handlerWrapper(async (req, res) => {
  assertRole(req, 'system');
  const { id } = req.params;
  await AppDataSource.getRepository(ResourcePage).delete(id);

  res.json();
});
