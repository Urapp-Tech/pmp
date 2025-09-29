import network from '@/utils/network';

const BANK_TRANSACTION = 'bank-transaction';

const list = (search: string, page: number, size: number) => {
  return network.get(`${BANK_TRANSACTION}/list`, {
    search,
    page,
    size,
  });
};

export default { list };
