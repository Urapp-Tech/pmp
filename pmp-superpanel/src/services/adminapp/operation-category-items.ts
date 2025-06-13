import { OPERATON_CAT_ITEM_PREFIX } from '@/utils/constants';
import network from '@/utils/network';

const list = (catId: any, search: string, page: number, size: number) => {
  return network.get(`${OPERATON_CAT_ITEM_PREFIX}/list`, {
    operationCategory: catId,
    search,
    page,
    size,
  });
};

const create = (data: any) => {
  return network.post(`${OPERATON_CAT_ITEM_PREFIX}/create`, data);
};

const update = (id: string, data: any) => {
  return network.post(`${OPERATON_CAT_ITEM_PREFIX}/update/${id}`, data);
};

const deleteCat = (id: string) => {
  return network.post(`${OPERATON_CAT_ITEM_PREFIX}/delete/${id}`, {});
};

export default {
  list,
  create,
  update,
  deleteCat,
};
