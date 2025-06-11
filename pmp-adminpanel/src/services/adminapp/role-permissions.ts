import { ROLE_PREFIX } from '@/utils/constants';
import network from '@/utils/network';

const list = (qp: any) => {
  return network.get(`${ROLE_PREFIX}/list`, qp);
};

const create = (data: any) => {
  return network.post(`${ROLE_PREFIX}/create`, data);
};

const update = (id: string, data: any) => {
  return network.post(`${ROLE_PREFIX}/update/${id}`, data);
};

const deleteRole = (id: string) => {
  return network.post(`${ROLE_PREFIX}/delete/${id}`, {});
};

const lov = () => {
  return network.get(`${ROLE_PREFIX}/lov`);
};

// PERMISSIONS
const permissionList = () => {
  return network.get(`${ROLE_PREFIX}/permission/list`);
};

export default {
  list,
  create,
  update,
  deleteRole,
  lov,
  permissionList,
};
