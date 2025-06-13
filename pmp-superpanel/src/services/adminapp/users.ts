import { BACKOFFICE_PREFIX } from '@/utils/constants';
import network from '@/utils/network';

const USERS = 'landlord-users';

const list = (search: string, page: number, size: number) => {
  return network.get(`${USERS}/list`, {
    search,
    page,
    size,
  });
};

const unverifiedList = (search: string, page: number, size: number) => {
  return network.get(`${USERS}/unverified/list`, {
    search,
    page,
    size,
  });
};

// const create = (data: any) => {
//   return network.postMultipart(`${BACKOFFICE_PREFIX}/create`, data);
// };

// const update = (id: string, data: any) => {
//   return network.postMultipart(`${BACKOFFICE_PREFIX}/update/${id}`, data);
// };

// const deleteUser = (id: string) => {
//   return network.post(`${BACKOFFICE_PREFIX}/delete/${id}`, {});
// };

const verifyUser = (data: any) => {
  return network.post(`${USERS}/verify`, data);
};

export default {
  list,
  unverifiedList,
  // create,
  // update,
  // deleteUser,
  verifyUser,
};
