import { REPORT_PREFIX } from '@/utils/constants';
import network from '@/utils/network';
// import { getItem } from '@/utils/storage'

const getReport = (data: any) => {
  data.user_id = data?.id;
  data.role_id = data?.role;
  return network.post(`${REPORT_PREFIX}/invoices`, data);
};
const getInvoiceDetail = (invoiceId: string) => {
  return network.get(`${REPORT_PREFIX}/invoice/detail/${invoiceId}`);
};

export default {
  getReport,
  getInvoiceDetail,
};
