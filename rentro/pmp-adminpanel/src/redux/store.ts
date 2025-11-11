import { combineReducers, configureStore } from '@reduxjs/toolkit';
import appStateReducer from './features/appSlice';
import authStateReducer from './features/authSlice';

// Combine all reducers into a root reducer
const rootReducer = combineReducers({
  appState: appStateReducer,
  authState: authStateReducer,
});

// Configure the store
export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

// Define RootState and AppDispatch types for type safety
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
