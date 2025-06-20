import network from '@/utils/network';

const SUPPORT_TICKETS = 'support-tickets';

const list = (
  id: any,
  roleId: any,
  search: string,
  status: string,
  page: number,
  size: number
) => {
  return network.get(`${SUPPORT_TICKETS}/list/${id}/${roleId}`, {
    search,
    status,
    page,
    size,
  });
};

const create = (data: any) => {
  return network.postMultipart(`${SUPPORT_TICKETS}/create`, data);
};

export default {
  list,
  create,
};
