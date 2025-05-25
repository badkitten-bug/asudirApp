"use client"

import { useState } from "react"
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
const MEDIDOR_VOLUMETRICO_OPTIONS = [
  { label: "Funcionando", value: "funcionando" },
  { label: "Descompuesto", value: "descompuesto" },
  { label: "Cambio de medidor", value: "cambio" },
  { label: "Sin medidor", value: "sin_medidor" },
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

export default function NuevaCapturaScreen() {
  const router = useRouter()
  const dispatch = useDispatch()
  const params = useLocalSearchParams()

  // Estados para los campos del formulario
  const [lecturaVolumen, setLecturaVolumen] = useState("255000")
  const [cargaMotor, setCargaMotor] = useState("15.5")
  const [photoUri, setPhotoUri] = useState<string | null>(null)
  const [showCamera, setShowCamera] = useState(false)

  // Agregar estados para los selects después de los estados existentes
  const [estadoMedidorVolumetrico, setEstadoMedidorVolumetrico] = useState("funcionando")
  const [extraccionManual, setExtraccionManual] = useState("normal")
  const [tipoDescarga, setTipoDescarga] = useState("libre")
  const [distancia, setDistancia] = useState("35m")

  // Datos del pozo seleccionado
  const pozoId = (params.pozoId as string) || "1003"
  const pozoNombre = (params.pozoNombre as string) || "Pozo 1003"
  const pozoUbicacion = (params.pozoUbicacion as string) || "Las Cumbres"

  // Función para volver al Panel de Control
  const handleBack = () => {
    router.back()
  }

  // Función para ir a la siguiente pantalla
  const handleNext = () => {
    // Validación básica
    if (!lecturaVolumen.trim()) {
      dispatch(
        showSnackbar({
          message: "Por favor ingresa la lectura volumétrica",
          type: "warning",
          duration: 3000,
        }),
      )
      return
    }

    // Navegar a la siguiente pantalla (medidor eléctrico)
    router.push({
      pathname: "/(tabs)/medidor-electrico",
      params: {
        lecturaVolumen,
        cargaMotor,
        photoUri,
        pozoId,
        pozoNombre,
        pozoUbicacion,
      },
    })
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
        <Text style={styles.headerTitle}>Registrar Lectura de Agua</Text>
        
      </View>

      <Text style={styles.headerSubtitle}>Registro de captura de medición</Text>

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

            {/* Información del pozo */}
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>Información del Pozo</Text>
              <Text style={styles.sectionText}>ID: {pozoId}</Text>
              <Text style={styles.sectionText}>Ubicación: 28.123456, -78.654321</Text>
            </View>

            {/* Lecturas anteriores */}
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>Lecturas Anteriores</Text>
              <Text style={styles.sectionText}>Última lectura: 12/03/2023 - 15:00:00</Text>
              <Text style={styles.sectionText}>Lectura volumétrica: 50 m³/min</Text>
            </View>

            {/* Medidor Volumétrico */}
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>Medidor Volumétrico</Text>
              <Text style={styles.inputLabel}>Lectura Actual (m³)</Text>
              <TextInput
                style={styles.input}
                placeholder="Ingrese lectura volumétrica"
                value={lecturaVolumen}
                onChangeText={setLecturaVolumen}
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

            {/* Reemplazar los dropdowns existentes */}
            <SelectDropdown
              title="Estado del Medidor Volumétrico"
              options={MEDIDOR_VOLUMETRICO_OPTIONS}
              selectedValue={estadoMedidorVolumetrico}
              onSelect={setEstadoMedidorVolumetrico}
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
          </View>

          {/* Botón de siguiente */}
          <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
            <Text style={styles.nextButtonText}>Siguiente</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Modal de cámara */}
      <Modal visible={showCamera} animationType="slide" onRequestClose={handleCloseCamera}>
        <CameraScreen
          onPhotoTaken={handlePhotoTaken}
          onClose={handleCloseCamera}
          title="Foto del Medidor Volumétrico"
        />
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
  headerSubtitle: {
    fontSize: 14,
    color: "#666",
    paddingHorizontal: 16,
    paddingBottom: 8,
    backgroundColor: "#fff",
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
  },
  sectionText: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
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
  nextButton: {
    backgroundColor: "#00A86B",
    borderRadius: 8,
    padding: 16,
    alignItems: "center",
    marginTop: 8,
  },
  nextButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
})

