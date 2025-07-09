import React, { useState } from 'react';
import { View, ScrollView, TouchableOpacity, Text } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSelector, useDispatch } from '@/store';
import { showSnackbar } from '@/store/snackbarSlice';
import { useLecturaPozoForm } from './useLecturaPozoForm';
import { usePozoInfo } from './usePozoInfo';
import { crearLecturaPozoConImagenes } from './api/lecturaPozoApi';
import { lecturaPozoStyles } from './lecturaPozo.styles';
import { AnomaliasSection } from './AnomaliasSection';
import { FotosSection } from './FotosSection';
import { MedidorElectricoSection } from './MedidorElectricoSection';
import { MedidorVolumetricoSection } from './MedidorVolumetricoSection';
import { ObservacionesSection } from './ObservacionesSection';
import { addPendingLectura } from '@/store/pendingLecturasSlice';
import { v4 as uuidv4 } from 'uuid';

type SubirFotoParams = {
  token: string;
  file: string | File | Blob;
  lecturaId: number;
  field: string;
};

async function subirFoto({ token, file, lecturaId, field }: SubirFotoParams) {
  const formData = new FormData();
  if (typeof file === 'string') {
    // Móvil (expo-image-picker): file es uri
    formData.append('files', {
      uri: file,
      name: `${field}.jpg`,
      type: 'image/jpeg',
    } as any);
  } else {
    // Web: file es File o Blob
    formData.append('files', file);
  }
  formData.append('ref', 'api::lectura-pozo.lectura-pozo');
  formData.append('refId', String(lecturaId));
  formData.append('field', field);

  const res = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/upload`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });
  if (!res.ok) throw new Error(`Error al subir ${field}`);
  return await res.json();
}

export default function LecturaPozoScreen() {
  const { pozoId } = useLocalSearchParams<{ pozoId: string }>();
  const router = useRouter();
  const dispatch = useDispatch();
  const user = useSelector((state: any) => state.auth.user);

  const {
    lecturaVolumen, setLecturaVolumen,
    photoUri, setPhotoUri,
    showCamera, setShowCamera,
    showCameraElec, setShowCameraElec,
    gasto, setGasto,
    mostrarAnomaliasVol, setMostrarAnomaliasVol,
    mostrarAnomaliasElec, setMostrarAnomaliasElec,
    anomaliasVol, setAnomaliasVol,
    anomaliasElec, setAnomaliasElec,
    cambioSerieVol, setCambioSerieVol,
    cambioSerieElec, setCambioSerieElec,
    otroVol, setOtroVol,
    otroElec, setOtroElec,
    lecturaElectrica, setLecturaElectrica,
    photoUriElec, setPhotoUriElec,
    observaciones, setObservaciones,
    handleLecturaVolumenChange,
    handleGastoChange,
    handleLecturaElectricaChange,
    handleCheck,
    resetForm,
  } = useLecturaPozoForm(pozoId || '');

  const { pozoInfo, loadingPozo, usuarioPozoId, cicloId } = usePozoInfo(pozoId || '', user?.token);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!user?.token) {
      dispatch(showSnackbar({ message: 'No hay token de autenticación', type: 'error', duration: 3000 }));
      return;
    }
    if (!pozoInfo) {
      dispatch(showSnackbar({ message: 'Información del pozo no disponible', type: 'error', duration: 3000 }));
      return;
    }
    setIsSubmitting(true);
    try {
      // 1. Guardar la lectura y fotos en pendientes
      const lecturaData = {
        pozo: pozoInfo.id,
        lectura_volumetrica: parseInt(lecturaVolumen) || 0,
        lectura_electrica: parseInt(lecturaElectrica) || 0,
        gasto: Math.min(parseInt(gasto) || 0, 200),
        anomalias_volumetrico: anomaliasVol,
        anomalias_electrico: anomaliasElec,
        cambio_serie_volumetrico: cambioSerieVol,
        cambio_serie_electrico: cambioSerieElec,
        otro_volumetrico: otroVol,
        otro_electrico: otroElec,
        observaciones: observaciones,
        capturador: user.id,
        fecha: new Date().toISOString(),
        estado: 'pendiente',
      };
      const fotos = [];
      if (photoUri) {
        fotos.push({ field: 'foto_volumetrico', file: photoUri });
      }
      if (photoUriElec) {
        fotos.push({ field: 'foto_electrico', file: photoUriElec });
      }
      dispatch(addPendingLectura({
        id: uuidv4(),
        data: lecturaData,
        fotos,
        createdAt: new Date().toISOString(),
      }));
      dispatch(showSnackbar({ message: 'Lectura guardada localmente. Se sincronizará en segundo plano.', type: 'info', duration: 4000 }));
      await resetForm();
      router.replace('/(tabs)/seleccion-pozo');
    } catch (error: any) {
      console.error('Error al guardar lectura local:', error);
      dispatch(showSnackbar({ message: error.message || 'Error al guardar la lectura local', type: 'error', duration: 5000 }));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loadingPozo) {
    return (
      <View style={lecturaPozoStyles.container}>
        <View style={lecturaPozoStyles.loadingContainer}>
          <Text style={lecturaPozoStyles.loadingText}>Cargando información del pozo...</Text>
        </View>
      </View>
    );
  }

  if (!pozoInfo) {
    return (
      <View style={lecturaPozoStyles.container}>
        <View style={lecturaPozoStyles.errorContainer}>
          <Text style={lecturaPozoStyles.errorText}>No se pudo cargar la información del pozo</Text>
        </View>
      </View>
    );
  }

  return (
    <ScrollView style={lecturaPozoStyles.container}>
      <View style={lecturaPozoStyles.content}>
        <MedidorVolumetricoSection
          lecturaVolumen={lecturaVolumen}
          setLecturaVolumen={setLecturaVolumen}
          gasto={gasto}
          setGasto={setGasto}
          photoUri={photoUri}
          handleChoosePhotoOption={() => setShowCamera(true)}
          anomaliasVol={anomaliasVol}
          setAnomaliasVol={setAnomaliasVol}
          mostrarAnomaliasVol={mostrarAnomaliasVol}
          setMostrarAnomaliasVol={setMostrarAnomaliasVol}
          cambioSerieVol={cambioSerieVol}
          setCambioSerieVol={setCambioSerieVol}
          otroVol={otroVol}
          setOtroVol={setOtroVol}
          ANOMALIAS_VOLUMETRICO={[]}
          styles={lecturaPozoStyles}
          handleCheck={handleCheck}
        />

        <MedidorElectricoSection
          lecturaElectrica={lecturaElectrica}
          setLecturaElectrica={setLecturaElectrica}
          photoUriElec={photoUriElec}
          handleChoosePhotoOptionElec={() => setShowCameraElec(true)}
          anomaliasElec={anomaliasElec}
          setAnomaliasElec={setAnomaliasElec}
          mostrarAnomaliasElec={mostrarAnomaliasElec}
          setMostrarAnomaliasElec={setMostrarAnomaliasElec}
          cambioSerieElec={cambioSerieElec}
          setCambioSerieElec={setCambioSerieElec}
          otroElec={otroElec}
          setOtroElec={setOtroElec}
          ANOMALIAS_ELECTRICO={[]}
          styles={lecturaPozoStyles}
          handleCheck={handleCheck}
        />

        <AnomaliasSection
          mostrarAnomaliasElec={mostrarAnomaliasElec}
          anomaliasElec={anomaliasElec}
          cambioSerieElec={cambioSerieElec}
          otroElec={otroElec}
          setMostrarAnomaliasElec={setMostrarAnomaliasElec}
          setAnomaliasElec={setAnomaliasElec}
          setCambioSerieElec={setCambioSerieElec}
          setOtroElec={setOtroElec}
          handleCheck={handleCheck}
          styles={lecturaPozoStyles}
        />

        <ObservacionesSection
          observaciones={observaciones}
          setObservaciones={setObservaciones}
          styles={lecturaPozoStyles}
        />

        <View style={lecturaPozoStyles.submitContainer}>
          <TouchableOpacity
            style={[lecturaPozoStyles.submitButton, isSubmitting && lecturaPozoStyles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={isSubmitting}
          >
            <Text style={lecturaPozoStyles.submitButtonText}>
              {isSubmitting ? 'Guardando...' : 'Guardar Lectura'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}
