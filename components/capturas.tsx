"use client"

import { useEffect, useState } from "react"
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  StatusBar as RNStatusBar,
  ActivityIndicator,
} from "react-native"
import { StatusBar } from "expo-status-bar"
import { Ionicons } from "@expo/vector-icons"
import { useRouter } from "expo-router"
import Constants from "expo-constants"
import { useDispatch, useSelector } from "../../store"
import { showSnackbar } from "../../store/snackbarSlice"

const STATUSBAR_HEIGHT = Constants.statusBarHeight || 0

export default function CarpetaRecibosScreen() {
  const router = useRouter()
  const dispatch = useDispatch()
  // const tickets = useSelector(selectAllTickets) // Comentado temporalmente
  const tickets: any[] = [] // Array vacío temporal
  const [isLoading, setIsLoading] = useState(false) // Cambiado a false

  // Cargar tickets al montar el componente
  // useEffect(() => {
  //   const fetchTickets = async () => {
  //     try {
  //       await dispatch(loadTickets()).unwrap()
  //     } catch (error) {
  //       console.error("Error al cargar tickets:", error)
  //       dispatch(
  //         showSnackbar({
  //           message: "Error al cargar los recibos",
  //           type: "error",
  //           duration: 3000,
  //         }),
  //       )
  //     } finally {
  //       setIsLoading(false)
  //     }
  //   }

  //   fetchTickets()
  // }, [dispatch])

  // Función para crear un nuevo ticket
  const handleNuevoTicket = () => {
    router.push("/(tabs)/seleccion-pozo")
  }

  // Función para ver un ticket
  const handleVerTicket = (ticketId: string) => {
    const ticket = tickets.find((t) => t.id === ticketId)
    if (ticket) {
      router.push({
        pathname: "/(tabs)/ticket",
        params: {
          pozoId: ticket.pozoId,
          pozoNombre: ticket.pozoNombre,
          pozoUbicacion: ticket.pozoUbicacion,
          lecturaVolumen: ticket.lecturaVolumen,
          lecturaElectrica: ticket.lecturaElectrica,
          cargaMotor: ticket.cargaMotor,
          gastoPozo: ticket.gastoPozo,
          observaciones: ticket.observaciones,
        },
      })
    }
  }

  // Renderizar cada item de la lista
  const renderTicketItem = ({ item }: { item: any }) => (
    <TouchableOpacity style={styles.ticketItem} onPress={() => handleVerTicket(item.id)} activeOpacity={0.7}>
      <View style={styles.ticketImagePlaceholder}>
        <Ionicons name="document-text-outline" size={24} color="#999" />
      </View>
      <View style={styles.ticketInfo}>
        <Text style={styles.ticketId}>ID: {item.id}</Text>
        <Text style={styles.ticketFecha}>
          Fecha: {item.fecha} {item.hora}
        </Text>
      </View>
    </TouchableOpacity>
  )

  return (
    <View style={styles.container}>
      {/* Configuración del StatusBar */}
      <RNStatusBar backgroundColor="#f5f5f5" barStyle="dark-content" translucent={true} />
      <StatusBar style="dark" />

      {/* Espacio para el StatusBar */}
      <View style={{ height: STATUSBAR_HEIGHT, backgroundColor: "#f5f5f5" }} />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Lista de capturas</Text>
        
      </View>

      {/* Botón de nuevo ticket */}
      

      {/* Lista de tickets */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#00A86B" />
          <Text style={styles.loadingText}>Cargando recibos...</Text>
        </View>
      ) : tickets.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="document-text-outline" size={64} color="#ccc" />
          <Text style={styles.emptyText}>No hay recibos disponibles</Text>
          <Text style={styles.emptySubtext}>Crea un nuevo ticket para comenzar</Text>
        </View>
      ) : (
        <FlatList
          data={tickets}
          renderItem={renderTicketItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={true}
        />
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
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
  },
  menuButton: {
    padding: 4,
  },
  nuevoTicketButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#00A86B",
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginHorizontal: 16,
    marginVertical: 12,
  },
  nuevoTicketText: {
    color: "white",
    fontWeight: "bold",
    marginLeft: 8,
  },
  listContent: {
    padding: 16,
    paddingTop: 8,
  },
  ticketItem: {
    flexDirection: "row",
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  ticketImagePlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: "#f0f0f0",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  ticketInfo: {
    flex: 1,
    justifyContent: "center",
  },
  ticketId: {
    fontSize: 14,
    fontWeight: "500",
    color: "#333",
  },
  ticketFecha: {
    fontSize: 12,
    color: "#666",
    marginTop: 4,
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
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#666",
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: "#999",
    marginTop: 8,
    textAlign: "center",
  },
})

