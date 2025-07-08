"use client"

import React, { useEffect, useState } from "react"
import { Stack, useRouter, usePathname } from "expo-router"
import { Provider } from "react-redux"
import Snackbar from "../components/Snackbar"
import { loadUser } from "../store/authSlice"
import { View, ActivityIndicator, Text } from "react-native"
import { useDispatch, useSelector, store } from "../store"
import { loadTickets } from "../store/ticketsSlice"
import { loadPozos } from "../store/pozosSlice"
import NetInfo from '@react-native-community/netinfo';
import { syncTickets } from '../store/ticketsSlice';

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

function AuthWrapper() {
  const dispatch = useDispatch();
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, isLoading } = useSelector((state: any) => state.auth);
  const [error, setError] = useState<string | null>(null);

  useAutoSyncTickets();

  // Cargar usuario y datos solo una vez al montar
  useEffect(() => {
    const loadAll = async () => {
      try {
        await dispatch(loadUser());
        await dispatch(loadTickets());
        await dispatch(loadPozos());
      } catch (err) {
        setError('Error al cargar datos iniciales.');
      }
    };
    loadAll();
  }, [dispatch]);

  // Redirigir si cambia el estado de autenticación
  useEffect(() => {
    if (!isLoading && typeof pathname === 'string') {
      if (isAuthenticated && pathname.startsWith('/(auth)')) {
        router.replace('/(tabs)');
      } else if (!isAuthenticated && !pathname.startsWith('/(auth)')) {
        router.replace('/(auth)');
      }
    }
  }, [isAuthenticated, isLoading, pathname, router]);

  if (error) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#fff" }}>
        <Text style={{ color: '#e74c3c', fontSize: 18, fontWeight: 'bold' }}>{error}</Text>
      </View>
    );
  }

  // Mostrar indicador de carga mientras verificamos la autenticación
  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#f5f5f5" }}>
        <ActivityIndicator size="large" color="#00A86B" />
        <Text style={{ marginTop: 16, color: "#333", fontSize: 16 }}>Cargando...</Text>
      </View>
    );
  }

  // Renderizar rutas según autenticación
  return (
    <Stack screenOptions={{ headerShown: false }}>
      {isAuthenticated ? (
        <Stack.Screen name="(tabs)" />
      ) : (
        <Stack.Screen name="(auth)" />
      )}
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <Provider store={store}>
      <AuthWrapper />
      <Snackbar />
    </Provider>
  );
}

