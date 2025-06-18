import { BACKOFFICE_PREFIX } from '@/utils/constants';
import network from '@/utils/network';

const USERS = 'users';

const loginService = (userData: { email: string; password: string }) => {
  return network.post(`login`, userData, 'super');
};

const systemConfig = (domain: string) => {
  return network.get(`get/${domain}`, {}, 'system');
};

export default {
  loginService,
  systemConfig,
};
