import { DASHBOARD_PREFIX } from '@/utils/constants';
import network from '@/utils/network';

const activity = () => network.get(`${DASHBOARD_PREFIX}/activity`);

const contacts = (search: string, page: number, size: number) => {
  return network.get(`contacts`, {
    search,
    page,
    size,
  });
};
const contact = (data: any) => {
  return network.postMultipart(`contact`, data);
};
const deleteContact = (id: string) => {
  return network.post(`contact/delete/${id}`, {});
};
export default {
  activity,
  contacts,
  contact,
  deleteContact
};
