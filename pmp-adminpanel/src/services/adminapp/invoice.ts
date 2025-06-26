import { INVOICE_PREFIX,TANENT_PREFIX, INVOICE_ITEM_PREFIX } from '@/utils/constants';
import network from '@/utils/network';
import { getItem } from '@/utils/storage';

 const landlord: any = getItem('USER');
const list = ( search: string, page: number, size: number,landlord_id?: string) => {
  return network.get(`${INVOICE_PREFIX}/`, {
    //  params: {
 landlord_id: landlord?.landlordId || '',
    search: '' + search,
      page,
      size,
    // },
  });
};

const create = (data: any) => {
  data.landlord_id = landlord?.landlordId || '';
  return network.post(`${INVOICE_PREFIX}/create`, data);
};

const update = (id: string, data: any) => {
  return network.post(`${INVOICE_PREFIX}/update/${id}`, data);
};

const get_invoice = (id: string, data: any) => {
  return network.post(`${INVOICE_PREFIX}/update/${id}`, data);
};

const deleteMethod = (id: string) => {
  return network.post(`${INVOICE_PREFIX}/delete/${id}`, {});
};


const get_all_tanents = (id?: string) => {
  const landlordId = id || landlord?.landlordId || '';
  return network.get(`${TANENT_PREFIX}/by-landlord/${landlordId}`);
};


const getInvoiceItems = (
  invoiceId: string,
  page = 1,
  size = 5
) => {
  return network.get(`${INVOICE_ITEM_PREFIX}/`, {
      invoice_id: invoiceId,
      page,
      size,
  });
};
const createInvoiceItem  = ( data: any) => {
  return network.postMultipart(`${INVOICE_ITEM_PREFIX}/`, data);
};
const updateInvoiceItem = (id: string, data: any) => {
  return network.postMultipart(`${INVOICE_ITEM_PREFIX}/${id}/`, data);
};

const getInvoiceItemById = (id: string) => {
  return network.get(`${INVOICE_ITEM_PREFIX}/${id}/`);
};

const getReport = (data: any) => {
  return network.post(`${INVOICE_PREFIX}/report/`, data);
};
const approveRejectInvoiceItem = (
  id: string,
  action: 'approved' | 'rejected',
  payload: { remarks: string }
) => {
  const finalPayload = {
    ...payload,
    user_id: landlord?.id || '',
  };

  return network.post(`${INVOICE_ITEM_PREFIX}/${id}/${action}`, finalPayload);
};

export default {
  list,
  create,
  update,
  get_invoice,
  getInvoiceItemById,
  updateInvoiceItem,
  createInvoiceItem,
  get_all_tanents,
  approveRejectInvoiceItem,
  getInvoiceItems,
  deleteMethod,
};
