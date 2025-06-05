import { BACKOFFICE_PREFIX } from '@/utils/constants';
import network from '@/utils/network';

const USERS = 'users';

const loginService = (userData: { email: string; password: string }) => {
  return network.post(`${USERS}/login`, userData);
};

const systemConfig = (domain: string) => {
  return network.get(`get/${domain}`, {}, 'system');
};

export default {
  loginService,
  systemConfig,
};
