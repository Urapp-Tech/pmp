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

const landlordReportedList = (
  landlordId: any,
  search: string,
  status: string,
  page: number,
  size: number
) => {
  return network.get(`${SUPPORT_TICKETS}/landlord-tickets/${landlordId}`, {
    search,
    status,
    page,
    size,
  });
};

const create = (data: any) => {
  return network.postMultipart(`${SUPPORT_TICKETS}/create`, data);
};

const update = (id: any, data: any) => {
  return network.postMultipart(`${SUPPORT_TICKETS}/update/${id}`, data);
};

const statusChange = (data: any) => {
  return network.post(`${SUPPORT_TICKETS}/update-status`, data);
};

const deleteTicket = (id: any) => {
  return network.post(`${SUPPORT_TICKETS}/delete/${id}`, {});
};

export default {
  list,
  landlordReportedList,
  create,
  update,
  statusChange,
  deleteTicket,
};
