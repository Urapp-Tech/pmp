import { BACKOFFICE_PREFIX } from '@/utils/constants';
import network from '@/utils/network';

const USERS = 'landlord-users';
const TENANT_USERS = 'users';

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

const tenantUserList = (search: string, page: number, size: number) => {
  return network.get(`${TENANT_USERS}/tenant-users/list`, {
    search,
    page,
    size,
  });
};

const verifyUser = (data: any) => {
  return network.post(`${USERS}/verify`, data);
};

export default {
  list,
  unverifiedList,
  tenantUserList,
  verifyUser,
};
