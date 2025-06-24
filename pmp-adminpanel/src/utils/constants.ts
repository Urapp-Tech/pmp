const HOST = 'https://dev.urapptech.com';
// export const BASE_URL =
//   import.meta.env.VITE_BASE_URL || `${HOST}/api/v1/admin/`;
export const BASE_URL =
  import.meta.env.VITE_BASE_URL || `${HOST}/api/v1/super-users/`;
export const ADMIN_BASE_URL =
  import.meta.env.VITE_ADMIN_BASE_URL || `${HOST}/api/v1/admin/`;
export const BASE_SYSTEM_URL =
  import.meta.env.VITE_SYSTEM_BASE_URL || `${HOST}/api/v1/system/config/`;
export const BACKOFFICE_PREFIX = 'office-user';
export const USER_PREFIX = 'users';
export const EMPLOYEE_PREFIX = 'employee';
export const CABIN_PREFIX = 'cabin';
export const DASHBOARD_PREFIX = 'dashboard';
export const SETTING_PREFIX = 'setting';
export const OPERATON_CAT_PREFIX = 'operation-category';
export const OPERATON_CAT_ITEM_PREFIX = 'operation-category-item';
export const OPERATON_REPORT_PREFIX = 'operation-report';
export const PROPERTY_PREFIX = 'properties';
export const SUB_USER_PREFIX = 'sub-user';
export const ROLE_PREFIX = 'roles';
export const INVOICE_PREFIX = 'invoices';
export const BLOG_PREFIX = 'blog';

export const imageAllowedTypes = ['image/png', 'image/jpeg', 'image/jpg'];

export const PERMISSIONS = {
  ROLE: {
    VIEW: 'View Roles Management',
    CREATE: 'Create Roles Management',
    UPDATE: 'Update Roles Management',
    DELETE: 'Delete Roles Management',
  },
  PLAN_FLEXIBILITY: {
    VIEW: 'View Plan Flexibity Management',
    CREATE: 'Create Plan Flexibity Management',
    UPDATE: 'Update Plan Flexibity Management',
    DELETE: 'Delete Plan Flexibity Management',
  },
  MAINTENANCE_REQUEST: {
    VIEW: 'View Maintaince Request Management',
    CREATE: 'Create Maintaince Request Management',
    UPDATE: 'Update Maintaince Request Management',
    DELETE: 'Delete Maintaince Request Management',
  },
  BANK_SETTLEMENT: {
    VIEW: 'View Bank Settlement Management',
    CREATE: 'Create Bank Settlement Management',
    UPDATE: 'Update Bank Settlement Management',
    DELETE: 'Delete Bank Settlement Management',
  },
  FINANCIAL_REPORT: {
    VIEW: 'View Financial Reports Management',
    CREATE: 'Create Financial Reports Management',
    UPDATE: 'Update Financial Reports Management',
    DELETE: 'Delete Financial Reports Management',
  },
  RECEIPT: {
    VIEW: 'View Receipts Management',
    CREATE: 'Create Receipts Management',
    UPDATE: 'Update Receipts Management',
    DELETE: 'Delete Receipts Management',
  },
  INVOICE: {
    VIEW: 'View Invoice Management',
    CREATE: 'Create Invoice Management',
    UPDATE: 'Update Invoice Management',
    DELETE: 'Delete Invoice Management',
  },
  PROPERTY: {
    VIEW: 'View Property Management',
    CREATE: 'Create Property Management',
    UPDATE: 'Update Property Management',
    DELETE: 'Delete Property Management',
  },
  USER: {
    VIEW: 'View User Management',
    CREATE: 'Create User Management',
    UPDATE: 'Update User Management',
    DELETE: 'Delete User Management',
  },
  MANAGER: {
    VIEW: 'View Manager Management',
    CREATE: 'Create Manager Management',
    UPDATE: 'Update Manager Management',
    DELETE: 'Delete Manager Management',
  },
  RENTAL_COLLECTION: {
    VIEW: 'View Rental Collection Management',
    CREATE: 'Create Rental Collection Management',
    UPDATE: 'Update Rental Collection Management',
    DELETE: 'Delete Rental Collection Management',
  },
  TENANT_RENTAL: {
    VIEW: 'View Tenant Rental Management',
    CREATE: 'Create Tenant Rental Management',
    UPDATE: 'Update Tenant Rental Management',
    DELETE: 'Delete Tenant Rental Management',
  },
};
