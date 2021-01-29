import { httpGet, httpPost, httpDelete } from './http';

export async function getBlog(id) {
  return httpGet(`blog/${id}`);
}

export async function saveBlog(blog) {
  return httpPost('blog', blog);
}

export async function deleteBlog(id) {
  return httpDelete(`blog/${id}`);
}

export async function listBlog() {
  return httpGet('blog');
}
