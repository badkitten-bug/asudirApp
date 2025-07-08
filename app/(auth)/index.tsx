"use client"

import { View, Text, TouchableOpacity, ScrollView, StatusBar as RNStatusBar } from "react-native"
import { StatusBar } from "expo-status-bar"
import { Ionicons } from "@expo/vector-icons"
import Constants from "expo-constants"
import { useDashboard } from "@/features/dashboard/hooks/useDashboard"
import { DashboardCard } from "@/features/dashboard/components/DashboardCard"
import { dashboardStyles } from "@/features/dashboard/styles/dashboard.styles"

const STATUSBAR_HEIGHT = Constants.statusBarHeight || 0

export default function ControlPanel() {
  const {
    pendingTickets,
    todayTickets,
    pozos,
    handleNewCapture,
    handleSync,
  } = useDashboard()

  return (
    <View style={dashboardStyles.container}>
      {/* Configuración del StatusBar */}
      <RNStatusBar backgroundColor="#f5f5f5" barStyle="dark-content" translucent={true} />
      <StatusBar style="dark" />

      {/* Espacio para el StatusBar */}
      <View style={{ height: STATUSBAR_HEIGHT, backgroundColor: "#f5f5f5" }} />

      <View style={dashboardStyles.header}>
        <Text style={dashboardStyles.headerTitle}>Panel de Control</Text>
      </View>

      <ScrollView style={dashboardStyles.content} contentContainerStyle={dashboardStyles.contentContainer}>
        <TouchableOpacity style={dashboardStyles.newCaptureButton} onPress={handleNewCapture}>
          <Ionicons name="add" size={20} color="#fff" />
          <Text style={dashboardStyles.newCaptureText}>Nueva Captura</Text>
        </TouchableOpacity>

        <DashboardCard
          title="Capturas Pendientes"
          value={pendingTickets.length}
          subtitle="Pozos pendientes de captura"
          icon="document-text-outline"
          color="#00A86B"
        />

        <DashboardCard
          title="Capturas Recientes"
          value={todayTickets.length}
          subtitle="Capturas realizadas hoy"
          icon="time-outline"
          color="#00A86B"
        />

        <DashboardCard
          title="Sincronización"
          value={pendingTickets.length > 0 ? `${pendingTickets.length} pendientes` : "Actualizado"}
          subtitle={`${pozos.length} pozos disponibles`}
          icon="sync-outline"
          color="#00A86B"
          onPress={handleSync}
        />
      </ScrollView>
    </View>
  )
}

