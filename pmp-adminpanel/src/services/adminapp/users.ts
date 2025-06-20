import { SUB_USER_PREFIX, USER_PREFIX } from '@/utils/constants';
import network from '@/utils/network';

const managerslist = (
  landlordId: string,
  search: string,
  page: number,
  size: number
) => {
  return network.get(`${USER_PREFIX}/manager-list/${landlordId}`, {
    search,
    page,
    size,
  });
};

const userslist = (
  userId: string,
  search: string,
  page: number,
  size: number
) => {
  return network.get(`${USER_PREFIX}/user-list/${userId}`, {
    search,
    page,
    size,
  });
};

const create = (data: any) => {
  return network.postMultipart(`${USER_PREFIX}/create`, data);
};

const update = (id: string, data: any) => {
  return network.postMultipart(`${SUB_USER_PREFIX}/update/${id}`, data);
};

const deleteUser = (id: string) => {
  return network.post(`${SUB_USER_PREFIX}/delete/${id}`, {});
};

const Lov = (id: string) => {
  return network.get(`${USER_PREFIX}/lov/${id}`, {});
};

const assignUsers = (data: any) => {
  return network.post(`managers/assign`, data);
};

export default {
  managerslist,
  userslist,
  create,
  update,
  deleteUser,
  Lov,
  assignUsers,
};
