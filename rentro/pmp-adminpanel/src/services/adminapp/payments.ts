import { PAYMENT_PREFIX } from '@/utils/constants';
import network from '@/utils/network';

const create = (data: any) => {
  return network.post(`${PAYMENT_PREFIX}/create`, data);
};

// const update = (id: string, data: any) => {
//   return network.postMultipart(`${PAYMENT_PREFIX}/update/${id}`, data);
// };

// const deleteBlog = (id: string) => {
//   return network.post(`${PAYMENT_PREFIX}/delete/${id}`, {});
// };

export default {
  create,
};
