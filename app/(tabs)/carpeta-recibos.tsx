"use client"

import React, { useState, useEffect } from "react"
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
import AsyncStorage from '@react-native-async-storage/async-storage';
// import NetInfo from '@react-native-community/netinfo';

const STATUSBAR_HEIGHT = Constants.statusBarHeight || 0

export default function CarpetaRecibosScreen() {
  const router = useRouter()
  const dispatch = useDispatch()
  const signedTickets = useSelector(selectAllSignedTickets)
  const user = useSelector((state: any) => state.auth.user);
  const [ticketsBackend, setTicketsBackend] = useState<any[]>([]);

  // Estados para el formulario
  const [ticketId, setTicketId] = useState("")
  const [ticketDate, setTicketDate] = useState(
    new Date().toLocaleDateString("es-MX") +
      " " +
      new Date().toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
  )
  const [photoUri, setPhotoUri] = useState<string | File | null>(null)
  const [showCamera, setShowCamera] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  // Modificar la función handleViewTicket para mostrar un modal con los detalles
  const [selectedTicket, setSelectedTicket] = useState<any>(null)
  const [showDetailModal, setShowDetailModal] = useState(false)

  const baseUrl = process.env.EXPO_PUBLIC_API_URL;

  // Buscar ticket por numeroTicket (case-insensitive)
  const buscarTicketPorCodigo = async (codigo: string, token: string) => {
    const codigoUpper = codigo.trim().toUpperCase();
    const res = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/tickets?filters[numeroTicket][$containsi]=${codigoUpper}&populate[fotoTicket]=true`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await res.json();
    if (data && data.data && data.data.length > 0) {
      // Busca el que coincida exactamente (ignorando mayúsculas/minúsculas)
      return data.data.find((t: any) => t.numeroTicket && t.numeroTicket.toUpperCase() === codigoUpper) || null;
    }
    return null;
  };

  // Obtener todos los tickets firmados del backend
  const fetchTicketsBackend = async () => {
    if (!user?.token) return;
    const res = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/tickets?populate[fotoTicket]=true`, {
      headers: { 'Authorization': `Bearer ${user.token}` }
    });
    const data = await res.json();
    // Filtrar en frontend solo los que tienen foto
    setTicketsBackend((data.data || []).filter((t: any) => {
      const foto = t.fotoTicket;
      return (foto && (foto.url || (Array.isArray(foto) && foto[0]?.url)));
    }));
  };

  useEffect(() => {
    fetchTicketsBackend();
  }, [showForm, isLoading]);

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

  // Función para subir imagen en web
  async function subirImagenWeb(file: File, token: string): Promise<number | undefined> {
    const formData = new FormData();
    formData.append('files', file);
    const res = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/upload`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });
    const data = await res.json();
    return data[0]?.id;
  }

  // Función para subir imagen en móvil
  async function subirImagenMovil(uri: string, token: string): Promise<number | undefined> {
    const formData = new FormData();
    formData.append('files', {
      uri,
      name: 'ticket_firmado.jpg',
      type: 'image/jpeg',
    } as any); // <-- 'as any' para evitar error de tipo en React Native
    const res = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/upload`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });
    const data = await res.json();
    return data[0]?.id;
  }

  // Función para actualizar el ticket con la imagen y la fecha de firma
  async function actualizarTicketFirmado(ticketId: number, idImagen: number | undefined, token: string) {
    const body = {
      data: {
        fechaFirma: new Date().toISOString(),
        fotoTicket: idImagen ? [idImagen] : [],
      }
    };
    const res = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/tickets/${ticketId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(body),
    });
    return await res.json();
  }

  // Guardar ticket pendiente en AsyncStorage
  async function guardarPendiente(ticket: any) {
    const pendientes = JSON.parse(await AsyncStorage.getItem('ticketsPendientes') || '[]');
    pendientes.push(ticket);
    await AsyncStorage.setItem('ticketsPendientes', JSON.stringify(pendientes));
  }

  // Sincronizar tickets pendientes
  async function sincronizarPendientes() {
    const pendientes: any[] = JSON.parse(await AsyncStorage.getItem('ticketsPendientes') || '[]');
    const nuevosPendientes: any[] = [];
    for (const ticket of pendientes) {
      try {
        // 1. Subir imagen
        let idImagen: number | undefined = undefined;
        if (Platform.OS === 'web') {
          if (ticket.photoUri && typeof ticket.photoUri !== 'string') {
            idImagen = await subirImagenWeb(ticket.photoUri, user.token);
          }
        } else {
          if (ticket.photoUri && typeof ticket.photoUri === 'string') {
            idImagen = await subirImagenMovil(ticket.photoUri, user.token);
          }
        }
        // 2. Actualizar ticket
        await actualizarTicketFirmado(ticket.id, idImagen, user.token);
      } catch (e) {
        // Si falla, lo dejas en la lista para el siguiente intento
        nuevosPendientes.push(ticket);
      }
    }
    await AsyncStorage.setItem('ticketsPendientes', JSON.stringify(nuevosPendientes));
    fetchTicketsBackend();
  }

  // Hook para sincronizar cuando vuelva la conexión
  useEffect(() => {
    // const unsubscribe = NetInfo.addEventListener((state: any) => {
    //   if (state.isConnected) {
    //     sincronizarPendientes();
    //   }
    // });
    // return () => unsubscribe();
  }, []);

  // Función para guardar el ticket firmado
  const handleSaveTicket = async () => {
    if (!ticketId.trim()) {
      dispatch(showSnackbar({ message: "Por favor ingrese el código del ticket", type: "warning", duration: 3000 }));
      return;
    }
    if (!photoUri) {
      dispatch(showSnackbar({ message: "Por favor tome una foto del ticket firmado", type: "warning", duration: 3000 }));
      return;
    }
    setIsLoading(true);
    try {
      // Buscar el ticket por código y obtener el id numérico
      const ticketObj = await buscarTicketPorCodigo(ticketId, user.token);
      if (!ticketObj) {
        dispatch(showSnackbar({ message: "No se encontró un ticket con ese código", type: "error", duration: 3000 }));
        setIsLoading(false);
        return;
      }
      // Verificar conexión
      // const netInfo = await NetInfo.fetch();
      // if (!netInfo.isConnected) {
      //   // Guardar pendiente localmente
      //   await guardarPendiente({
      //     id: ticketObj.id,
      //     photoUri,
      //     fechaFirma: new Date().toISOString(),
      //   });
      //   dispatch(showSnackbar({ message: "Sin conexión. El ticket se guardará y se sincronizará automáticamente cuando vuelva la conexión.", type: "info", duration: 4000 }));
      //   setShowForm(false);
      //   setTicketId('');
      //   setPhotoUri(null);
      //   setIsLoading(false);
      //   return;
      // }
      // 1. Subir la imagen
      let idImagen: number | undefined = undefined;
      if (Platform.OS === 'web') {
        if (photoUri && typeof photoUri !== 'string') {
          idImagen = await subirImagenWeb(photoUri, user.token);
        }
      } else {
        if (photoUri && typeof photoUri === 'string') {
          idImagen = await subirImagenMovil(photoUri, user.token);
        }
      }
      // 2. Actualizar el ticket con la imagen y la fecha de firma
      const data = await actualizarTicketFirmado(ticketObj.id, idImagen, user.token);
      if (data && data.data) {
        dispatch(showSnackbar({ message: "Ticket firmado guardado correctamente", type: "success", duration: 3000 }));
        setShowForm(false);
        setTicketId('');
        setPhotoUri(null);
        await fetchTicketsBackend();
      } else {
        throw new Error('No se pudo actualizar el ticket');
      }
    } catch (error) {
      console.error("Error al guardar el ticket firmado:", error);
      dispatch(showSnackbar({ message: "Error al guardar el ticket firmado", type: "error", duration: 3000 }));
    } finally {
      setIsLoading(false);
    }
  };

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

      {/* Lista de tickets firmados desde backend */}
      {ticketsBackend.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="document-text-outline" size={64} color="#ccc" />
          <Text style={styles.emptyText}>No hay recibos firmados</Text>
          <Text style={styles.emptySubtext}>Registre un nuevo ticket firmado para comenzar</Text>
        </View>
      ) : (
        <FlatList
          data={ticketsBackend}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.ticketItem} onPress={() => handleViewTicket(item)} activeOpacity={0.7}>
              <View style={styles.ticketImagePlaceholder}>
                {item.fotoTicket && (item.fotoTicket.formats?.thumbnail?.url || item.fotoTicket.url) ? (
                  <Image
                    source={{
                      uri: item.fotoTicket.formats?.thumbnail?.url
                        ? `${baseUrl}${item.fotoTicket.formats.thumbnail.url}`
                        : `${baseUrl}${item.fotoTicket.url}`
                    }}
                    style={{ width: 40, height: 40, borderRadius: 8 }}
                  />
                ) : (
                  <Ionicons name="document-text-outline" size={24} color="#999" />
                )}
              </View>
              <View style={styles.ticketInfo}>
                <Text style={styles.ticketId}>Código: {(item.numeroTicket ?? item.ticketId)?.toUpperCase()}</Text>
                <Text style={styles.ticketFecha}>Fecha de Firma: {item.fechaFirma ? new Date(item.fechaFirma).toLocaleString() : 'Sin firma'}</Text>
                <Text style={styles.ticketEstado}>Recibo firmado</Text>
              </View>
            </TouchableOpacity>
          )}
          keyExtractor={(item) => item.id.toString()}
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

            {Platform.OS === 'web' ? (
              <input
                type="file"
                accept="image/*"
                onChange={e => {
                  if (e.target.files && e.target.files[0]) {
                    setPhotoUri(e.target.files[0]); // Guarda el File directamente
                  }
                }}
                style={{ marginBottom: 16 }}
              />
            ) : (
              <TouchableOpacity style={styles.photoButton} onPress={handleOpenCamera}>
                <Ionicons name="camera" size={24} color="#666" />
                <Text style={styles.photoButtonText}>Foto del Ticket</Text>
              </TouchableOpacity>
            )}

            {photoUri && (
              Platform.OS === 'web'
                ? (typeof photoUri === 'object' && 'name' in photoUri ? (
                    <Text style={{ marginBottom: 8 }}>Archivo seleccionado: {photoUri.name}</Text>
                  ) : null)
                : (typeof photoUri === 'string' ? (
                    <View style={styles.photoPreview}>
                      <Image source={{ uri: photoUri }} style={styles.previewImage} />
                    </View>
                  ) : null)
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
                  <Text style={styles.detailLabel}>Código del Ticket:</Text>
                  <Text style={styles.detailValue}>{(selectedTicket.numeroTicket ?? selectedTicket.ticketId)?.toUpperCase()}</Text>
                </View>
                <View style={styles.detailInfo}>
                  <Text style={styles.detailLabel}>Fecha de Firma:</Text>
                  <Text style={styles.detailValue}>{selectedTicket.fechaFirma ? new Date(selectedTicket.fechaFirma).toLocaleString() : 'Sin firma'}</Text>
                </View>
                <View style={styles.detailImageContainer}>
                  <Text style={styles.detailLabel}>Imagen del Ticket:</Text>
                  {selectedTicket.fotoTicket && (selectedTicket.fotoTicket.formats?.thumbnail?.url || selectedTicket.fotoTicket.url) && (
                    <Image
                      source={{
                        uri: selectedTicket.fotoTicket.formats?.thumbnail?.url
                          ? `${baseUrl}${selectedTicket.fotoTicket.formats.thumbnail.url}`
                          : `${baseUrl}${selectedTicket.fotoTicket.url}`
                      }}
                      style={styles.detailImage}
                      resizeMode="contain"
                    />
                  )}
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

