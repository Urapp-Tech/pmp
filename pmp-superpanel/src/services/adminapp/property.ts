import { PROPERTY_PREFIX, PROPERTY_UNIT_PREFIX } from '@/utils/constants';
import network from '@/utils/network';

const list = (
  userId: string,
  roleId: string,
  search: string,
  page: number,
  size: number
) => {
  return network.get(`${PROPERTY_PREFIX}/super-admin/view`, {
    user_id: userId,
    role_id: roleId,
    search: '' + search,
    page,
    size,
  });
};

const create = (data: any) => {
  return network.postMultipart(`${PROPERTY_PREFIX}/create`, data);
};
const getUnitsByPropertyId = (
  propertyId: string,
  search: string,
  page: number,
  size: number
) => {
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

const Lov = (userId: string) => {
  return network.get(`${PROPERTY_UNIT_PREFIX}/lov/${userId}`, {});
};

const availableLov = (landlordId: string) => {
  return network.get(`${PROPERTY_UNIT_PREFIX}/available-lov/${landlordId}`, {});
};

const updateToggleStatus = (id: string, data: any) => {
  return network.post(
    `${PROPERTY_PREFIX}/toggle-status/${id}?is_active=${data.is_active}`,
    {}
  );
};

export default {
  list,
  getUnitsByPropertyId,
  getPropertyId,
  create,
  update,
  updateToggleStatus,
  deleteProperty,
  Lov,
  availableLov,
};
