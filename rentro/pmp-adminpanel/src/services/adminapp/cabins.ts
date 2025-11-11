import { CABIN_PREFIX } from '@/utils/constants';
import network from '@/utils/network';

const list = (search: string, page: number, size: number) => {
  return network.get(`${CABIN_PREFIX}/list`, {
    search,
    page,
    size,
  });
};

const create = (data: any) => {
  return network.post(`${CABIN_PREFIX}/create`, data);
};

const update = (id: string, data: any) => {
  return network.post(`${CABIN_PREFIX}/update/${id}`, data);
};

const deleteCabin = (id: string) => {
  return network.post(`${CABIN_PREFIX}/delete/${id}`, {});
};

const lov = () => {
  return network.get(`${CABIN_PREFIX}/lov`);
};

const assignEmp = (data: any) => {
  return network.post(`${CABIN_PREFIX}/assign`, data);
};

const history = (queryParams: any) => {
  return network.get(`${CABIN_PREFIX}/history`, queryParams);
};

const cabinHistory = (queryParams: any) => {
  return network.get(`${CABIN_PREFIX}/cabin-history`, queryParams);
};

const createCabinScanner = (data: any) => {
  return network.post(`${CABIN_PREFIX}/scanner`, data);
};

export default {
  list,
  create,
  update,
  deleteCabin,
  lov,
  assignEmp,
  history,
  cabinHistory,
  createCabinScanner,
};
