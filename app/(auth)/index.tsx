"use client"
import { useEffect } from "react"
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, StatusBar as RNStatusBar } from "react-native"
import { StatusBar } from "expo-status-bar"
import { useSelector } from "react-redux"
import { Ionicons } from "@expo/vector-icons"
import { useRouter } from "expo-router"
import { showSnackbar } from "../../store/snackbarSlice"
import Constants from "expo-constants"
import { useDispatch } from "../../store"
import { selectAllPozos, syncPozos } from "../../store/pozosSlice"

const STATUSBAR_HEIGHT = Constants.statusBarHeight || 0

export default function ControlPanel() {
  const user = useSelector((state:any) => state.auth.user)
  const router = useRouter()
  const dispatch = useDispatch()

  // Usar pendingLecturasSlice para pendientes
  const pendingLecturas = useSelector((state: any) => state.pendingLecturas?.items || [])
  const pozos = useSelector(selectAllPozos)

  // Si necesitas mostrar capturas recientes, puedes implementar lógica similar usando pendingLecturas o lecturas sincronizadas
  // const todayLecturas = ...

  // Elimina el useEffect de loadTickets
  // useEffect(() => { dispatch(loadTickets()) }, [dispatch])

  const handleNewCapture = () => {
    router.push("/(tabs)/seleccion-pozo")
    dispatch(
      showSnackbar({
        message: "Seleccione un pozo o use los datos predefinidos",
        type: "info",
        duration: 3000,
      }),
    )
  }

  const handleSync = async () => {
    dispatch(
      showSnackbar({
        message: "Sincronizando datos...",
        type: "info",
        duration: 2000,
      }),
    )
    try {
      await Promise.all([
        // dispatch(syncTickets()).unwrap(), // Eliminar
        dispatch(syncPozos()).unwrap(),
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
          <Text style={[styles.cardValue, styles.pendingValue]}>{pendingLecturas.length}</Text>
          <Text style={styles.cardSubtitle}>Pozos pendientes de captura</Text>
        </View>

        {/* Puedes implementar lógica para capturas recientes si lo necesitas */}

        <TouchableOpacity style={styles.card} onPress={handleSync}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Sincronización</Text>
            <Ionicons name="sync-outline" size={24} color="#000" />
          </View>
          <Text style={[styles.cardValue, styles.syncValue]}>
            {pendingLecturas.length > 0 ? `${pendingLecturas.length} pendientes` : "Actualizado"}
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
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
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

