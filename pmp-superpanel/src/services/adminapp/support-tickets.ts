import network from '@/utils/network';

const SUPPORT_TICKETS = 'support-tickets';

const list = (
  id: any,
  roleId: any,
  roleType: any,
  search: string,
  status: string,
  page: number,
  size: number
) => {
  return network.get(`${SUPPORT_TICKETS}/list/${id}/${roleId}`, {
    roleType,
    search,
    status,
    page,
    size,
  });
};

const create = (data: any) => {
  return network.postMultipart(`${SUPPORT_TICKETS}/create`, data);
};

const statusChange = (data: any) => {
  return network.post(`${SUPPORT_TICKETS}/update-status`, data);
};

export default {
  list,
  create,
  statusChange,
};
