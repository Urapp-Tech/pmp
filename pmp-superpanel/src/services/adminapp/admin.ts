import { BACKOFFICE_PREFIX } from '@/utils/constants';
import network from '@/utils/network';

const SUPER_USER = 'super_users';

const loginService = (userData: { email: string; password: string }) => {
  return network.post(`login`, userData, 'super');
};

const systemConfig = (domain: string) => {
  return network.get(`get/${domain}`, {}, 'system');
};

const activity = () => {
  return network.get(`dashboard/activity-summary`, {}, 'super');
};

export default {
  activity,
  loginService,
  systemConfig,
};
