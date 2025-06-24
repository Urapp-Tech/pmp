import { INVOICE_PREFIX } from '@/utils/constants';
import network from '@/utils/network';
import { getItem } from '@/utils/storage';

 const landlord: any = getItem('USER');
const list = (search: string, page: number, size: number) => {
  return network.get(`${INVOICE_PREFIX}/`, {
    landlord_id: landlord?.landlordId || '',
    search: '' + search,
    page,
    size,
  });
};

const create = (data: any) => {
  return network.post(`${INVOICE_PREFIX}/create`, data);
};

const update = (id: string, data: any) => {
  return network.post(`${INVOICE_PREFIX}/update/${id}`, data);
};

const deleteMethod = (id: string) => {
  return network.post(`${INVOICE_PREFIX}/delete/${id}`, {});
};

export default {
  list,
  create,
  update,
  deleteMethod,
};
