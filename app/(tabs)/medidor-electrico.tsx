"use client"

import { useState, useEffect } from "react"
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  StatusBar as RNStatusBar,
  Image,
  Modal,
} from "react-native"
import { StatusBar } from "expo-status-bar"
import { Ionicons } from "@expo/vector-icons"
import { useRouter, useLocalSearchParams } from "expo-router"
import { useDispatch } from "../../store"
import { showSnackbar } from "../../store/snackbarSlice"
import Constants from "expo-constants"
import CameraScreen from "../../components/CameraScreen"


// Importar el componente SelectDropdown
import SelectDropdown from "../../components/SelectDropdown"

const STATUSBAR_HEIGHT = Constants.statusBarHeight || 0

// Agregar las opciones para los selects después de las constantes iniciales
const MEDIDOR_ELECTRICO_OPTIONS = [
  { label: "Funcionando", value: "funcionando" },
  { label: "Descompuesto", value: "descompuesto" },
  { label: "Cambio de medidor", value: "cambio" },
  { label: "Sin medidor", value: "sin_medidor" },
  { label: "Sin energía eléctrica", value: "sin_energia" },
]

const EXTRACCION_MANUAL_OPTIONS = [
  { label: "Normal", value: "normal" },
  { label: "Estimado", value: "estimado" },
  { label: "No acceso", value: "no_acceso" },
  { label: "Inactivo", value: "inactivo" },
  { label: "Sin medidor", value: "sin_medidor" },
]

const TIPO_DESCARGA_OPTIONS = [
  { label: "Libre", value: "libre" },
  { label: "Controlada", value: "controlada" },
  { label: "Cerrada", value: "cerrada" },
]

const DISTANCIA_OPTIONS = [
  { label: "10m", value: "10m" },
  { label: "20m", value: "20m" },
  { label: "35m", value: "35m" },
  { label: "50m", value: "50m" },
  { label: "Más de 50m", value: "mas_50m" },
]

export default function MedidorElectricoScreen() {
  const router = useRouter()
  const dispatch = useDispatch()
  const params = useLocalSearchParams()

  // Estados para los campos del formulario
  const [lecturaElectrica, setLecturaElectrica] = useState("480")
  const [cargaMotor, setCargaMotor] = useState("15.5")
  const [gastoPozo, setGastoPozo] = useState("12500")
  const [observaciones, setObservaciones] = useState("Medidor en buen estado. Sin anomalías detectadas.")
  const [photoUri, setPhotoUri] = useState<string | null>(null)
  const [showCamera, setShowCamera] = useState(false)

  // Agregar estados para los selects después de los estados existentes
  const [estadoMedidorElectrico, setEstadoMedidorElectrico] = useState("funcionando")
  const [extraccionManual, setExtraccionManual] = useState("normal")
  const [tipoDescarga, setTipoDescarga] = useState("libre")
  const [distancia, setDistancia] = useState("35m")

  // Datos del pozo seleccionado
  const pozoId = (params.pozoId as string) || "1003"
  const pozoNombre = (params.pozoNombre as string) || "Pozo 1003"
  const pozoUbicacion = (params.pozoUbicacion as string) || "Las Cumbres"

  // Obtener datos de la pantalla anterior
  useEffect(() => {
    if (params.cargaMotor) {
      setCargaMotor(params.cargaMotor as string)
    }
  }, [params])

  // Función para volver a la pantalla anterior
  const handleBack = () => {
    router.back()
  }

  // Función para aceptar y finalizar
  const handleAccept = () => {
    // Validación básica
    if (!lecturaElectrica.trim()) {
      dispatch(
        showSnackbar({
          message: "Por favor ingresa la lectura eléctrica",
          type: "warning",
          duration: 3000,
        }),
      )
      return
    }

    // Crear un nuevo ticket con todos los datos
    const newTicket = {
      id: `TICKET-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      pozoId,
      pozoNombre,
      pozoUbicacion,
      lecturaVolumen: params.lecturaVolumen as string,
      lecturaElectrica,
      cargaMotor,
      gastoPozo,
      observaciones,
      fecha: new Date().toISOString().split("T")[0],
      hora: new Date().toTimeString().split(" ")[0],
      estado: "pendiente" as const,
      photoVolumen: params.photoUri as string,
      photoElectrica: photoUri ?? undefined,
    }

    // Guardar el ticket en el store
    // dispatch(addTicket(newTicket)) // Comentado temporalmente
    //   .unwrap()
    //   .then(() => {
        dispatch(
          showSnackbar({
            message: "Captura guardada correctamente",
            type: "success",
            duration: 3000,
          }),
        )

        // Navegar a la pantalla de ticket con todos los datos
        router.push({
          pathname: "/(tabs)/ticket",
          params: {
            pozoId,
            pozoNombre,
            pozoUbicacion,
            lecturaVolumen: params.lecturaVolumen as string,
            lecturaElectrica,
            cargaMotor,
            gastoPozo,
            observaciones,
          },
        })
      // })
      // .catch((error) => {
      //   console.error("Error al guardar el ticket:", error)
      //   dispatch(
      //     showSnackbar({
      //       message: "Error al guardar la captura",
      //       type: "error",
      //       duration: 3000,
      //     }),
      //   )
      // })
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

  return (
    <View style={styles.container}>
      {/* Configuración del StatusBar */}
      <RNStatusBar backgroundColor="#fff" barStyle="dark-content" translucent={true} />
      <StatusBar style="dark" />

      {/* Espacio para el StatusBar */}
      <View style={{ height: STATUSBAR_HEIGHT, backgroundColor: "#fff" }} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Medidor Eléctrico</Text>
        
      </View>

      {/* Contenido */}
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.keyboardView}>
        <ScrollView
          style={styles.content}
          contentContainerStyle={styles.contentContainer}
          keyboardShouldPersistTaps="handled"
        >
          {/* Card principal */}
          <View style={styles.card}>
            {/* Información del pozo */}
            <View style={styles.wellInfoContainer}>
              <Text style={styles.wellTitle}>{pozoNombre}</Text>
              <Text style={styles.wellSubtitle}>Ubicación: {pozoUbicacion}</Text>
            </View>

            {/* Medidor Eléctrico */}
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>Medidor Eléctrico</Text>
              <Text style={styles.inputLabel}>Lectura Actual (kWh)</Text>
              <TextInput
                style={styles.input}
                placeholder="Ingrese la lectura eléctrica"
                value={lecturaElectrica}
                onChangeText={setLecturaElectrica}
                keyboardType="numeric"
              />

              {photoUri ? (
                <View style={styles.photoPreviewContainer}>
                  <Image source={{ uri: photoUri }} style={styles.photoPreview} />
                  <TouchableOpacity style={styles.retakeButton} onPress={handleOpenCamera}>
                    <Ionicons name="camera" size={20} color="white" />
                    <Text style={styles.photoButtonText}>Volver a tomar</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity style={styles.photoButton} onPress={handleOpenCamera}>
                  <Ionicons name="camera-outline" size={20} color="white" />
                  <Text style={styles.photoButtonText}>Tomar Foto</Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Dropdowns */}
            {/* Reemplazar los dropdowns existentes */}
            <SelectDropdown
              title="Estado del Medidor Eléctrico"
              options={MEDIDOR_ELECTRICO_OPTIONS}
              selectedValue={estadoMedidorElectrico}
              onSelect={setEstadoMedidorElectrico}
              placeholder="Seleccionar el estado del medidor"
              darkMode={true}
            />

            <SelectDropdown
              title="Extracción Manual"
              options={EXTRACCION_MANUAL_OPTIONS}
              selectedValue={extraccionManual}
              onSelect={setExtraccionManual}
              placeholder="Seleccionar tipo de extracción manual"
              darkMode={true}
            />

            <SelectDropdown
              title="Tipo de Descarga"
              options={TIPO_DESCARGA_OPTIONS}
              selectedValue={tipoDescarga}
              onSelect={setTipoDescarga}
              placeholder="Seleccionar"
              darkMode={true}
            />

            <SelectDropdown
              title="Distancia"
              options={DISTANCIA_OPTIONS}
              selectedValue={distancia}
              onSelect={setDistancia}
              placeholder="Seleccionar"
              darkMode={true}
            />

            {/* Carga del motor */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Carga del motor</Text>
              <TextInput
                style={styles.input}
                placeholder="Ingrese la carga del motor"
                value={cargaMotor}
                onChangeText={setCargaMotor}
                keyboardType="numeric"
              />
            </View>

            {/* Gasto del Pozo */}
            <View style={styles.inputContainer}>
              <Text style={styles.sectionTitle}>Gasto del Pozo</Text>
              <Text style={styles.inputLabel}>Lectura Actual (miles de litros)</Text>
              <TextInput
                style={styles.input}
                placeholder="Ingrese la lectura del gasto del pozo"
                value={gastoPozo}
                onChangeText={setGastoPozo}
                keyboardType="numeric"
              />
            </View>

            {/* Observaciones */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Observaciones</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Ingrese cualquier información relevante"
                value={observaciones}
                onChangeText={setObservaciones}
                multiline={true}
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>
          </View>

          {/* Botones de acción */}
          <View style={styles.buttonsContainer}>
            <TouchableOpacity style={styles.backButton} onPress={handleBack}>
              <Ionicons name="arrow-back" size={24} color="#666" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.acceptButton} onPress={handleAccept}>
              <Text style={styles.acceptButtonText}>Generar Ticket</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Modal de cámara */}
      <Modal visible={showCamera} animationType="slide" onRequestClose={handleCloseCamera}>
        <CameraScreen onPhotoTaken={handlePhotoTaken} onClose={handleCloseCamera} title="Foto del Medidor Eléctrico" />
      </Modal>
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
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#fff",
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#00A86B",
    flex: 1,
    textAlign: "center",
  },
  menuButton: {
    padding: 4,
  },
  keyboardView: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 32,
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
  wellInfoContainer: {
    marginBottom: 16,
  },
  wellTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  wellSubtitle: {
    fontSize: 14,
    color: "#666",
    marginTop: 4,
  },
  sectionContainer: {
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
    paddingBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 8,
    color: "#00A86B",
  },
  inputLabel: {
    fontSize: 14,
    marginBottom: 8,
    color: "#333",
  },
  input: {
    backgroundColor: "#f9f9f9",
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    marginBottom: 12,
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: "top",
  },
  photoButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#00A86B",
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  photoButtonText: {
    color: "white",
    fontWeight: "bold",
    marginLeft: 8,
  },
  photoPreviewContainer: {
    marginBottom: 16,
  },
  photoPreview: {
    width: "100%",
    height: 200,
    borderRadius: 8,
    marginBottom: 8,
  },
  retakeButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#00A86B",
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    alignSelf: "flex-end",
  },
  dropdownContainer: {
    marginBottom: 16,
  },
  dropdownText: {
    fontSize: 14,
    marginBottom: 8,
    color: "#333",
  },
  dropdown: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#f9f9f9",
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  dropdownPlaceholder: {
    color: "#999",
  },
  inputContainer: {
    marginBottom: 16,
  },
  buttonsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  acceptButton: {
    backgroundColor: "#00A86B",
    borderRadius: 8,
    padding: 16,
    flex: 1,
    alignItems: "center",
    marginLeft: 16,
  },
  acceptButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
})

