"use client"

import { View, Text, TouchableOpacity, FlatList, StatusBar as RNStatusBar, RefreshControl, TextInput } from "react-native"
import { StatusBar } from "expo-status-bar"
import { Ionicons } from "@expo/vector-icons"
import Constants from "expo-constants"
import { useRegistroLecturas } from "@/features/registro-lecturas/hooks/useRegistroLecturas"
import { LecturaItem } from "@/features/registro-lecturas/components/LecturaItem"
import { FiltrosSection } from "@/features/registro-lecturas/components/FiltrosSection"
import { EmptyState } from "@/features/registro-lecturas/components/EmptyState"
import { registroLecturasStyles } from "@/features/registro-lecturas/styles/registroLecturas.styles"
import { useSelector } from '@/store';

const STATUSBAR_HEIGHT = Constants.statusBarHeight || 0

export default function RegistroLecturasScreen() {
  // Proteger acceso a user
  const user = useSelector((state: any) => state.auth.user);
  if (!user) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
        <Text style={{ color: '#e74c3c', fontSize: 18, fontWeight: 'bold' }}>Debes iniciar sesión para ver las lecturas</Text>
      </View>
    );
  }

  const {
    lecturas = [],
    filteredLecturas = [],
    isLoading = false,
    showFilters = false,
    searchQuery = '',
    filtroPozo = '',
    filtroBateria = '',
    filtroDia = '',
    filtroMes = '',
    filtroAno = '',
    filtroFechaInicio = '',
    filtroFechaFin = '',
    baterias = [],
    anos = [],
    setShowFilters = () => {},
    setSearchQuery = () => {},
    setFiltroPozo = () => {},
    setFiltroBateria = () => {},
    setFiltroDia = () => {},
    setFiltroMes = () => {},
    setFiltroAno = () => {},
    setFiltroFechaInicio = () => {},
    setFiltroFechaFin = () => {},
    handleClearFilters = () => {},
    handleRefreshLecturas = () => {},
  } = useRegistroLecturas() || {};

  const renderLecturaItem = ({ item }: { item: any }) => (
    <LecturaItem item={item} />
  )

  const renderEmptyList = () => (
    <EmptyState message="No se encontraron lecturas con los filtros aplicados" />
  )

  return (
    <View style={registroLecturasStyles.container}>
      {/* Configuración del StatusBar nativo */}
      <RNStatusBar backgroundColor="#f5f5f5" barStyle="dark-content" translucent={true} />

      {/* StatusBar de Expo como respaldo */}
      <StatusBar style="dark" />

      {/* Espacio para el StatusBar */}
      <View style={{ height: STATUSBAR_HEIGHT, backgroundColor: "#f5f5f5" }} />

      <View style={registroLecturasStyles.header}>
        <Text style={registroLecturasStyles.headerTitle}>Registro de Lecturas</Text>
        <TouchableOpacity
          onPress={() => setShowFilters(!showFilters)}
          style={{ padding: 4 }}
        >
          <Ionicons
            name={showFilters ? "filter" : "filter-outline"}
            size={24}
            color="#000"
          />
        </TouchableOpacity>
      </View>

      {/* Barra de búsqueda */}
      <View style={registroLecturasStyles.searchContainer}>
        <TextInput
          style={registroLecturasStyles.searchInput}
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Buscar lecturas..."
        />
      </View>

      {/* Sección de filtros */}
      <FiltrosSection
        showFilters={showFilters}
        searchQuery={searchQuery}
        filtroPozo={filtroPozo}
        filtroBateria={filtroBateria}
        filtroDia={filtroDia}
        filtroMes={filtroMes}
        filtroAno={filtroAno}
        filtroFechaInicio={filtroFechaInicio}
        filtroFechaFin={filtroFechaFin}
        baterias={baterias}
        anos={anos}
        setSearchQuery={setSearchQuery}
        setFiltroPozo={setFiltroPozo}
        setFiltroBateria={setFiltroBateria}
        setFiltroDia={setFiltroDia}
        setFiltroMes={setFiltroMes}
        setFiltroAno={setFiltroAno}
        setFiltroFechaInicio={setFiltroFechaInicio}
        setFiltroFechaFin={setFiltroFechaFin}
        handleClearFilters={handleClearFilters}
      />

      {/* Lista de lecturas */}
      <FlatList
        data={Array.isArray(filteredLecturas) ? filteredLecturas : []}
        renderItem={renderLecturaItem}
        keyExtractor={(item) => item.lecturaId?.toString?.() || Math.random().toString()}
        contentContainerStyle={registroLecturasStyles.content}
        ListEmptyComponent={renderEmptyList}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={handleRefreshLecturas} />
        }
        showsVerticalScrollIndicator={false}
      />
    </View>
  )
}

