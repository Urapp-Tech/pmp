const HOST = 'https://dev.urapptech.com';
export const BASE_URL =
  import.meta.env.VITE_BASE_URL || `${HOST}/api/v1/admin/`;
export const BASE_SYSTEM_URL =
  import.meta.env.VITE_SYSTEM_BASE_URL || `${HOST}/api/v1/system/config/`;
export const BACKOFFICE_PREFIX = 'office-user';
export const USER_PREFIX = 'user';
export const EMPLOYEE_PREFIX = 'employee';
export const CABIN_PREFIX = 'cabin';
export const DASHBOARD_PREFIX = 'dashboard';
export const SETTING_PREFIX = 'setting';
export const OPERATON_CAT_PREFIX = 'operation-category';
export const OPERATON_CAT_ITEM_PREFIX = 'operation-category-item';
export const OPERATON_REPORT_PREFIX = 'operation-report';
export const ROLE_PREFIX = 'role';
export const BLOG_PREFIX = 'blog';

export const imageAllowedTypes = ['image/png', 'image/jpeg', 'image/jpg'];
