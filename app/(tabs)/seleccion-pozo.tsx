"use client"

import { useState } from "react"
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StatusBar as RNStatusBar,
} from "react-native"
import { StatusBar } from "expo-status-bar"
import { Ionicons } from "@expo/vector-icons"
import Constants from "expo-constants"
import { usePozos } from "@/features/pozos/hooks/usePozos"
import { PozoList } from "@/features/pozos/components/PozoList"
import { pozoStyles } from "@/features/pozos/styles/pozo.styles"

const STATUSBAR_HEIGHT = Constants.statusBarHeight || 0

export default function SeleccionPozoScreen() {
  const [searchQuery, setSearchQuery] = useState("")

  const {
    pozos,
    isLoading,
    refreshing,
    handleRefresh,
    handleSelectPozo,
    checkPozoHasLectura,
  } = usePozos()

  // Filtrar pozos según la búsqueda
  const filteredPozos = pozos.filter(
    (pozo) =>
      pozo.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pozo.numeropozo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pozo.predio.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (pozo.bateria?.nombrebateria || '').toLowerCase().includes(searchQuery.toLowerCase()),
  )

  // Función para limpiar la búsqueda
  const handleClearSearch = () => {
    setSearchQuery("")
  }

  return (
    <View style={pozoStyles.container}>
      {/* Configuración del StatusBar */}
      <RNStatusBar backgroundColor="#f5f5f5" barStyle="dark-content" translucent={true} />
      <StatusBar style="dark" />

      {/* Espacio para el StatusBar */}
      <View style={{ height: STATUSBAR_HEIGHT, backgroundColor: "#f5f5f5" }} />

      {/* Header */}
      <View style={pozoStyles.header}>
        <Text style={pozoStyles.headerTitle}>Seleccionar Pozo</Text>
        <TouchableOpacity style={pozoStyles.refreshButton} onPress={handleRefresh}>
          <Ionicons name="refresh" size={16} color="#fff" />
          <Text style={pozoStyles.refreshButtonText}>Sincronizar</Text>
        </TouchableOpacity>
      </View>

      {/* Barra de búsqueda */}
      <View style={{ paddingHorizontal: 16, paddingVertical: 12, backgroundColor: '#fff' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#f5f5f5', borderRadius: 8, paddingHorizontal: 12 }}>
          <Ionicons name="search" size={20} color="#666" />
          <TextInput
            style={{ flex: 1, paddingVertical: 12, paddingHorizontal: 8, fontSize: 16 }}
            placeholder="Buscar pozo..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#999"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={handleClearSearch}>
              <Ionicons name="close-circle" size={20} color="#666" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Lista de pozos */}
      <PozoList
        pozos={filteredPozos}
        isLoading={isLoading}
        refreshing={refreshing}
        onRefresh={handleRefresh}
        onSelectPozo={handleSelectPozo}
        checkPozoHasLectura={checkPozoHasLectura}
      />
    </View>
  )
}
