"use client"

import { useEffect } from "react"
import { Stack } from "expo-router"
import { Provider } from "react-redux"
import { store } from "../store"
import Snackbar from "../components/Snackbar"
import { loadUser } from "../store/authSlice"
import { View, ActivityIndicator, Text } from "react-native"
import { useDispatch, useSelector } from "../store"
// Agregar la importación de loadTickets, loadSignedTickets y loadPozos
import { loadTickets } from "../store/ticketsSlice"
import { loadSignedTickets } from "../store/signedTicketsSlice"
import { loadPozos } from "../store/pozosSlice"

// Agregar la carga de tickets al iniciar la app
function AuthWrapper() {
  const dispatch = useDispatch()
  const { isAuthenticated, isLoading } = useSelector((state:any) => state.auth)

  useEffect(() => {
    // Cargar usuario y tickets al iniciar la app
    const loadData = async () => {
      try {
        await dispatch(loadUser())
        if (isAuthenticated) {
          await dispatch(loadTickets())
          await dispatch(loadSignedTickets())
          await dispatch(loadPozos())
        }
      } catch (error) {
        console.error("Error al cargar datos:", error)
      }
    }

    loadData()
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
      <AuthWrapper />
      <Snackbar />
    </Provider>
  )
}

