import {
  SUB_USER_PREFIX,
  USER_PREFIX,
  TENANTS_PREFIX,
} from '@/utils/constants';
import network from '@/utils/network';

const pendingList = (
  landlordId: string,
  search: string,
  page: number,
  size: number
) => {
  return network.get(`${TENANTS_PREFIX}/pending-list/${landlordId}`, {
    search,
    page,
    size,
  });
};

const approvedList = (
  landlordId: string,
  search: string,
  page: number,
  size: number
) => {
  return network.get(`${TENANTS_PREFIX}/approved-list/${landlordId}`, {
    search,
    page,
    size,
  });
};

const approvedUnit = (data: any) => {
  return network.post(`${TENANTS_PREFIX}/approve`, data);
};

const create = (data: any) => {
  return network.postMultipart(`${TENANTS_PREFIX}/contract-create`, data);
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

const assignUnits = (data: any) => {
  return network.post(`managers/assign-units`, data);
};

export default {
  pendingList,
  approvedList,
  approvedUnit,
  create,
  update,
  deleteUser,
  Lov,
  assignUnits,
};
