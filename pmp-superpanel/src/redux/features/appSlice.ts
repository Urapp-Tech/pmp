import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { setItem } from '../../utils/storage';

type AppState = {
  shopItems: any;
};

const initialState: AppState = {
  shopItems: null,
};

export const appSlice = createSlice({
  name: 'appSlice',
  initialState,
  reducers: {
    setShopTenantState: (state, action: PayloadAction<any>) => {
      state.shopItems = {
        ...state.shopItems,
        ...action.payload,
      };
      setItem('SHOP_TENANT', state.shopItems);
    },
    setRemoveShopTenantState: (state) => {
      state.shopItems = null;
    },
  },
});

export const { setShopTenantState, setRemoveShopTenantState } =
  appSlice.actions;

export default appSlice.reducer;
