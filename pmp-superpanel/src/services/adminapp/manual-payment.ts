import { MANUAL_PAYMENT_PREFIX } from '@/utils/constants';
import network from '@/utils/network';

const list = (qp: any) => {
  return network.get(`${MANUAL_PAYMENT_PREFIX}/list`, qp);
};

const create = (actors: any, data: any) => {
  return network.postMultipart(
    `${MANUAL_PAYMENT_PREFIX}/create?admin_user_id=${actors.id}&role=${actors.role}&actor_id=${actors.id}`,
    data
  );
};

const update = (id: any, data: any) => {
  return network.postMultipart(`${MANUAL_PAYMENT_PREFIX}/update/${id}`, data);
};

const getInvoiceLov = (qp?: any) => {
  return network.get(`${MANUAL_PAYMENT_PREFIX}/invoices/lov`, qp);
};

export default {
  list,
  create,
  update,
  getInvoiceLov,
};
