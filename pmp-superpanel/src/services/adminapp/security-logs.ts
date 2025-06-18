// import { BACKOFFICE_PREFIX } from '@/utils/constants';
import network from '@/utils/network';

const SECURITY_LOGS = 'security-logs';

// const getSecurityLogs = () => {
//   return network.get(`${SECURITY_LOGS}/logs`, {}, 'super');
// };
const getSecurityLogs = (search: string, page: number, size: number) => {
  return network.get(
    `${SECURITY_LOGS}/logs`,
    {
      search,
      page,
      size,
    },
    'super'
  );
};

const systemConfig = (domain: string) => {
  return network.get(`get/${domain}`, {}, 'system');
};

export default {
  getSecurityLogs,
  systemConfig,
};
