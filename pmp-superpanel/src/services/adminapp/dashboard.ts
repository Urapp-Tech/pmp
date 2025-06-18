import { DASHBOARD_PREFIX } from '@/utils/constants';
import network from '@/utils/network';

const activity = () => network.get(`${DASHBOARD_PREFIX}/activity`);

export default {
  activity,
};
