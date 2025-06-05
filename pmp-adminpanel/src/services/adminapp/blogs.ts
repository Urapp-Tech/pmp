import { BLOG_PREFIX } from '@/utils/constants';
import network from '@/utils/network';

const list = (search: string, page: number, size: number) => {
  return network.get(`${BLOG_PREFIX}/list`, {
    search,
    page,
    size,
  });
};

const create = (data: any) => {
  return network.postMultipart(`${BLOG_PREFIX}/create`, data);
};

const update = (id: string, data: any) => {
  return network.postMultipart(`${BLOG_PREFIX}/update/${id}`, data);
};

const deleteBlog = (id: string) => {
  return network.post(`${BLOG_PREFIX}/delete/${id}`, {});
};

export default {
  list,
  create,
  update,
  deleteBlog,
};
