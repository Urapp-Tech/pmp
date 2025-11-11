import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { setItem } from '../../utils/storage';

type AppState = {
  shopItems: any;
  collapsedSidebar: boolean;
};

const initialState: AppState = {
  shopItems: null,
  collapsedSidebar: true,
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
    setCollapsedSidebar: (state, action: PayloadAction<boolean>) => {
      state.collapsedSidebar = action.payload;
      setItem('COLLAPSED_SIDEBAR', state.collapsedSidebar);
    },
  },
});

export const {
  setShopTenantState,
  setRemoveShopTenantState,
  setCollapsedSidebar,
} = appSlice.actions;

export default appSlice.reducer;
