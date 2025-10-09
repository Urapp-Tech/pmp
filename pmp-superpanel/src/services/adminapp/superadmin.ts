import network from '@/utils/network';

// const SUPER_USER = 'super-users';

const list = (qp: any) => {
  return network.get(`list`, qp, 'super');
};

const create = (data: any) => {
  return network.post(`create`, data, 'super');
};

const update = (id: string, data: any) => {
  return network.post(`update/${id}`, data, 'super');
};

export default {
  list,
  create,
  update,
};
