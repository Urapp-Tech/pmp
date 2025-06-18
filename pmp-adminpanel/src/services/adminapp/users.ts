import { SUB_USER_PREFIX } from '@/utils/constants';
import network from '@/utils/network';

const list = (search: string, page: number, size: number) => {
  return network.get(`${SUB_USER_PREFIX}/list`, {
    search,
    page,
    size,
  });
};

const create = (data: any) => {
  return network.postMultipart(`${SUB_USER_PREFIX}/create`, data);
};

const update = (id: string, data: any) => {
  return network.postMultipart(`${SUB_USER_PREFIX}/update/${id}`, data);
};

const deleteUser = (id: string) => {
  return network.post(`${SUB_USER_PREFIX}/delete/${id}`, {});
};

export default {
  list,
  create,
  update,
  deleteUser,
};
