import {
  INVOICE_PREFIX,
  TENANTS_PREFIX,
  INVOICE_ITEM_PREFIX,
} from '@/utils/constants';
import network from '@/utils/network';

const list = (
  id: string,
  roleName: string,
  search: string,
  page: number,
  size: number,
  landlord_id?: string
) => {
  return network.get(`${INVOICE_PREFIX}/`, {
    //  landlord_id: landlord?.landlordId || '',
    user_id: id || '',
    role_id: roleName || '',
    search: '' + search,
    page,
    size,
  });
};

const create = (data: any) => {
  // data.landlord_id = userDetails?.landlordId || '';
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
  const landlordId = id || '';
  return network.get(`${TENANTS_PREFIX}/by-landlord/${landlordId}`, {
    landlord_id: landlordId || '',
  });
};

const getInvoiceItems = (invoiceId: string, page = 1, size = 5) => {
  return network.get(`${INVOICE_ITEM_PREFIX}/`, {
    invoice_id: invoiceId,
    page,
    size,
  });
};
const createInvoiceItem = (data: any) => {
  return network.postMultipart(`${INVOICE_ITEM_PREFIX}/`, data);
};
const updateInvoiceItem = (id: string, data: any) => {
  return network.postMultipart(`${INVOICE_ITEM_PREFIX}/${id}/`, data);
};

const getInvoiceItemById = (id: string) => {
  return network.get(`${INVOICE_ITEM_PREFIX}/${id}/`);
};

const approveRejectInvoiceItem = (
  id: string,
  action: 'approved' | 'rejected',
  payload: { remarks: string; user_id: string }
) => {
  const finalPayload = {
    ...payload,
    // user_id: userDetails?.id || '',
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
