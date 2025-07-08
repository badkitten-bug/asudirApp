"use client"

import { View, Text, TouchableOpacity } from "react-native"
import { StatusBar } from "expo-status-bar"
import { Ionicons } from "@expo/vector-icons"
import { useCapturas } from "@/features/capturas/hooks/useCapturas"
import { CapturasList } from "@/features/capturas/components/CapturasList"
import { capturasStyles } from "@/features/capturas/styles/capturas.styles"

export default function CarpetaRecibosScreen() {
  const {
    tickets,
    isLoading,
    refreshing,
    handleRefresh,
    handleVerTicket,
    handleSyncTickets,
  } = useCapturas()

  return (
    <View style={capturasStyles.container}>
      <StatusBar style="dark" />
      
      {/* Header */}
      <View style={capturasStyles.header}>
        <Text style={capturasStyles.headerTitle}>Carpeta de Recibos</Text>
        <TouchableOpacity style={capturasStyles.syncButton} onPress={handleSyncTickets}>
          <Ionicons name="sync" size={16} color="#fff" />
          <Text style={capturasStyles.syncButtonText}>Sincronizar</Text>
        </TouchableOpacity>
      </View>

      {/* Lista de tickets */}
      <CapturasList
        tickets={tickets}
        isLoading={isLoading}
        refreshing={refreshing}
        onRefresh={handleRefresh}
        onVerTicket={handleVerTicket}
        onSyncTickets={handleSyncTickets}
      />
    </View>
  )
}



