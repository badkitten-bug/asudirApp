"use client"

import React from "react"
import { useEffect } from "react"
import { Stack } from "expo-router"
import { Provider } from "react-redux"
import Snackbar from "../components/Snackbar"
import { loadUser } from "../store/authSlice"
import { View, ActivityIndicator, Text } from "react-native"
import { useDispatch, useSelector,store } from "../store"
// Agregar la importación de loadTickets, loadSignedTickets y loadPozos
import { loadTickets } from "../store/ticketsSlice"
import { loadSignedTickets } from "../store/signedTicketsSlice"
import { loadPozos } from "../store/pozosSlice"
import NetInfo from '@react-native-community/netinfo';
import { syncTickets } from '../store/ticketsSlice';
import { useSyncPendingLecturas } from '../hooks/useSyncPendingLecturas';
import { PersistGate } from 'redux-persist/integration/react';
import { persistor } from '../store';

function useAutoSyncTickets() {
  const dispatch = useDispatch();
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      if (state.isConnected) {
        dispatch(syncTickets());
      }
    });
    return () => unsubscribe();
  }, [dispatch]);
}

// Agregar la carga de tickets al iniciar la app
function AuthWrapper() {
  const dispatch = useDispatch()
  const { isAuthenticated, isLoading } = useSelector((state:any) => state.auth)

  useAutoSyncTickets();
  useSyncPendingLecturas();

  useEffect(() => {
    let isMounted = true;
    // Cargar usuario y tickets al iniciar la app
    const loadData = async () => {
      try {
        await dispatch(loadUser())
        if (isMounted && isAuthenticated) {
          await dispatch(loadTickets())
          await dispatch(loadSignedTickets())
          await dispatch(loadPozos())
        }
      } catch (error) {
        if (isMounted) {
          console.error("Error al cargar datos:", error)
        }
      }
    }

    loadData()
    return () => { isMounted = false }
  }, [dispatch, isAuthenticated])

  // Mostrar indicador de carga mientras verificamos la autenticación
  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#f5f5f5" }}>
        <ActivityIndicator size="large" color="#00A86B" />
        <Text style={{ marginTop: 16, color: "#333", fontSize: 16 }}>Cargando...</Text>
      </View>
    )
  }

  // Redirigir según el estado de autenticación
  return (
    <Stack screenOptions={{ headerShown: false }}>
      {isAuthenticated ? (
        <>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="(auth)" options={{ presentation: "modal" }} />
        </>
      ) : (
        <>
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="(tabs)" options={{ presentation: "modal" }} />
        </>
      )}
    </Stack>
  )
}

// Componente principal
export default function RootLayout() {
  return (
    <Provider store={store}>
      <PersistGate loading={<View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f5f5f5' }}><ActivityIndicator size="large" color="#00A86B" /><Text style={{ marginTop: 16, color: '#333', fontSize: 16 }}>Cargando datos locales...</Text></View>} persistor={persistor}>
        <AuthWrapper />
        <Snackbar />
      </PersistGate>
    </Provider>
  )
}

