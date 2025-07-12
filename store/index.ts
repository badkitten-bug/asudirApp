import { configureStore, combineReducers } from "@reduxjs/toolkit"
import { persistStore, persistReducer } from "redux-persist"
import AsyncStorage from "@react-native-async-storage/async-storage"
import authReducer from "./authSlice"
import snackbarReducer from "./snackbarSlice"
import ticketsReducer from "./ticketsSlice"
import signedTicketsReducer from "./signedTicketsSlice"
import pozosReducer from "./pozosSlice"
import pendingLecturasReducer from './pendingLecturasSlice';
import { useDispatch as useReduxDispatch, useSelector as useReduxSelector } from "react-redux"
import type { TypedUseSelectorHook } from "react-redux"

const rootReducer = combineReducers({
  auth: authReducer,
  snackbar: snackbarReducer,
  tickets: ticketsReducer,
  signedTickets: signedTicketsReducer,
  pozos: pozosReducer,
  pendingLecturas: pendingLecturasReducer,
});

const persistConfig = {
  key: "root",
  storage: AsyncStorage,
  whitelist: ["pendingLecturas"], // Solo persistir lecturas pendientes
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
      immutableCheck: false,
    }),
});

export const persistor = persistStore(store);

// Tipos para el store
export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch

// Hooks tipados para usar en lugar de los hooks normales de react-redux
export const useDispatch = () => useReduxDispatch<AppDispatch>()
export const useSelector: TypedUseSelectorHook<RootState> = useReduxSelector

export * from './pendingLecturasSlice';

