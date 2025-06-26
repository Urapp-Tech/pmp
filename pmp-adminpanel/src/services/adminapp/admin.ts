import { BACKOFFICE_PREFIX } from '@/utils/constants';
import network from '@/utils/network';

const USERS = 'users';

const loginService = (userData: { email: string; password: string }) => {
  return network.post(`${USERS}/login`, userData);
};

const systemConfig = (domain: string) => {
  return network.get(`get/${domain}`, {}, 'system');
};

const activity = (landlordId: string) => {
  return network.get(`dashboard/landlord-activity/${landlordId}`, {}, 'super');
};

const managerActivity = (landlordId: string, managerUserId: string) => {
  return network.get(
    `dashboard/manager/stats`,
    {
      landlord_id: landlordId,
      user_id: managerUserId,
    },
    'super'
  );
};

export default {
  loginService,
  systemConfig,
  activity,
  managerActivity,
};
