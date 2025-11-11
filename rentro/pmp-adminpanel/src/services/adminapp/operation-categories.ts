import { OPERATON_CAT_PREFIX } from '@/utils/constants';
import network from '@/utils/network';

const list = (search: string, page: number, size: number) => {
  return network.get(`${OPERATON_CAT_PREFIX}/list`, {
    search,
    page,
    size,
  });
};

const create = (data: any) => {
  return network.post(`${OPERATON_CAT_PREFIX}/create`, data);
};

const update = (id: string, data: any) => {
  return network.post(`${OPERATON_CAT_PREFIX}/update/${id}`, data);
};

const deleteCat = (id: string) => {
  return network.post(`${OPERATON_CAT_PREFIX}/delete/${id}`, {});
};

export default {
  list,
  create,
  update,
  deleteCat,
};
