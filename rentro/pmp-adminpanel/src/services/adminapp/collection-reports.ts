import network from '@/utils/network';

const COLLECTION = 'collections';

const list = (qp: any) => {
  return network.get(`${COLLECTION}/list`, qp);
};

export default {
  list,
};
