import { configureStore } from "@reduxjs/toolkit"
import authReducer from "./authSlice"
import snackbarReducer from "./snackbarSlice"
import ticketsReducer from "./ticketsSlice"
import pozosReducer from "./pozosSlice"
import { useDispatch as useReduxDispatch, useSelector as useReduxSelector } from "react-redux"
import type { TypedUseSelectorHook } from "react-redux"

// Middleware personalizado para logging
const loggerMiddleware = (store: any) => (next: any) => (action: any) => {
  if (__DEV__) {
    console.group(action.type);
    console.info('dispatching', action);
    const result = next(action);
    console.log('next state', store.getState());
    console.groupEnd();
    return result;
  }
  return next(action);
};

export const store = configureStore({
  reducer: {
    auth: authReducer,
    snackbar: snackbarReducer,
    tickets: ticketsReducer,
    pozos: pozosReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
      immutableCheck: false,
    }).concat(loggerMiddleware),
  devTools: __DEV__,
})

// Tipos para el store
export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch

// Hooks tipados para usar en lugar de los hooks normales de react-redux
export const useDispatch = () => useReduxDispatch<AppDispatch>()
export const useSelector: TypedUseSelectorHook<RootState> = useReduxSelector

