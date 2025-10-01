import { SUBS_PREFIX } from '@/utils/constants';
import network from '@/utils/network';

const list = (qp: any) => {
  return network.get(`${SUBS_PREFIX}/subscribed-landlords/list`, qp);
};

const approve = (id: string, adminUserId: string) => {
  const url = `${SUBS_PREFIX}/subscribed-landlords/approve/${id}?admin_user_id=${adminUserId}`;
  return network.post(url, {});
};

const reject = (
  id: string,
  body: { reason?: string | null },
  adminUserId: string
) => {
  const payload = { reason: body?.reason ?? null };
  const url = `${SUBS_PREFIX}/subscribed-landlords/reject/${id}/?admin_user_id=${adminUserId}`;
  return network.post(url, payload);
};

export default {
  list,
  approve,
  reject,
};
