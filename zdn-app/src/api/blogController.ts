
import { getRepository } from 'typeorm';
import { Blog } from '../entity/Blog';
import { assert, assertRole } from '../utils/assert';
import { handlerWrapper } from '../utils/asyncHandler';
import { getNow } from '../utils/getNow';

export const saveBlog = handlerWrapper(async (req, res) => {
  assertRole(req, 'admin');
  const { id, title, md, files } = req.body;
  assert(title && md, 400, 'title and body are required');
  const repo = getRepository(Blog);
  const blog = id ? await repo.findOne(id) : new Blog();
  assert(blog, 404);

  blog.title = title;
  blog.md = md;
  blog.files = files;

  await repo.save(blog);

  res.json();
});

export const listBlog = handlerWrapper(async (req, res) => {
  const {} = req as any;
  const list = await getRepository(Blog)
    .createQueryBuilder('x')
    .orderBy('x."createdAt"', 'DESC')
    // .select(['x.id', 'x.title', 'x.md', 'x.files', 'x.tags', 'x."createdAt"', 'x."lastUpdatedAt"'])
    .getMany();

  res.json(list);
});


export const getBlog = handlerWrapper(async (req, res) => {
  const { id } = req.params;
  const repo = getRepository(Blog);
  const blog = await repo.findOne(id);
  assert(blog, 404);

  res.json(blog);
});

export const deleteBlog = handlerWrapper(async (req, res) => {
  assertRole(req, 'admin');
  const { id } = req.params;
  await  getRepository(Blog).delete(id);
  res.json();
});