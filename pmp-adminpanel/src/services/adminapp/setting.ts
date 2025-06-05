import { SETTING_PREFIX } from '@/utils/constants';
import network from '@/utils/network';

const getSetting = () => {
  return network.get(`${SETTING_PREFIX}/get`);
};

const updateSetting = (data: any) => {
  return network.postMultipart(`${SETTING_PREFIX}/update`, data);
};

export default {
  getSetting,
  updateSetting,
};
