"use client"

import { useState, useEffect, useRef, useCallback } from "react"
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

import { addTicket, removeTicket } from '../../store/ticketsSlice'
import * as ImagePicker from 'expo-image-picker'
import { MedidorVolumetricoSection } from '../../features/lectura-pozo/MedidorVolumetricoSection'
import { ObservacionesSection } from '../../features/lectura-pozo/ObservacionesSection'
import { useLecturaPozoForm } from '../../features/lectura-pozo/useLecturaPozoForm'
import { crearLecturaPozoConFotos } from '../../features/lectura-pozo/lecturaPozoApi'
import {
  ANOMALIAS_VOLUMETRICO
} from '../../features/lectura-pozo/lecturaPozo.constants'
import { usePozoInfo } from '../../features/lectura-pozo/usePozoInfo'
import { FotosSection } from '../../features/lectura-pozo/FotosSection'
import { AnomaliasSection } from '../../features/lectura-pozo/AnomaliasSection'
import { TicketPreviewModalSection } from '../../features/lectura-pozo/TicketPreviewModalSection'
import {
  validateForm,
  validateAuth,
  validatePozoInfo,
  generateTicketId
} from '../../features/lectura-pozo/lecturaPozo.validation'
import { lecturaPozoStyles } from '../../features/lectura-pozo/lecturaPozo.styles'
import { crearLecturaPozo } from '../../features/lectura-pozo/lecturaPozoApi'
import { uploadFoto } from '../../features/lectura-pozo/lecturaPozoApi'
import { useFocusEffect } from '@react-navigation/native'
import NetInfo from '@react-native-community/netinfo'

const STATUSBAR_HEIGHT = Constants.statusBarHeight || 0

export default function NuevaCapturaScreen() {
  const router = useRouter()
  const dispatch = useDispatch()
  const params = useLocalSearchParams()
  const user = useSelector(selectUser)

  // Usar hook modularizado para el formulario
  const pozoId = (params.pozoId as string) || ""
  const pozoNombre = (params.pozoNombre as string) || "N/A"
  const pozoUbicacion = (params.pozoUbicacion as string) || "N/A"
  const form = useLecturaPozoForm(pozoId)

  // Hook para obtener pozoInfo
  const { pozoInfo, refetch: refetchPozoInfo, loadingPozo } = usePozoInfo(pozoId, user?.token)

  // Refrescar automáticamente la info del pozo al entrar a la pantalla
  useFocusEffect(
    useCallback(() => {
      if (pozoId) {
        refetchPozoInfo();
      }
    }, [pozoId, refetchPozoInfo])
  );

  // Función para volver al Panel de Control
  const handleBack = () => {
    router.back()
  }

  // Función para abrir la cámara
  const handleOpenCamera = () => {
    form.setShowCamera(true)
  }

  // Función para manejar la foto tomada
  const handlePhotoTaken = (uri: string) => {
    form.setPhotoUri(uri)
    form.setShowCamera(false)
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
    form.setShowCamera(false)
  }

  // Función para abrir la cámara del medidor eléctrico
  const handleOpenCameraElec = () => {
    form.setShowCameraElec(true)
  }

  // Función para manejar la foto del medidor eléctrico
  const handlePhotoTakenElec = (uri: string) => {
    form.setPhotoUriElec(uri)
    form.setShowCameraElec(false)
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
    form.setShowCameraElec(false)
  }

  const handleGenerateTicket = () => {
    // Validar formulario completo usando la función modularizada
    const validation = validateForm(form, dispatch);
    if (!validation.isValid) {
      return;
    }

    if (Platform.OS === 'web') {
      const confirmed = window.confirm("¿Estás seguro de que todos los datos son correctos?");
      if (confirmed) handleConfirmar();
    } else {
    Alert.alert(
      "Confirmar Lectura",
      "¿Estás seguro de que todos los datos son correctos?",
      [
          { text: "Revisar", style: "cancel" },
          { text: "Confirmar", onPress: handleConfirmar }
        ]
      )
    }
  }

  const inputRef = useRef<HTMLInputElement>(null);
  const inputRefElec = useRef<HTMLInputElement>(null);

  // --- MODIFICADO: Función para elegir foto volumétrico ---
  const handleChoosePhotoOption = () => {
    if (Platform.OS === 'web') {
      inputRef.current?.click();
    } else {
      Alert.alert(
        'Agregar foto',
        '¿Qué deseas hacer?',
        [
          { text: 'Tomar foto', onPress: handleOpenCamera },
          { text: 'Elegir de galería', onPress: handlePickImage },
          { text: 'Cancelar', style: 'cancel' },
        ]
      );
    }
  };

  // --- MODIFICADO: Función para elegir foto eléctrico ---
  const handleChoosePhotoOptionElec = () => {
    if (Platform.OS === 'web') {
      inputRefElec.current?.click();
    } else {
      Alert.alert(
        'Agregar foto',
        '¿Qué deseas hacer?',
        [
          { text: 'Tomar foto', onPress: handleOpenCameraElec },
          { text: 'Elegir de galería', onPress: handlePickImageElec },
          { text: 'Cancelar', style: 'cancel' },
        ]
      );
    }
  };

  // --- NUEVO: Handler para input file web (volumétrico) ---
  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      form.setPhotoFile(file);
      form.setPhotoUri(URL.createObjectURL(file));
    }
  };
  // --- NUEVO: Handler para input file web (eléctrico) ---
  const handleFileInputChangeElec = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      form.setPhotoFileElec(file);
      form.setPhotoUriElec(URL.createObjectURL(file));
    }
  };

  // --- NUEVO: Función para seleccionar imagen de galería (volumétrico) ---
  const handlePickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.7,
    });
    if (!result.canceled && result.assets && result.assets.length > 0) {
      handlePhotoTaken(result.assets[0].uri);
    }
  };

  // --- NUEVO: Función para seleccionar imagen de galería (eléctrico) ---
  const handlePickImageElec = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.7,
    });
    if (!result.canceled && result.assets && result.assets.length > 0) {
      handlePhotoTakenElec(result.assets[0].uri);
    }
  };

  const handleConfirmar = async () => {
    try {
      // Validar autenticación usando la función modularizada
      const authValidation = validateAuth(user, dispatch);
      if (!authValidation.isValid) return;
      // Validar información del pozo usando la función modularizada
      const pozoValidation = validatePozoInfo(pozoInfo, dispatch);
      if (!pozoValidation.isValid) return;

      // Construir el payload de la lectura
      const lecturaPayload: any = {
        fecha: new Date().toISOString(),
        lectura_volumetrica: String(form.lecturaVolumen),
        gasto: String(form.gasto),
        lectura_electrica: String(form.lecturaElectrica),
        observaciones: form.observaciones || undefined,
        pozo: pozoInfo?.id ? String(pozoInfo.id) : undefined,
        capturador: user?.id ? String(user.id) : undefined,
        estado: "pendiente"
      };
      if (form.anomaliasVol && form.anomaliasVol.length > 0) {
        lecturaPayload.anomalias_volumetrico = form.anomaliasVol;
      }
      if (form.anomaliasElec && form.anomaliasElec.length > 0) {
        lecturaPayload.anomalias_electrico = form.anomaliasElec;
      }
      Object.keys(lecturaPayload).forEach(key => lecturaPayload[key] === undefined && delete lecturaPayload[key]);

      // LOG DE DEPURACIÓN
      console.log('LECTURA PAYLOAD QUE ENVÍA LA APP:', lecturaPayload);

      // Preparar fotos para guardar localmente
      const fotos = [];
      if (Platform.OS === 'web' ? form.photoFile : form.photoUri) {
        fotos.push({
          field: 'foto_volumetrico',
          file: Platform.OS === 'web' ? form.photoFile : form.photoUri
        });
      }
      if (Platform.OS === 'web' ? form.photoFileElec : form.photoUriElec) {
        fotos.push({
          field: 'foto_electrico',
          file: Platform.OS === 'web' ? form.photoFileElec : form.photoUriElec
        });
      }

      // Guardar inmediatamente como pendiente local
      const pendingId = Date.now().toString();
      await dispatch(addTicket({
        id: pendingId,
        pozoId: pozoInfo?.id || '',
        pozoNombre: pozoNombre || '',
        pozoUbicacion: pozoUbicacion || '',
        lecturaVolumen: form.lecturaVolumen,
        lecturaElectrica: form.lecturaElectrica,
        cargaMotor: '',
        gastoPozo: form.gasto,
        observaciones: form.observaciones,
        fecha: new Date().toISOString().split('T')[0],
        hora: new Date().toLocaleTimeString(),
        estado: 'pendiente',
        photoVolumenUri: form.photoUri || '',
        photoElectricaUri: form.photoUriElec || '',
        token: user.token,
        capturadorId: user.id
      }));

      // Mostrar éxito inmediato
      dispatch(showSnackbar({ 
        message: 'Lectura guardada correctamente. Se sincronizará en segundo plano.', 
        type: 'success', 
        duration: 3000 
      }));

      // Navegar inmediatamente
      setTimeout(() => {
        router.replace('/(tabs)/seleccion-pozo');
      }, 1000);

      // Resetear formulario
      await form.resetForm();

      // Intentar sincronizar en segundo plano (sin bloquear la UI)
      NetInfo.fetch().then(netState => {
        if (netState.isConnected) {
          // Crear la lectura en el servidor
          crearLecturaPozo({
            apiUrl: process.env.EXPO_PUBLIC_API_URL,
            token: user!.token,
            data: lecturaPayload
          }).then(lecturaData => {
            const lecturaId = lecturaData.data?.id;
            if (!lecturaId) {
              console.log('No se pudo obtener ID de lectura del servidor');
              return;
            }

            // Subir fotos en paralelo
            const uploadPromises = fotos.map(async (foto) => {
              try {
                await uploadFoto({
                  apiUrl: process.env.EXPO_PUBLIC_API_URL,
                  token: user!.token,
                  uri: foto.file,
                  field: foto.field,
                  lecturaId,
                  filename: `${foto.field}.jpg`
                });
                return { success: true, field: foto.field };
              } catch (error) {
                console.log(`Error subiendo ${foto.field}:`, error);
                return { success: false, field: foto.field };
              }
            });

            Promise.all(uploadPromises).then(results => {
              const failedUploads = results.filter(r => !r.success);
              if (failedUploads.length === 0) {
                // Todo exitoso, remover de pendientes
                dispatch(removeTicket(pendingId));
                dispatch(showSnackbar({ 
                  message: 'Lectura sincronizada completamente con el servidor', 
                  type: 'success', 
                  duration: 2000 
                }));
              } else {
                console.log('Algunas fotos no se pudieron subir:', failedUploads);
                // Mantener como pendiente para reintentar
              }
            });
          }).catch(error => {
            console.log('Error sincronizando lectura:', error);
            // Mantener como pendiente para reintentar
          });
        }
      });

    } catch (error: any) {
      console.error('Error en handleConfirmar:', error)
      dispatch(showSnackbar({ 
        message: error?.message || 'Error al procesar la lectura', 
        type: 'error', 
        duration: 3000 
      }))
    }
  }

  if (!user) return null;

  return (
    <View style={lecturaPozoStyles.container}>
      {/* Configuración del StatusBar */}
      <RNStatusBar backgroundColor="#fff" barStyle="dark-content" translucent={true} />
      <StatusBar style="dark" />

      {/* Espacio para el StatusBar */}
      <View style={{ height: STATUSBAR_HEIGHT, backgroundColor: "#fff" }} />

      {/* Header */}
      <View style={lecturaPozoStyles.header}>
        <TouchableOpacity onPress={handleBack} style={lecturaPozoStyles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={lecturaPozoStyles.headerTitle}>Registrar Lectura de Agua</Text>
        <TouchableOpacity onPress={refetchPozoInfo} style={{marginLeft: 12}}>
          <Ionicons name="refresh" size={22} color="#007AFF" />
        </TouchableOpacity>
      </View>

      <Text style={lecturaPozoStyles.headerSubtitle}>Registro de captura de medición</Text>

      {/* Contenido */}
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={lecturaPozoStyles.keyboardView}>
        <ScrollView
          style={lecturaPozoStyles.content}
          contentContainerStyle={lecturaPozoStyles.contentContainer}
          keyboardShouldPersistTaps="handled"
        >
          {/* Card principal */}
          <View style={lecturaPozoStyles.card}>
            {/* Información del pozo */}
            <View style={lecturaPozoStyles.wellInfoContainer}>
              <Text style={lecturaPozoStyles.wellTitle}>{pozoNombre}</Text>
              <Text style={lecturaPozoStyles.wellSubtitle}>Ubicación: {pozoUbicacion}</Text>
            </View>

            {/* Información del pozo */}
            <View style={lecturaPozoStyles.sectionContainer}>
              <Text style={lecturaPozoStyles.sectionTitle}>Información del Pozo</Text>
              <Text style={lecturaPozoStyles.sectionText}>ID: {pozoInfo?.id ?? 'No disponible'}</Text>
              <Text style={lecturaPozoStyles.sectionText}>Nombre: {pozoInfo?.numeropozo ?? 'No disponible'}</Text>
              <Text style={lecturaPozoStyles.sectionText}>Ubicación: {pozoInfo?.predio ?? 'No disponible'}</Text>
              {pozoInfo?.localizacion && (
                <Text style={lecturaPozoStyles.sectionText}>Localización: {pozoInfo.localizacion}</Text>
              )}
              {pozoInfo?.profundidad && (
                <Text style={lecturaPozoStyles.sectionText}>Profundidad: {pozoInfo.profundidad} m</Text>
              )}
            </View>

            {/* Lecturas anteriores */}
            <View style={lecturaPozoStyles.sectionContainer}>
              <Text style={lecturaPozoStyles.sectionTitle}>Lecturas Anteriores</Text>
              <Text style={lecturaPozoStyles.sectionText}>No hay lecturas anteriores registradas.</Text>
            </View>

            {/* Medidor Volumétrico */}
            <MedidorVolumetricoSection
              lecturaVolumen={form.lecturaVolumen}
              setLecturaVolumen={form.setLecturaVolumen}
              gasto={form.gasto}
              setGasto={form.setGasto}
              photoUri={form.photoUri || ''}
              handleChoosePhotoOption={handleChoosePhotoOption}
              anomaliasVol={form.anomaliasVol}
              setAnomaliasVol={form.setAnomaliasVol}
              mostrarAnomaliasVol={form.mostrarAnomaliasVol}
              setMostrarAnomaliasVol={form.setMostrarAnomaliasVol}
              cambioSerieVol={form.cambioSerieVol}
              setCambioSerieVol={form.setCambioSerieVol}
              otroVol={form.otroVol}
              setOtroVol={form.setOtroVol}
              ANOMALIAS_VOLUMETRICO={ANOMALIAS_VOLUMETRICO}
              styles={lecturaPozoStyles}
              handleCheck={form.handleCheck}
            />
          </View>

          {/* --- Sección Medidor Eléctrico --- */}
          <View style={lecturaPozoStyles.card}>
            <Text style={[lecturaPozoStyles.sectionTitle, { color: '#00A86B' }]}>Medidor Eléctrico</Text>
            
            <FotosSection
              lecturaElectrica={form.lecturaElectrica}
              photoUriElec={form.photoUriElec || ''}
              showCameraElec={form.showCameraElec}
              setLecturaElectrica={form.setLecturaElectrica}
              setPhotoUriElec={form.setPhotoUriElec}
              setShowCameraElec={form.setShowCameraElec}
              handleOpenCameraElec={handleOpenCameraElec}
              handlePhotoTakenElec={handlePhotoTakenElec}
              handleCloseCameraElec={handleCloseCameraElec}
              handleChoosePhotoOptionElec={handleChoosePhotoOptionElec}
              handlePickImageElec={handlePickImageElec}
              styles={lecturaPozoStyles}
            />

            <AnomaliasSection
              mostrarAnomaliasElec={form.mostrarAnomaliasElec}
              anomaliasElec={form.anomaliasElec}
              cambioSerieElec={form.cambioSerieElec}
              otroElec={form.otroElec}
              setMostrarAnomaliasElec={form.setMostrarAnomaliasElec}
              setAnomaliasElec={form.setAnomaliasElec}
              setCambioSerieElec={form.setCambioSerieElec}
              setOtroElec={form.setOtroElec}
              handleCheck={form.handleCheck}
              styles={lecturaPozoStyles}
            />
          </View>

          {/* Observaciones */}
          <ObservacionesSection
            observaciones={form.observaciones}
            setObservaciones={form.setObservaciones}
            styles={lecturaPozoStyles}
          />

          {/* Botón de siguiente */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 16 }}>
            <TouchableOpacity style={[lecturaPozoStyles.button, { backgroundColor: '#eee' }]} onPress={handleBack}>
              <Text style={{ color: '#333' }}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={lecturaPozoStyles.submitButton}
              onPress={() => {
                if (Platform.OS === 'web') {
                  const confirmed = window.confirm("¿Estás seguro de que quieres enviar la lectura?");
                  if (confirmed) handleConfirmar();
                } else {
                  Alert.alert(
                    "Confirmar envío",
                    "¿Estás seguro de que quieres enviar la lectura?",
                    [
                      { text: "Cancelar", style: "cancel" },
                      { text: "Enviar", onPress: handleConfirmar }
                    ]
                  );
                }
              }}
            >
              <Text style={lecturaPozoStyles.submitButtonText}>Validar y Guardar</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Modal de cámara */}
      <Modal visible={form.showCamera} animationType="slide" onRequestClose={handleCloseCamera}>
        <CameraScreen
          onPhotoTaken={handlePhotoTaken}
          onClose={handleCloseCamera}
          title="Foto del Medidor Volumétrico"
        />
      </Modal>

      {Platform.OS === 'web' && (
        <>
          <input
            type="file"
            accept="image/*"
            style={{ display: 'none' }}
            ref={inputRef}
            onChange={handleFileInputChange}
          />
          <input
            type="file"
            accept="image/*"
            style={{ display: 'none' }}
            ref={inputRefElec}
            onChange={handleFileInputChangeElec}
          />
        </>
      )}
    </View>
  )
}

