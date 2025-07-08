"use client"
import { View, StatusBar as RNStatusBar } from "react-native"
import { StatusBar } from "expo-status-bar"
import Constants from "expo-constants"
import { PerfilInfo } from "@/features/perfil/components/PerfilInfo"
import { usePerfil } from "@/features/perfil/hooks/usePerfil"

const STATUSBAR_HEIGHT = Constants.statusBarHeight || 0

export default function PerfilScreen() {
  const { user, isLoading, handleLogout, handleSync } = usePerfil()

  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      {/* Configuración del StatusBar nativo */}
      <RNStatusBar backgroundColor="#fff" barStyle="dark-content" translucent={true} />

      {/* StatusBar de Expo como respaldo */}
      <StatusBar style="dark" />

      {/* Espacio para el StatusBar */}
      <View style={{ height: STATUSBAR_HEIGHT, backgroundColor: "#fff" }} />

      <PerfilInfo
        user={user}
        onLogout={handleLogout}
        onSync={handleSync}
        isLoading={isLoading}
      />
    </View>
  )
}

