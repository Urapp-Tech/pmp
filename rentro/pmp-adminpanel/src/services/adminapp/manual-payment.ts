import network from '@/utils/network';

const MANUAL_PAYMENT_PREFIX = 'manual-payments';

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

const getUnpaidInvoiceLov = (qp?: any) => {
  return network.get(`${MANUAL_PAYMENT_PREFIX}/unpaid-invoices/lov`, qp);
};

export default {
  list,
  create,
  update,
  getUnpaidInvoiceLov,
};
