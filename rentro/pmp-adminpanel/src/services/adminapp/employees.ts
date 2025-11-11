import { EMPLOYEE_PREFIX } from '@/utils/constants';
import network from '@/utils/network';

const list = (search: string, page: number, size: number) => {
  return network.get(`${EMPLOYEE_PREFIX}/list`, {
    search,
    page,
    size,
  });
};

const create = (data: any) => {
  return network.postMultipart(`${EMPLOYEE_PREFIX}/create`, data);
};

const update = (id: string, data: any) => {
  return network.postMultipart(`${EMPLOYEE_PREFIX}/update/${id}`, data);
};

const deleteEmp = (id: string) => {
  return network.post(`${EMPLOYEE_PREFIX}/delete/${id}`, {});
};

const lov = () => {
  return network.get(`${EMPLOYEE_PREFIX}/lov`);
};

export default {
  list,
  create,
  update,
  deleteEmp,
  lov,
};
