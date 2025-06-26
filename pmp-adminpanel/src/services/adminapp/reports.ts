import { REPORT_PREFIX } from '@/utils/constants';
import network from '@/utils/network';
import { getItem } from '@/utils/storage';

 const userDetails: any = getItem('USER');

const getReport = (data: any) => {
  data.user_id = userDetails?.id || '';
  data.role_id = userDetails?.role?.name || '';
  return network.post(`${REPORT_PREFIX}/invoices`, data);
};
export default {
  getReport,
};
