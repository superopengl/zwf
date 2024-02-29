import { ResourcePage } from './../entity/ResourcePage';

import { getRepository, Not, IsNull } from 'typeorm';
import { assertRole } from "../utils/assertRole";
import { handlerWrapper } from '../utils/asyncHandler';
import { assert } from '../utils/assert';
import { htmlToText } from 'html-to-text';

function getBrief(html: string): string {
  const text = htmlToText(html);
  return text.substring(0, 200);
}

export const listPublishedResourcePages = handlerWrapper(async (req, res) => {
  const list = await getRepository(ResourcePage).find({
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
      'updatedAt'
    ]
  });

  res.json(list);
});


export const getPublishedResourcePage = handlerWrapper(async (req, res) => {
  const {id} = req.params;
  const page = await getRepository(ResourcePage).findOne({
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
  const list = await getRepository(ResourcePage).find({
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
      'updatedAt'
    ]
  });

  res.json(list);
});

export const saveResourcePage = handlerWrapper(async (req, res) => {
  assertRole(req, 'system');
  const {title, keywords, html, publishedAt} = req.body;

  const page = new ResourcePage();
  page.title = title;
  page.keywords = keywords,
  page.html = html,
  page.brief = getBrief(html),
  page.publishedAt = publishedAt;

  await getRepository(ResourcePage).save(page);

  res.json();
});

export const getEditResourcePage = handlerWrapper(async (req, res) => {
  assertRole(req, 'system');
  const {id} = req.params;
  const page = await getRepository(ResourcePage).findOne(id);
  assert(page, 404);

  res.json(page);
});

export const deleteResourcePage = handlerWrapper(async (req, res) => {
  assertRole(req, 'system');
  const {id} = req.params;
   await getRepository(ResourcePage).delete(id);

  res.json();
});
