import { createSlice, PayloadAction } from '@reduxjs/toolkit';
// import setThemeColor from '../../utils/setThemeColor';
import { getItem, removeItem, setItem } from '../../utils/storage';

type User = {
  id: string;
  firstName: string;
  lastName: string;
  username: string;
  tenant: string;
  tenantConfig: unknown;
  isActive: boolean;
  isSuperAdmin: boolean;
  avatar: string;
  branchLimit: number;
  employeeLimit: number;
  userLimit: number;
  anonAppUser: string;
};

// type ShopTenantDetails = {
//   tenant: string;
//   tenantName: string;
//   maxEmployeeLimit: string;
//   branchLimit: string;
// };

// interface SystemConfig {
//   createdDate: string;
//   domain: string;
//   id: string;
//   logoffImage: string;
//   tenant: string;
//   shopName: string;
//   shopLogo: string;
// }

type AuthState = {
  token: AuthState;
  user: User | null | unknown;
  // theme: null;
  // shopTenantDetails: ShopTenantDetails | null;
  // systemConfig: SystemConfig | null;
};

function getUser() {
  const user = getItem<unknown>('USER');
  return user;
}

// function getTheme() {
//   const theme = getItem<any>('THEME');
//   // if (theme) {
//   //   setThemeColor(theme);
//   // }
//   return theme;
// }

const initialState: AuthState | any = {
  user: getUser(),
  // theme: getTheme(),
};

export const authSlice = createSlice({
  name: 'authSlice',
  initialState,
  reducers: {
    login: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
      setItem('USER', action.payload);
    },
    logout: (state) => {
      state.user = null;
      removeItem('USER');
    },
    setSystemConfig: (state, action: PayloadAction<any>) => {
      if (state.systemConfig) {
        state.systemConfig = {
          ...state.systemConfig,
          tenantLogo: action.payload.tenantLogo,
          tenantBanner: action.payload.tenantBanner,
        };
      } else {
        state.systemConfig = action.payload;
      }
      setItem('SYSTEM_CONFIG', state.systemConfig);
    },
  },
});

export const { login, logout, setSystemConfig } = authSlice.actions;

export default authSlice.reducer;
