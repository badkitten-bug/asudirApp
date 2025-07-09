import { configureStore } from "@reduxjs/toolkit"
import authReducer from "./authSlice"
import snackbarReducer from "./snackbarSlice"
import ticketsReducer from "./ticketsSlice"
import signedTicketsReducer from "./signedTicketsSlice"
import pozosReducer from "./pozosSlice"
import pendingLecturasReducer from './pendingLecturasSlice';
import { useDispatch as useReduxDispatch, useSelector as useReduxSelector } from "react-redux"
import type { TypedUseSelectorHook } from "react-redux"

export const store = configureStore({
  reducer: {
    auth: authReducer,
    snackbar: snackbarReducer,
    tickets: ticketsReducer,
    signedTickets: signedTicketsReducer,
    pozos: pozosReducer,
    pendingLecturas: pendingLecturasReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
      immutableCheck: false,
    }),
})

// Tipos para el store
export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch

// Hooks tipados para usar en lugar de los hooks normales de react-redux
export const useDispatch = () => useReduxDispatch<AppDispatch>()
export const useSelector: TypedUseSelectorHook<RootState> = useReduxSelector

export * from './pendingLecturasSlice';

