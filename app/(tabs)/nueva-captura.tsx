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
  Alert,
} from "react-native"
import { StatusBar } from "expo-status-bar"
import { Ionicons } from "@expo/vector-icons"
import { useRouter, useLocalSearchParams } from "expo-router"
import { useDispatch, useSelector } from "../../store"
import { showSnackbar } from "../../store/snackbarSlice"
import Constants from "expo-constants"
import CameraScreen from "../../components/CameraScreen"
import Checkbox from '../../components/Checkbox'
import { selectUser } from '../../store/authSlice'

// Importar el componente SelectDropdown
import SelectDropdown from "../../components/SelectDropdown"
import TicketPreviewModal from '../../components/TicketPreviewModal'
import { addTicket } from '../../store/ticketsSlice'

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

// ANOMALIAS ACTUALIZADAS PARA MEDIDOR VOLUMÉTRICO
const ANOMALIAS_VOLUMETRICO = [
  'Medidor Apagado',
  'Sin medidor',
  'Pozo encendido, medidor no marca gasto',
  'Sin Acceso',
  'Lectura ilegible',
  'Cambio de Medidor',
  'Holograma violado',
  'Holograma despegado',
  'Pozo desequipado',
  'Pozo mantenimiento',
  'Otro',
];

// ANOMALIAS ACTUALIZADAS PARA MEDIDOR ELÉCTRICO
const ANOMALIAS_ELECTRICO = [
  'Medidor Apagado',
  'Sin medidor',
  'Sin Acceso',
  'Lectura ilegible',
  'Cambio de Medidor',
  'Medidor descompuesto',
  'Otro',
];

export default function NuevaCapturaScreen() {
  const router = useRouter()
  const dispatch = useDispatch()
  const params = useLocalSearchParams()
  const user = useSelector(selectUser)

  // Estados para los campos del formulario
  const [lecturaVolumen, setLecturaVolumen] = useState("0")
  const [photoUri, setPhotoUri] = useState<string | null>(null)
  const [showCamera, setShowCamera] = useState(false)
  const [showCameraElec, setShowCameraElec] = useState(false)
  const [gasto, setGasto] = useState('0')
  // Mostrar/ocultar anomalías
  const [mostrarAnomaliasVol, setMostrarAnomaliasVol] = useState(false)
  const [mostrarAnomaliasElec, setMostrarAnomaliasElec] = useState(false)

  // Datos del pozo seleccionado
  const pozoId = (params.pozoId as string) || ""
  const pozoNombre = (params.pozoNombre as string) || "N/A"
  const pozoUbicacion = (params.pozoUbicacion as string) || "N/A"

  // Agregar nuevos estados
  const [anomaliasVol, setAnomaliasVol] = useState<string[]>([])
  const [anomaliasElec, setAnomaliasElec] = useState<string[]>([])
  const [cambioSerieVol, setCambioSerieVol] = useState('')
  const [cambioSerieElec, setCambioSerieElec] = useState('')
  const [otroVol, setOtroVol] = useState('')
  const [otroElec, setOtroElec] = useState('')
  const [lecturaElectrica, setLecturaElectrica] = useState('')
  const [photoUriElec, setPhotoUriElec] = useState<string | null>(null)
  const [observaciones, setObservaciones] = useState('')

  // Nuevo estado para la información del pozo
  const [pozoInfo, setPozoInfo] = useState<any>(null)
  const [loadingPozo, setLoadingPozo] = useState(true)
  const [usuarioPozoId, setUsuarioPozoId] = useState<number | null>(null)
  const [cicloId, setCicloId] = useState<number | null>(null)

  // Estado para mostrar el modal de previsualización
  const [showPreview, setShowPreview] = useState(false)

  // Función para validar lectura volumétrica (solo enteros)
  const handleLecturaVolumenChange = (text: string) => {
    // Solo permitir números enteros
    const numericValue = text.replace(/[^0-9]/g, '')
    setLecturaVolumen(numericValue)
  }

  // Función para validar gasto (no más de 200)
  const handleGastoChange = (text: string) => {
    const numericValue = text.replace(/[^0-9]/g, '')
    const value = parseInt(numericValue) || 0
    if (value <= 200) {
      setGasto(numericValue)
    } else {
      dispatch(showSnackbar({
        message: "El gasto no puede ser mayor a 200 l/s",
        type: "warning",
        duration: 3000,
      }))
    }
  }

  // Función para validar lectura eléctrica (solo enteros)
  const handleLecturaElectricaChange = (text: string) => {
    const numericValue = text.replace(/[^0-9]/g, '')
    setLecturaElectrica(numericValue)
  }

  // Función para validar que se tomen las 2 fotos obligatorias
  const validatePhotos = () => {
    if (!photoUri) {
      dispatch(showSnackbar({
        message: "Es obligatorio tomar foto del medidor volumétrico",
        type: "warning",
        duration: 3000,
      }))
      return false
    }
    if (!photoUriElec) {
      dispatch(showSnackbar({
        message: "Es obligatorio tomar foto del medidor eléctrico",
        type: "warning",
        duration: 3000,
      }))
      return false
    }
    return true
  }

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
        pozoId: pozoId,
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
        message: "Foto del medidor volumétrico guardada correctamente",
        type: "success",
        duration: 2000,
      }),
    )
  }

  // Función para cerrar la cámara
  const handleCloseCamera = () => {
    setShowCamera(false)
  }

  // Función para abrir la cámara del medidor eléctrico
  const handleOpenCameraElec = () => {
    setShowCameraElec(true)
  }

  // Función para manejar la foto del medidor eléctrico
  const handlePhotoTakenElec = (uri: string) => {
    setPhotoUriElec(uri)
    setShowCameraElec(false)
    dispatch(
      showSnackbar({
        message: "Foto del medidor eléctrico guardada correctamente",
        type: "success",
        duration: 2000,
      }),
    )
  }

  // Función para cerrar la cámara del medidor eléctrico
  const handleCloseCameraElec = () => {
    setShowCameraElec(false)
  }

  // Checkbox handler
  const handleCheck = (arr: string[], setArr: (v: string[]) => void, value: string) => {
    if (arr.includes(value)) {
      setArr(arr.filter(a => a !== value))
    } else {
      setArr([...arr, value])
    }
  }

  const handleGenerateTicket = () => {
    // Validar que se tomen las 2 fotos obligatorias
    if (!validatePhotos()) {
      return
    }

    // Validar que se ingrese lectura volumétrica
    if (!lecturaVolumen.trim() || parseInt(lecturaVolumen) === 0) {
      dispatch(showSnackbar({
        message: "Por favor ingresa la lectura volumétrica",
        type: "warning",
        duration: 3000,
      }))
      return
    }

    // Validar que se ingrese lectura eléctrica
    if (!lecturaElectrica.trim() || parseInt(lecturaElectrica) === 0) {
      dispatch(showSnackbar({
        message: "Por favor ingresa la lectura eléctrica",
        type: "warning",
        duration: 3000,
      }))
      return
    }

    // Mostrar confirmación antes de generar el ticket
    Alert.alert(
      "Confirmar Lectura",
      "¿Estás seguro de que todos los datos son correctos?",
      [
        {
          text: "Revisar",
          style: "cancel"
        },
        {
          text: "Confirmar",
          onPress: () => setShowPreview(true)
        }
      ]
    )
  }

  const handleConfirmar = async () => {
    try {
      if (!user || !user.token) {
        dispatch(showSnackbar({ message: 'No autenticado', type: 'error', duration: 3000 }))
        return
      }
      if (!pozoInfo || !pozoInfo.id || !pozoInfo.usuario_pozos?.[0]?.id) {
        dispatch(showSnackbar({ message: 'No se pudo obtener pozo o usuario_pozos', type: 'error', duration: 3000 }))
        return
      }

      // 1. GENERAR TICKET LOCAL (para constancia del capturador)
      const ticketLocal = {
        id: `TICKET-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        pozoId: pozoInfo.id,
        pozoNombre,
        pozoUbicacion,
        lecturaVolumen,
        gasto,
        lecturaElectrica,
        cargaMotor: lecturaElectrica, // Usar lectura eléctrica como carga del motor
        gastoPozo: gasto, // Usar gasto como gasto del pozo
        observaciones,
        fecha: new Date().toISOString().split("T")[0],
        hora: new Date().toTimeString().split(" ")[0],
        estado: "pendiente" as const,
        photoVolumen: photoUri || undefined,
        photoElectrica: photoUriElec || undefined,
      }

      // Guardar ticket local en el store
      dispatch(addTicket(ticketLocal))

      // 2. ENVIAR AL BACKEND (SIN SUBIR ARCHIVOS)
      // Armar el payload para el backend
      const payload: any = {
        data: {
          fecha: new Date().toISOString(),
          volumen: Number(lecturaVolumen),
          gasto: Number(gasto),
          lectura_electrica: Number(lecturaElectrica),
          observaciones,
          pozo: pozoInfo.id,
          usuario_pozo: pozoInfo.usuario_pozos[0].id,
          capturador: user.id,
          estado: "pendiente",
        }
      }
      
      // Solo agregar ciclo si existe
      if (pozoInfo.ciclo_agricola?.id) {
        payload.data.ciclo = pozoInfo.ciclo_agricola.id
      }
      
      // Solo agregar anomalías si hay alguna seleccionada
      if (mostrarAnomaliasVol && anomaliasVol.length > 0) {
        const anomaliasVolValidas = anomaliasVol.filter(anomalia => 
          ["Medidor Apagado", "Sin medidor", "Pozo encendido, medidor no marca gasto", 
           "Sin Acceso", "Lectura ilegible", "Cambio de Medidor", "Holograma violado",
           "Holograma despegado", "Pozo desequipado", "Pozo mantenimiento", "Otro"].includes(anomalia)
        )
        if (anomaliasVolValidas.length > 0) {
          payload.data.anomalias_volumetrico = anomaliasVolValidas
          if (otroVol) payload.data.detalle_otro_volumetrico = otroVol
          if (cambioSerieVol) payload.data.detalle_cambio_medidor_volumetrico = cambioSerieVol
        }
      }
      
      if (mostrarAnomaliasElec && anomaliasElec.length > 0) {
        const anomaliasElecValidas = anomaliasElec.filter(anomalia => 
          ["Medidor Apagado", "Sin medidor", "Sin Acceso", 
           "Lectura ilegible", "Cambio de Medidor", "Medidor descompuesto", "Otro"].includes(anomalia)
        )
        if (anomaliasElecValidas.length > 0) {
          payload.data.anomalias_electrico = anomaliasElecValidas
          if (otroElec) payload.data.detalle_otro_electrico = otroElec
          if (cambioSerieElec) payload.data.detalle_cambio_medidor_electrico = cambioSerieElec
        }
      }
      
      // POST a lectura-pozos
      const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/lectura-pozos`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify(payload)
      })
      
      if (!response.ok) {
        throw new Error('Error al guardar la lectura en el servidor')
      }
      
      const result = await response.json()
      
      // 3. MOSTRAR CONFIRMACIÓN Y NAVEGAR AL TICKET
      dispatch(showSnackbar({ 
        message: 'Lectura guardada correctamente. Ticket generado.', 
        type: 'success', 
        duration: 3000 
      }))
      
      // Navegar al ticket generado
      setTimeout(() => {
        router.push({ 
          pathname: '/(tabs)/ticket', 
          params: { 
            ticketId: ticketLocal.id,
            lecturaId: result.data?.id,
            pozoId: pozoInfo.id, 
            pozoNombre, 
            pozoUbicacion, 
            lecturaVolumen, 
            lecturaElectrica, 
            gasto, 
            observaciones 
          } 
        })
      }, 2000)
      
    } catch (error: any) {
      console.error('Error en handleConfirmar:', error)
      dispatch(showSnackbar({ 
        message: error?.message || 'Error al procesar la lectura', 
        type: 'error', 
        duration: 3000 
      }))
    }
  }

  useEffect(() => {
    const fetchPozo = async () => {
      setLoadingPozo(true)
      try {
        console.log('🔍 Fetching pozo with ID:', pozoId)
        console.log('🔍 API URL:', process.env.EXPO_PUBLIC_API_URL)
        console.log('🔍 User token:', user?.token ? 'Present' : 'Missing')
        
        // Usar documentId en el endpoint y enviar el token en el header
        const res = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/pozos/${pozoId}?populate[usuario_pozos]=true&populate[ciclo_agricola]=true`, {
          headers: {
            'Authorization': `Bearer ${user?.token}`,
            'Content-Type': 'application/json',
          }
        })
        
        console.log('🔍 Response status:', res.status)
        
        if (!res.ok) {
          console.error('❌ Error response:', res.status, res.statusText)
          const errorText = await res.text()
          console.error('❌ Error body:', errorText)
          throw new Error(`HTTP ${res.status}: ${res.statusText}`)
        }
        
        const data = await res.json()
        console.log('✅ Pozo data received:', JSON.stringify(data, null, 2))
        
        setPozoInfo(data.data)
        // usuario_pozos es un array, tomar el primer usuario
        const primerUsuario = data.data?.usuario_pozos?.[0] ?? null
        setUsuarioPozoId(primerUsuario?.id ?? null)
        setCicloId(data.data?.ciclo_agricola?.id ?? null)
        
        console.log('✅ Pozo info set:', {
          id: data.data?.id,
          numeropozo: data.data?.numeropozo,
          predio: data.data?.predio,
          usuario_pozos_count: data.data?.usuario_pozos?.length ?? 0,
          primer_usuario_id: primerUsuario?.id,
          ciclo_id: data.data?.ciclo_agricola?.id
        })
        
      } catch (e) {
        console.error('❌ Error fetching pozo:', e)
        setPozoInfo(null)
        setUsuarioPozoId(null)
        setCicloId(null)
      } finally {
        setLoadingPozo(false)
      }
    }
    if (pozoId && user?.token) {
      fetchPozo()
    } else {
      console.log('⚠️ Missing pozoId or user token:', { pozoId, hasToken: !!user?.token })
    }
  }, [pozoId, user?.token])

  useEffect(() => {
    // Limpiar todos los campos del formulario al cambiar de pozo
    setLecturaVolumen("0");
    setPhotoUri(null);
    setShowCamera(false);
    setGasto('0');
    setMostrarAnomaliasVol(false);
    setMostrarAnomaliasElec(false);
    setAnomaliasVol([]);
    setAnomaliasElec([]);
    setCambioSerieVol('');
    setCambioSerieElec('');
    setOtroVol('');
    setOtroElec('');
    setLecturaElectrica('');
    setPhotoUriElec(null);
    setObservaciones('');
    setPozoInfo(null);
    setLoadingPozo(true);
    setUsuarioPozoId(null);
    setCicloId(null);
  }, [pozoId]);

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
              <Text style={styles.sectionText}>ID: {pozoInfo?.id ?? 'No disponible'}</Text>
              <Text style={styles.sectionText}>Nombre: {pozoInfo?.numeropozo ?? 'No disponible'}</Text>
              <Text style={styles.sectionText}>Ubicación: {pozoInfo?.predio ?? 'No disponible'}</Text>
              {pozoInfo?.localizacion && (
                <Text style={styles.sectionText}>Localización: {pozoInfo.localizacion}</Text>
              )}
              {pozoInfo?.profundidad && (
                <Text style={styles.sectionText}>Profundidad: {pozoInfo.profundidad} m</Text>
              )}
            </View>

            {/* Lecturas anteriores */}
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>Lecturas Anteriores</Text>
              <Text style={styles.sectionText}>No hay lecturas anteriores registradas.</Text>
            </View>

            {/* Medidor Volumétrico */}
            <View style={styles.sectionContainer}>
              <Text style={[styles.sectionTitle, { color: '#00A86B' }]}>Medidor Volumétrico</Text>
              <Text style={styles.inputLabel}>Lectura Volumétrica (m³) *</Text>
              <TextInput
                style={styles.input}
                placeholder="Ingrese lectura volumétrica (solo números enteros)"
                value={lecturaVolumen}
                onChangeText={handleLecturaVolumenChange}
                keyboardType="numeric"
              />
              <Text style={styles.inputLabel}>Gasto (l/s) - Máximo 200 *</Text>
              <TextInput
                style={styles.input}
                placeholder="Ingrese gasto volumétrico (máximo 200)"
                value={gasto}
                onChangeText={handleGastoChange}
                keyboardType="numeric"
              />

              {/* Foto obligatoria del medidor volumétrico */}
              <Text style={[styles.inputLabel, { color: '#e74c3c', fontWeight: 'bold' }]}>Foto del Medidor Volumétrico *</Text>
              {photoUri ? (
                <View style={styles.photoPreviewContainer}>
                  <Image source={{ uri: photoUri }} style={styles.photoPreview} />
                  <TouchableOpacity style={styles.retakeButton} onPress={handleOpenCamera}>
                    <Ionicons name="camera" size={20} color="white" />
                    <Text style={styles.photoButtonText}>Volver a tomar</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity style={[styles.photoButton, { backgroundColor: '#e74c3c' }]} onPress={handleOpenCamera}>
                  <Ionicons name="camera-outline" size={20} color="white" />
                  <Text style={styles.photoButtonText}>Tomar Foto (Obligatorio)</Text>
                </TouchableOpacity>
              )}

              {/* Anomalías volumétrico */}
              <View style={{ marginBottom: 12 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                  <Checkbox checked={mostrarAnomaliasVol} onPress={() => setMostrarAnomaliasVol(!mostrarAnomaliasVol)} />
                  <Text style={{ marginLeft: 8 }}>¿Hay anomalías en el medidor volumétrico?</Text>
                </View>
                {mostrarAnomaliasVol && (
                  <View style={{ backgroundColor: '#fafafa', borderRadius: 8, padding: 8 }}>
                    {ANOMALIAS_VOLUMETRICO.map((anomalia) => (
                      <View key={anomalia} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                        <Checkbox checked={anomaliasVol.includes(anomalia)} onPress={() => handleCheck(anomaliasVol, setAnomaliasVol, anomalia)} />
                        <Text style={{ marginLeft: 8 }}>{anomalia}</Text>
                        {anomalia === 'Cambio de Medidor' && anomaliasVol.includes('Cambio de Medidor') && (
                          <TextInput style={[styles.input, { marginLeft: 8, flex: 1 }]} placeholder="Ingresar número de serie del nuevo medidor" value={cambioSerieVol} onChangeText={setCambioSerieVol} />
                        )}
                        {anomalia === 'Otro' && anomaliasVol.includes('Otro') && (
                          <TextInput style={[styles.input, { marginLeft: 8, flex: 1 }]} placeholder="Describa la anomalía" value={otroVol} onChangeText={setOtroVol} />
                        )}
                      </View>
                    ))}
                  </View>
                )}
              </View>
            </View>
          </View>

          {/* --- Sección Medidor Eléctrico --- */}
          <View style={styles.card}>
            <Text style={[styles.sectionTitle, { color: '#00A86B' }]}>Medidor Eléctrico</Text>
            <Text style={styles.inputLabel}>Lectura Eléctrica (kWh) *</Text>
            <TextInput
              style={styles.input}
              placeholder="Ingrese la lectura eléctrica (solo números enteros)"
              value={lecturaElectrica}
              onChangeText={handleLecturaElectricaChange}
              keyboardType="numeric"
            />

            {/* Foto obligatoria del medidor eléctrico */}
            <Text style={[styles.inputLabel, { color: '#e74c3c', fontWeight: 'bold' }]}>Foto del Medidor Eléctrico *</Text>
            {photoUriElec ? (
              <View style={styles.photoPreviewContainer}>
                <Image source={{ uri: photoUriElec }} style={styles.photoPreview} />
                <TouchableOpacity style={styles.retakeButton} onPress={handleOpenCameraElec}>
                  <Ionicons name="camera" size={20} color="white" />
                  <Text style={styles.photoButtonText}>Volver a tomar</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity style={[styles.photoButton, { backgroundColor: '#e74c3c' }]} onPress={handleOpenCameraElec}>
                <Ionicons name="camera-outline" size={20} color="white" />
                <Text style={styles.photoButtonText}>Tomar Foto (Obligatorio)</Text>
              </TouchableOpacity>
            )}

            {/* Anomalías eléctrico */}
            <View style={{ marginBottom: 12 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                <Checkbox checked={mostrarAnomaliasElec} onPress={() => setMostrarAnomaliasElec(!mostrarAnomaliasElec)} />
                <Text style={{ marginLeft: 8 }}>¿Hay anomalías en el medidor eléctrico?</Text>
              </View>
              {mostrarAnomaliasElec && (
                <View style={{ backgroundColor: '#fafafa', borderRadius: 8, padding: 8 }}>
                  {ANOMALIAS_ELECTRICO.map((anomalia) => (
                    <View key={anomalia} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                      <Checkbox checked={anomaliasElec.includes(anomalia)} onPress={() => handleCheck(anomaliasElec, setAnomaliasElec, anomalia)} />
                      <Text style={{ marginLeft: 8 }}>{anomalia}</Text>
                      {anomalia === 'Cambio de Medidor' && anomaliasElec.includes('Cambio de Medidor') && (
                        <TextInput style={[styles.input, { marginLeft: 8, flex: 1 }]} placeholder="Ingresar número de serie del nuevo medidor" value={cambioSerieElec} onChangeText={setCambioSerieElec} />
                      )}
                      {anomalia === 'Otro' && anomaliasElec.includes('Otro') && (
                        <TextInput style={[styles.input, { marginLeft: 8, flex: 1 }]} placeholder="Describa la anomalía" value={otroElec} onChangeText={setOtroElec} />
                      )}
                    </View>
                  ))}
                </View>
              )}
            </View>
          </View>

          {/* Observaciones */}
          <View style={styles.card}>
            <Text style={styles.inputLabel}>Observaciones</Text>
            <TextInput
              style={[styles.input, { minHeight: 60 }]}
              placeholder="Ingrese cualquier información relevante"
              value={observaciones}
              onChangeText={setObservaciones}
              multiline
            />
          </View>

          {/* Botón de siguiente */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 16 }}>
            <TouchableOpacity style={[styles.button, { backgroundColor: '#eee' }]} onPress={handleBack}>
              <Text style={{ color: '#333' }}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[
                styles.button, 
                { 
                  backgroundColor: photoUri && photoUriElec && lecturaVolumen && lecturaElectrica ? '#00A86B' : '#ccc'
                }
              ]} 
              onPress={handleGenerateTicket}
              disabled={!photoUri || !photoUriElec || !lecturaVolumen || !lecturaElectrica}
            >
              <Text style={{ color: '#fff', fontWeight: 'bold' }}>
                {photoUri && photoUriElec && lecturaVolumen && lecturaElectrica ? 'Validar y Guardar' : 'Completar Datos'}
              </Text>
            </TouchableOpacity>
          </View>
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

      {/* Modal de cámara para medidor eléctrico */}
      <Modal visible={showCameraElec} animationType="slide" onRequestClose={handleCloseCameraElec}>
        <CameraScreen
          onPhotoTaken={handlePhotoTakenElec}
          onClose={handleCloseCameraElec}
          title="Foto del Medidor Eléctrico"
        />
      </Modal>

      <TicketPreviewModal
        visible={showPreview}
        onClose={() => setShowPreview(false)}
        onConfirm={async () => {
          setShowPreview(false)
          await handleConfirmar()
        }}
        ticketData={{
          pozoNombre,
          pozoId: pozoId,
          volumen: lecturaVolumen,
          gasto,
          lecturaElectrica,
          observaciones,
          anomaliasVol,
          anomaliasElec,
          fecha: new Date().toLocaleDateString(),
        }}
      />
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
  button: {
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
  },
})

