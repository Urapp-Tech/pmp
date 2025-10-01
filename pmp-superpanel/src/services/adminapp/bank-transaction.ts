import { PAYMENT_PREFIX } from '@/utils/constants';
import network from '@/utils/network';

const list = (qp: any) => {
  return network.get(`${PAYMENT_PREFIX}/settlements`, qp);
};

const getByDepositRef = (depRef: any) => {
  return network.get(`${PAYMENT_PREFIX}/settlements/${depRef}`);
};

// const update = (id: string, data: any) => {
//   return network.postMultipart(`${PAYMENT_PREFIX}/update/${id}`, data);
// };

// const deleteBlog = (id: string) => {
//   return network.post(`${PAYMENT_PREFIX}/delete/${id}`, {});
// };

export default {
  list,
  getByDepositRef,
};
