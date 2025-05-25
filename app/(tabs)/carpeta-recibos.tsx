"use client"

import { useState } from "react"
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  StatusBar as RNStatusBar,
  Image,
  Modal,
  KeyboardAvoidingView,
  Platform,
  FlatList,
} from "react-native"
import { StatusBar } from "expo-status-bar"
import { Ionicons } from "@expo/vector-icons"
import { useRouter } from "expo-router"
import Constants from "expo-constants"
import { useDispatch, useSelector } from "../../store"
import { showSnackbar } from "../../store/snackbarSlice"
import CameraScreen from "../../components/CameraScreen"
import { addSignedTicket, selectAllSignedTickets, type SignedTicket } from "../../store/signedTicketsSlice"

const STATUSBAR_HEIGHT = Constants.statusBarHeight || 0

export default function CarpetaRecibosScreen() {
  const router = useRouter()
  const dispatch = useDispatch()
  const signedTickets = useSelector(selectAllSignedTickets)

  // Estados para el formulario
  const [ticketId, setTicketId] = useState("")
  const [ticketDate, setTicketDate] = useState(
    new Date().toLocaleDateString("es-MX") +
      " " +
      new Date().toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
  )
  const [photoUri, setPhotoUri] = useState<string | null>(null)
  const [showCamera, setShowCamera] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  // Modificar la función handleViewTicket para mostrar un modal con los detalles
  const [selectedTicket, setSelectedTicket] = useState<SignedTicket | null>(null)
  const [showDetailModal, setShowDetailModal] = useState(false)

  // Función para abrir el formulario de registro
  const handleNewTicket = () => {
    setTicketId("")
    setTicketDate(
      new Date().toLocaleDateString("es-MX") +
        " " +
        new Date().toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
    )
    setPhotoUri(null)
    setShowForm(true)
  }

  // Función para abrir la cámara
  const handleOpenCamera = () => {
    setShowCamera(true)
  }

  // Función para manejar la foto tomada
  const handlePhotoTaken = (uri: string) => {
    setPhotoUri(uri)
    setShowCamera(false)
    dispatch(
      showSnackbar({
        message: "Foto guardada correctamente",
        type: "success",
        duration: 2000,
      }),
    )
  }

  // Función para cerrar la cámara
  const handleCloseCamera = () => {
    setShowCamera(false)
  }

  // Función para guardar el ticket firmado
  const handleSaveTicket = async () => {
    if (!ticketId.trim()) {
      dispatch(
        showSnackbar({
          message: "Por favor ingrese el ID del ticket",
          type: "warning",
          duration: 3000,
        }),
      )
      return
    }

    if (!photoUri) {
      dispatch(
        showSnackbar({
          message: "Por favor tome una foto del ticket firmado",
          type: "warning",
          duration: 3000,
        }),
      )
      return
    }

    setIsLoading(true)

    try {
      // Crear un nuevo ticket firmado
      const newSignedTicket = {
        id: `signed-${Date.now()}`,
        ticketId,
        fecha: ticketDate,
        photoUri,
        createdAt: new Date().toISOString(),
      }

      // Guardar el ticket firmado
      await dispatch(addSignedTicket(newSignedTicket)).unwrap()

      dispatch(
        showSnackbar({
          message: "Ticket firmado guardado correctamente",
          type: "success",
          duration: 3000,
        }),
      )

      // Cerrar el formulario
      setShowForm(false)
    } catch (error) {
      console.error("Error al guardar el ticket firmado:", error)
      dispatch(
        showSnackbar({
          message: "Error al guardar el ticket firmado",
          type: "error",
          duration: 3000,
        }),
      )
    } finally {
      setIsLoading(false)
    }
  }

  // Función para cancelar el registro
  const handleCancel = () => {
    setShowForm(false)
  }

  // Función para ver un ticket firmado
  const handleViewTicket = (ticket: SignedTicket) => {
    setSelectedTicket(ticket)
    setShowDetailModal(true)
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
        <Text style={styles.headerTitle}>Carpeta de Recibos</Text>
        
      </View>

      {/* Botón de nuevo ticket */}
      <TouchableOpacity style={styles.nuevoTicketButton} onPress={handleNewTicket}>
        <Ionicons name="add" size={20} color="#fff" />
        <Text style={styles.nuevoTicketText}>Registrar Ticket Firmado</Text>
      </TouchableOpacity>

      {/* Lista de tickets firmados */}
      {signedTickets.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="document-text-outline" size={64} color="#ccc" />
          <Text style={styles.emptyText}>No hay recibos firmados</Text>
          <Text style={styles.emptySubtext}>Registre un nuevo ticket firmado para comenzar</Text>
        </View>
      ) : (
        <FlatList
          data={signedTickets}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.ticketItem} onPress={() => handleViewTicket(item)} activeOpacity={0.7}>
              <View style={styles.ticketImagePlaceholder}>
                <Ionicons name="document-text-outline" size={24} color="#999" />
              </View>
              <View style={styles.ticketInfo}>
                <Text style={styles.ticketId}>ID: {item.ticketId}</Text>
                <Text style={styles.ticketFecha}>Fecha: {item.fecha}</Text>
                <Text style={styles.ticketEstado}>Recibo firmado</Text>
              </View>
            </TouchableOpacity>
          )}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={true}
        />
      )}

      {/* Modal para el formulario de registro */}
      <Modal visible={showForm} animationType="slide" transparent>
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.modalContainer}>
          <View style={styles.formContainer}>
            <Text style={styles.formTitle}>Registro de Ticket</Text>
            <Text style={styles.formSubtitle}>Adjunte el ticket con los datos requeridos.</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>ID</Text>
              <TextInput style={styles.input} placeholder="Ingrese el ID" value={ticketId} onChangeText={setTicketId} />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Fecha</Text>
              <TextInput style={styles.input} value={ticketDate} onChangeText={setTicketDate} editable={false} />
            </View>

            <TouchableOpacity style={styles.photoButton} onPress={handleOpenCamera}>
              <Ionicons name="camera" size={24} color="#666" />
              <Text style={styles.photoButtonText}>Foto del Ticket</Text>
            </TouchableOpacity>

            {photoUri && (
              <View style={styles.photoPreview}>
                <Image source={{ uri: photoUri }} style={styles.previewImage} />
              </View>
            )}

            <View style={styles.formActions}>
              <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
                <Ionicons name="arrow-back" size={24} color="#666" />
              </TouchableOpacity>

              <TouchableOpacity style={styles.acceptButton} onPress={handleSaveTicket} disabled={isLoading}>
                <Text style={styles.acceptButtonText}>{isLoading ? "Guardando..." : "Aceptar"}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Modal para ver detalles del ticket */}
      <Modal visible={showDetailModal} animationType="fade" transparent>
        <View style={styles.modalContainer}>
          <View style={styles.detailContainer}>
            <View style={styles.detailHeader}>
              <Text style={styles.detailTitle}>Detalles del Recibo</Text>
              <TouchableOpacity style={styles.closeButton} onPress={() => setShowDetailModal(false)}>
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            {selectedTicket && (
              <>
                <View style={styles.detailInfo}>
                  <Text style={styles.detailLabel}>ID del Ticket:</Text>
                  <Text style={styles.detailValue}>{selectedTicket.ticketId}</Text>
                </View>

                <View style={styles.detailInfo}>
                  <Text style={styles.detailLabel}>Fecha de Registro:</Text>
                  <Text style={styles.detailValue}>{selectedTicket.fecha}</Text>
                </View>

                <View style={styles.detailImageContainer}>
                  <Text style={styles.detailLabel}>Imagen del Ticket:</Text>
                  <Image source={{ uri: selectedTicket.photoUri }} style={styles.detailImage} resizeMode="contain" />
                </View>
              </>
            )}

            <TouchableOpacity style={styles.acceptButton} onPress={() => setShowDetailModal(false)}>
              <Text style={styles.acceptButtonText}>Cerrar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Modal de cámara */}
      <Modal visible={showCamera} animationType="slide" onRequestClose={handleCloseCamera}>
        <CameraScreen onPhotoTaken={handlePhotoTaken} onClose={handleCloseCamera} title="Foto del Ticket Firmado" />
      </Modal>
    </View>
  )
}

// Actualizar los estilos para que coincidan con los de capturas
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
    marginTop: 2,
  },
  ticketEstado: {
    fontSize: 12,
    color: "#10b981",
    fontWeight: "500",
    marginTop: 2,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
    padding: 16,
  },
  formContainer: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 20,
    width: "100%",
    maxWidth: 400,
  },
  formTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 4,
  },
  formSubtitle: {
    fontSize: 14,
    color: "#666",
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#f9f9f9",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  photoButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f0f0f0",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  photoButtonText: {
    fontSize: 16,
    color: "#666",
    marginLeft: 8,
  },
  photoPreview: {
    marginBottom: 16,
    borderRadius: 8,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#ddd",
  },
  previewImage: {
    width: "100%",
    height: 200,
    resizeMode: "cover",
  },
  formActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8,
  },
  cancelButton: {
    padding: 12,
    borderRadius: 8,
    backgroundColor: "#f0f0f0",
  },
  acceptButton: {
    backgroundColor: "#00A86B",
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  acceptButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
  // Estilos para el modal de detalle
  detailContainer: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 20,
    width: "100%",
    maxWidth: 400,
  },
  detailHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  detailTitle: {
    fontSize: 20,
    fontWeight: "bold",
  },
  closeButton: {
    padding: 4,
  },
  detailInfo: {
    marginBottom: 12,
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#666",
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 16,
    color: "#333",
  },
  detailImageContainer: {
    marginBottom: 16,
  },
  detailImage: {
    width: "100%",
    height: 300,
    borderRadius: 8,
    marginTop: 8,
    borderWidth: 1,
    borderColor: "#ddd",
  },
})

