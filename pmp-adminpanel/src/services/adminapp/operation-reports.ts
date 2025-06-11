import { OPERATON_REPORT_PREFIX } from '@/utils/constants';
import network from '@/utils/network';

const list = (qp: any) => {
  return network.get(`${OPERATON_REPORT_PREFIX}/list`, qp);
};

const create = (data: any) => {
  return network.post(`${OPERATON_REPORT_PREFIX}/create`, data);
};

const update = (id: string, data: any) => {
  return network.post(`${OPERATON_REPORT_PREFIX}/update/${id}`, data);
};

const deleteCat = (id: string) => {
  return network.post(`${OPERATON_REPORT_PREFIX}/delete/${id}`, {});
};

export default {
  list,
  create,
  update,
  deleteCat,
};
