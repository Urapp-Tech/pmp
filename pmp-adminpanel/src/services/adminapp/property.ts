import { PROPERTY_PREFIX } from '@/utils/constants';
import network from '@/utils/network';
import { getItem } from '@/utils/storage';

 const landlord: any = getItem('USER');
const list = (search: string, page: number, size: number) => {
  return network.get(`${PROPERTY_PREFIX}/`, {
    landlord_id: landlord?.landlordId || '',
    search: '' + search,
    page,
    size,
  });
};

const create = (data: any) => {
  return network.postMultipart(`${PROPERTY_PREFIX}/create`, data);
};
const getUnitsByPropertyId = (propertyId: string, search: string, page: number, size: number) => {
  return network.get(`${PROPERTY_PREFIX}/units/${propertyId}`, {
    property_id: propertyId,
    search: '' + search,
    page,
    size,
  });
};
const getPropertyId = (propertyId: string) => {
  return network.get(`${PROPERTY_PREFIX}/${propertyId}`, {
    // property_id: propertyId,
  });
};

const update = (id: string, data: any) => {
  return network.postMultipart(`${PROPERTY_PREFIX}/update/${id}`, data);
};

const deleteProperty = (id: string) => {
  return network.post(`${PROPERTY_PREFIX}/delete/${id}`, {});
};

export default {
  list,
  getUnitsByPropertyId,
  getPropertyId,
  create,
  update,
  deleteProperty,
};
