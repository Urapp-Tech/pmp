import { PROPERTY_PREFIX } from '@/utils/constants';
import network from '@/utils/network';

const list = (search: string, page: number, size: number) => {
  return network.get(`${PROPERTY_PREFIX}/list`, {
    search,
    page,
    size,
  });
};

const create = (data: any) => {
  return network.postMultipart(`${PROPERTY_PREFIX}/create`, data);
};


const update = (id: string, data: any) => {
  return network.postMultipart(`${PROPERTY_PREFIX}/update/${id}`, data);
};

const deleteProperty = (id: string) => {
  return network.post(`${PROPERTY_PREFIX}/delete/${id}`, {});
};

export default {
  list,
  create,
  update,
  deleteProperty,
};
