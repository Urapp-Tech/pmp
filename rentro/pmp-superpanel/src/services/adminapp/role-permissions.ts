import { ROLE_PREFIX } from '@/utils/constants';
import network from '@/utils/network';

const list = (qp: any) => {
  return network.get(`${ROLE_PREFIX}/list`, qp, 'super');
};

const create = (data: any) => {
  return network.post(`${ROLE_PREFIX}/create`, data, 'super');
};

const update = (id: string, data: any) => {
  return network.post(`${ROLE_PREFIX}/update/${id}`, data, 'super');
};

const deleteRole = (id: string) => {
  return network.post(`${ROLE_PREFIX}/delete/${id}`, {}, 'super');
};

const lov = () => {
  return network.get(`${ROLE_PREFIX}/lov`, {}, 'super');
};

const PERMISSIONS = 'permissions';
// PERMISSIONS
const permissionList = () => {
  return network.get(`${PERMISSIONS}/list`, {}, 'super');
};

export default {
  list,
  create,
  update,
  deleteRole,
  lov,
  permissionList,
};
