"use client"

import { useState, useEffect } from "react"
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  StatusBar as RNStatusBar,
  Dimensions,
  ActivityIndicator,
} from "react-native"
import { StatusBar } from "expo-status-bar"
import { Ionicons } from "@expo/vector-icons"
import { useRouter } from "expo-router"
import Constants from "expo-constants"
import { useDispatch, useSelector } from "../../store"
import { showSnackbar } from "../../store/snackbarSlice"
import { 
  selectAllPozos, 
  selectIsLoadingPozos, 
  selectLastSyncDate, 
  syncPozos, 
  type Pozo 
} from "../../store/pozosSlice"

const STATUSBAR_HEIGHT = Constants.statusBarHeight || 0
const { width: SCREEN_WIDTH } = Dimensions.get("window")

export default function SeleccionPozoScreen() {
  const router = useRouter()
  const dispatch = useDispatch()
  
  // Obtener los pozos del store
  const pozos = useSelector(selectAllPozos)
  const isLoading = useSelector(selectIsLoadingPozos)
  const lastSyncDate = useSelector(selectLastSyncDate)
  
  const [searchQuery, setSearchQuery] = useState("")
  const [isSyncing, setIsSyncing] = useState(false)

  // Filtrar pozos según la búsqueda
  const filteredPozos = pozos.filter(
    (pozo) =>
      pozo.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pozo.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pozo.bateria.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pozo.predio.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  // Función para sincronizar pozos
  const handleSyncPozos = async () => {
    if (isSyncing) return
    
    setIsSyncing(true)
    try {
      await dispatch(syncPozos()).unwrap()
      dispatch(
        showSnackbar({
          message: "Pozos sincronizados correctamente",
          type: "success",
          duration: 3000,
        })
      )
    } catch (error) {
      console.error("Error al sincronizar pozos:", error)
      dispatch(
        showSnackbar({
          message: "Error al sincronizar pozos",
          type: "error",
          duration: 3000,
        })
      )
    } finally {
      setIsSyncing(false)
    }
  }

  // Función para manejar la selección de un pozo
  const handleSelectPozo = (pozo: Pozo) => {
    // Mostrar mensaje de confirmación
    dispatch(
      showSnackbar({
        message: `Pozo ${pozo.nombre} seleccionado`,
        type: "success",
        duration: 2000,
      })
    )
    
    // Navegar a la pantalla de captura con los datos del pozo
    router.push({
      pathname: "/(tabs)/nueva-captura",
      params: {
        pozoId: pozo.id,
        pozoNombre: pozo.nombre,
        pozoUbicacion: pozo.predio,
      },
    })
  }

  // Función para volver atrás
  const handleBack = () => {
    router.back()
  }

  // Función para limpiar la búsqueda
  const handleClearSearch = () => {
    setSearchQuery("")
  }

  // Renderizar cada elemento de la lista
  const renderPozoItem = ({ item, index }: { item: Pozo; index: number }) => (
    <TouchableOpacity
      style={[styles.pozoItem, index === 0 ? { backgroundColor: "#e6f7f0" } : {}]}
      onPress={() => handleSelectPozo(item)}
    >
      <View style={styles.pozoRow}>
        <Text style={styles.pozoId}>{item.id}</Text>
        <Text style={styles.pozoNombre}>{item.nombre}</Text>
        <Text style={styles.pozoBateria}>{item.bateria}</Text>
        <Text style={styles.pozoPredio}>{item.predio}</Text>
      </View>
      <View style={styles.separator} />
    </TouchableOpacity>
  )

  // Formatear la fecha de última sincronización
  const formatSyncDate = () => {
    if (!lastSyncDate) return "Nunca"
    
    try {
      const date = new Date(lastSyncDate)
      return date.toLocaleString()
    } catch (error) {
      return "Fecha inválida"
    }
  }

  return (
    <View style={styles.container}>
      {/* Configuración del StatusBar */}
      <RNStatusBar backgroundColor="#f5f5f5" barStyle="dark-content" translucent={true} />
      <StatusBar style="dark" />

      {/* Espacio para el StatusBar */}
      <View style={{ height: STATUSBAR_HEIGHT, backgroundColor: "#f5f5f5" }} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>Seleccione un Pozo</Text>
          <Text style={styles.subtitle}>Elija el pozo para el cual desea capturar lecturas</Text>
        </View>
        <TouchableOpacity style={styles.syncButton} onPress={handleSyncPozos} disabled={isSyncing}>
          {isSyncing ? (
            <ActivityIndicator size="small" color="#00A86B" />
          ) : (
            <Ionicons name="sync" size={24} color="#00A86B" />
          )}
        </TouchableOpacity>
      </View>

      {/* Información de sincronización */}
      <View style={styles.syncInfoContainer}>
        <Text style={styles.syncInfoText}>
          Última sincronización: {formatSyncDate()}
        </Text>
        <Text style={styles.syncInfoCount}>
          {pozos.length} pozos disponibles
        </Text>
      </View>

      {/* Barra de búsqueda */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#999" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar por ID, nombre, batería o predio..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          autoCapitalize="none"
          clearButtonMode="while-editing"
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={handleClearSearch} style={styles.clearButton}>
            <Ionicons name="close-circle" size={20} color="#999" />
          </TouchableOpacity>
        )}
      </View>

      {/* Encabezados de la tabla */}
      <View style={styles.tableHeader}>
        <Text style={[styles.headerCell, { width: SCREEN_WIDTH * 0.15 }]}>ID</Text>
        <Text style={[styles.headerCell, { width: SCREEN_WIDTH * 0.3 }]}>Nombre</Text>
        <Text style={[styles.headerCell, { width: SCREEN_WIDTH * 0.25 }]}>Batería</Text>
        <Text style={[styles.headerCell, { flex: 1 }]}>Predio</Text>
      </View>

      {/* Indicador de carga */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#00A86B" />
          <Text style={styles.loadingText}>Cargando pozos...</Text>
        </View>
      ) : (
        /* Lista de pozos */
        filteredPozos.length === 0 ? (
          <View style={styles.emptySearchContainer}>
            <Ionicons name="search-outline" size={64} color="#ccc" />
            <Text style={styles.emptySearchText}>No se encontraron pozos</Text>
            <Text style={styles.emptySearchSubtext}>Intente con otra búsqueda</Text>
          </View>
        ) : (
          <FlatList
            data={filteredPozos}
            renderItem={renderPozoItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={true}
          />
        )
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#f5f5f5",
  },
  backButton: {
    padding: 4,
  },
  titleContainer: {
    flex: 1,
    marginLeft: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#000",
  },
  subtitle: {
    fontSize: 14,
    color: "#666",
    marginTop: 4,
  },
  syncButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: "#f0f0f0",
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  syncInfoContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: "#e6f7f0",
  },
  syncInfoText: {
    fontSize: 12,
    color: "#666",
  },
  syncInfoCount: {
    fontSize: 12,
    color: "#00A86B",
    fontWeight: "500",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    marginHorizontal: 16,
    marginVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 25,
    height: 50,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 50,
    fontSize: 16,
  },
  clearButton: {
    padding: 8,
  },
  tableHeader: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#f0f0f0",
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  headerCell: {
    fontWeight: "bold",
    color: "#666",
    fontSize: 14,
  },
  listContent: {
    paddingBottom: 20,
  },
  pozoItem: {
    backgroundColor: "white",
  },
  pozoRow: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  pozoId: {
    width: SCREEN_WIDTH * 0.15,
    fontWeight: "bold",
  },
  pozoNombre: {
    width: SCREEN_WIDTH * 0.3,
  },
  pozoBateria: {
    width: SCREEN_WIDTH * 0.25,
  },
  pozoPredio: {
    flex: 1,
  },
  separator: {
    height: 1,
    backgroundColor: "#f0f0f0",
    marginLeft: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#666",
  },
  emptySearchContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  emptySearchText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#666",
    marginTop: 16,
  },
  emptySearchSubtext: {
    fontSize: 14,
    color: "#999",
    marginTop: 8,
    textAlign: "center",
  },
})
