"use client"
import { useEffect } from "react"
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, StatusBar as RNStatusBar, Platform } from "react-native"
import { StatusBar } from "expo-status-bar"
import { useSelector } from "react-redux"
import { Ionicons } from "@expo/vector-icons"
import { useRouter } from "expo-router"
import { showSnackbar } from "../../store/snackbarSlice"
import Constants from "expo-constants"
import { useDispatch } from "../../store"
import { loadTickets, selectPendingTickets, selectTodayTickets, syncTickets } from "../../store/ticketsSlice"
import { selectAllPozos, syncPozos } from "../../store/pozosSlice"
import { syncUsers } from "../../store/authSlice"

const STATUSBAR_HEIGHT = Constants.statusBarHeight || 0

export default function ControlPanel() {
  const user = useSelector((state:any) => state.auth.user)
  const router = useRouter()
  const dispatch = useDispatch()

  // Obtener datos reales de tickets
  const pendingTickets = useSelector(selectPendingTickets)
  const todayTickets = useSelector(selectTodayTickets)
  const pozos = useSelector(selectAllPozos)
  const pendingLecturas = useSelector((state:any) => state.pendingLecturas.items)

  // Cargar tickets al montar el componente
  useEffect(() => {
    dispatch(loadTickets())
  }, [dispatch])

  const handleNewCapture = () => {
    // Navegar a la pantalla de selección de pozo
    router.push("/(tabs)/seleccion-pozo")

    // Mostrar mensaje informativo
    dispatch(
      showSnackbar({
        message: "Seleccione un pozo o use los datos predefinidos",
        type: "info",
        duration: 3000,
      }),
    )
  }

  // Modificar la función handleSync para incluir la sincronización de usuarios
  const handleSync = async () => {
    // Mostrar mensaje de inicio de sincronización
    dispatch(
      showSnackbar({
        message: "Sincronizando datos...",
        type: "info",
        duration: 2000,
      }),
    )

    try {
      // Sincronizar tickets, pozos y usuarios
      await Promise.all([
        dispatch(syncTickets()).unwrap(),
        dispatch(syncPozos()).unwrap(),
        dispatch(syncUsers()).unwrap(),
      ])

      dispatch(
        showSnackbar({
          message: "¡Sincronización completada!",
          type: "success",
          duration: 3000,
        }),
      )
    } catch (error) {
      console.error("Error al sincronizar:", error)
      dispatch(
        showSnackbar({
          message: "Error al sincronizar datos",
          type: "error",
          duration: 3000,
        }),
      )
    }
  }

  return (
    <View style={styles.container}>
      {/* Configuración del StatusBar nativo */}
      <RNStatusBar backgroundColor="#f5f5f5" barStyle="dark-content" translucent={true} />

      {/* StatusBar de Expo como respaldo */}
      <StatusBar style="dark" />

      {/* Espacio para el StatusBar */}
      <View style={{ height: STATUSBAR_HEIGHT, backgroundColor: "#f5f5f5" }} />

      {pendingLecturas.length > 0 && (
        <View style={{ backgroundColor: '#ff3b30', padding: 8, borderRadius: 8, margin: 16 }}>
          <Text style={{ color: 'white', fontWeight: 'bold', textAlign: 'center' }}>
            Tienes {pendingLecturas.length} lecturas pendientes por sincronizar
          </Text>
        </View>
      )}

      <View style={styles.header}>
        <Text style={styles.headerTitle}>Panel de Control</Text>
        
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        <TouchableOpacity style={styles.newCaptureButton} onPress={handleNewCapture}>
          <Ionicons name="add" size={20} color="#fff" />
          <Text style={styles.newCaptureText}>Nueva Captura</Text>
        </TouchableOpacity>

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Capturas Pendientes</Text>
            <Ionicons name="document-text-outline" size={24} color="#000" />
          </View>
          <Text style={[styles.cardValue, styles.pendingValue]}>{pendingTickets.length}</Text>
          <Text style={styles.cardSubtitle}>Pozos pendientes de captura</Text>
        </View>

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Capturas Recientes</Text>
            <Ionicons name="time-outline" size={24} color="#000" />
          </View>
          <Text style={[styles.cardValue, styles.recentValue]}>{todayTickets.length}</Text>
          <Text style={styles.cardSubtitle}>Capturas realizadas hoy</Text>
        </View>

        <TouchableOpacity style={styles.card} onPress={handleSync}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Sincronización</Text>
            <Ionicons name="sync-outline" size={24} color="#000" />
          </View>
          <Text style={[styles.cardValue, styles.syncValue]}>
            {pendingTickets.length > 0 ? `${pendingTickets.length} pendientes` : "Actualizado"}
          </Text>
          <Text style={styles.cardSubtitle}>{pozos.length} pozos disponibles</Text>
        </TouchableOpacity>


      </ScrollView>
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
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
  },
  menuButton: {
    padding: 4,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  newCaptureButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#00A86B",
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  newCaptureText: {
    color: "white",
    fontWeight: "bold",
    marginLeft: 8,
  },
  card: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    ...(Platform.OS === 'web'
      ? { boxShadow: "0px 2px 4px rgba(0,0,0,0.1)" }
      : {
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 2,
        }),
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "bold",
  },
  cardValue: {
    fontSize: 28,
    fontWeight: "bold",
    marginVertical: 4,
  },
  pendingValue: {
    color: "#00A86B",
  },
  recentValue: {
    color: "#00A86B",
  },
  syncValue: {
    color: "#00A86B",
    fontSize: 22,
  },
  cardSubtitle: {
    color: "#666",
    fontSize: 14,
  },
})


