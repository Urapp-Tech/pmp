import network from '@/utils/network';

const LANDLORD_USERS = 'landlord-users';

const getService = () => {
  return network.get(`${LANDLORD_USERS}/list`, {});
};

const createService = (userData: any) => {
  return network.post(`${LANDLORD_USERS}/create`, userData);
};

const updateService = (id: string, userData: any) => {
  return network.post(`${LANDLORD_USERS}/update/${id}`, userData);
};

const deleteService = (id: string) => {
  return network.post(`${LANDLORD_USERS}/delete/${id}`, {});
};

export default {
  getService,
  createService,
  updateService,
  deleteService,
};
