"use client"
import { View, Text, TouchableOpacity, ScrollView, StatusBar as RNStatusBar } from "react-native"
import { StatusBar } from "expo-status-bar"
import { Ionicons } from "@expo/vector-icons"
import Constants from "expo-constants"
import { useControlPanel } from "@/features/control-panel/hooks/useControlPanel"
import { ControlPanelCard } from "@/features/control-panel/components/ControlPanelCard"
import { controlPanelStyles } from "@/features/control-panel/styles/controlPanel.styles"

const STATUSBAR_HEIGHT = Constants.statusBarHeight || 0

export default function ControlPanel() {
  const { pendingTickets, todayTickets, pozos, handleNewCapture, handleSync } = useControlPanel()

  return (
    <View style={controlPanelStyles.container}>
      {/* Configuración del StatusBar nativo */}
      <RNStatusBar backgroundColor="#f5f5f5" barStyle="dark-content" translucent={true} />

      {/* StatusBar de Expo como respaldo */}
      <StatusBar style="dark" />

      {/* Espacio para el StatusBar */}
      <View style={{ height: STATUSBAR_HEIGHT, backgroundColor: "#f5f5f5" }} />

      <View style={controlPanelStyles.header}>
        <Text style={controlPanelStyles.headerTitle}>Panel de Control</Text>
      </View>

      <ScrollView style={controlPanelStyles.content} contentContainerStyle={controlPanelStyles.contentContainer}>
        <TouchableOpacity style={controlPanelStyles.newCaptureButton} onPress={handleNewCapture}>
          <Ionicons name="add" size={20} color="#fff" />
          <Text style={controlPanelStyles.newCaptureText}>Nueva Captura</Text>
        </TouchableOpacity>

        <ControlPanelCard
          title="Capturas Pendientes"
          value={pendingTickets.length}
          subtitle="Pozos pendientes de captura"
          icon="document-text-outline"
          valueColor="#e74c3c"
        />

        <ControlPanelCard
          title="Capturas Recientes"
          value={todayTickets.length}
          subtitle="Capturas realizadas hoy"
          icon="time-outline"
          valueColor="#00A86B"
        />

        <ControlPanelCard
          title="Sincronización"
          value={pendingTickets.length > 0 ? `${pendingTickets.length} pendientes` : "Actualizado"}
          subtitle={`${pozos.length} pozos disponibles`}
          icon="sync-outline"
          onPress={handleSync}
          valueColor="#f39c12"
        />
      </ScrollView>
    </View>
  )
}




