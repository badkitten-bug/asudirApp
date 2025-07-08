import React, { useState, useEffect } from 'react';
import { View, ScrollView, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSelector } from '@/store';
import { showSnackbar } from '@/store/snackbarSlice';
import { useDispatch } from '@/store';
import { useLecturaPozoForm } from './hooks/useLecturaPozoForm';
import { usePozoInfo } from './hooks/usePozoInfo';
import { crearLecturaPozo, crearLecturaPozoConFotos } from './api/lecturaPozoApi';
import { styles } from './styles/lecturaPozo.styles';
import { AnomaliasSection } from './components/AnomaliasSection';
import { FotosSection } from './components/FotosSection';
import { MedidorElectricoSection } from './components/MedidorElectricoSection';
import { MedidorVolumetricoSection } from './components/MedidorVolumetricoSection';
import { ObservacionesSection } from './components/ObservacionesSection';

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
      dispatch(showSnackbar({
        message: 'No hay token de autenticación',
        type: 'error',
        duration: 3000,
      }));
      return;
    }

    if (!pozoInfo) {
      dispatch(showSnackbar({
        message: 'Información del pozo no disponible',
        type: 'error',
        duration: 3000,
      }));
      return;
    }

    setIsSubmitting(true);

    try {
      const lecturaData = {
        pozo: pozoInfo.id,
        usuario_pozo: usuarioPozoId,
        ciclo_agricola: cicloId,
        lectura_volumetrica: parseInt(lecturaVolumen) || 0,
        lectura_electrica: parseInt(lecturaElectrica) || 0,
        gasto: parseInt(gasto) || 0,
        anomalias_volumetrico: anomaliasVol,
        anomalias_electrico: anomaliasElec,
        cambio_serie_volumetrico: cambioSerieVol,
        cambio_serie_electrico: cambioSerieElec,
        otro_volumetrico: otroVol,
        otro_electrico: otroElec,
        observaciones: observaciones,
        capturador: user.id,
        fecha: new Date().toISOString(),
      };

      let result;
      
      if (photoUri || photoUriElec) {
        result = await crearLecturaPozoConFotos({
          token: user.token,
          data: lecturaData,
          fotoVolumetricoUri: photoUri || undefined,
          fotoElectricoUri: photoUriElec || undefined,
        });
      } else {
        result = await crearLecturaPozo({
          token: user.token,
          data: lecturaData,
        });
      }

      console.log('Lectura creada exitosamente:', result);

      dispatch(showSnackbar({
        message: 'Lectura guardada exitosamente',
        type: 'success',
        duration: 3000,
      }));

      await resetForm();
      router.back();
    } catch (error: any) {
      console.error('Error al guardar lectura:', error);
      
      dispatch(showSnackbar({
        message: error.message || 'Error al guardar la lectura',
        type: 'error',
        duration: 5000,
      }));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loadingPozo) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Cargando información del pozo...</Text>
        </View>
      </View>
    );
  }

  if (!pozoInfo) {
    return (
      <View style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>No se pudo cargar la información del pozo</Text>
        </View>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <MedidorVolumetricoSection
          lecturaVolumen={lecturaVolumen}
          onLecturaChange={handleLecturaVolumenChange}
          photoUri={photoUri}
          setPhotoUri={setPhotoUri}
          showCamera={showCamera}
          setShowCamera={setShowCamera}
          pozoInfo={pozoInfo}
        />

        <MedidorElectricoSection
          lecturaElectrica={lecturaElectrica}
          onLecturaChange={handleLecturaElectricaChange}
          photoUriElec={photoUriElec}
          setPhotoUriElec={setPhotoUriElec}
          showCameraElec={showCameraElec}
          setShowCameraElec={setShowCameraElec}
          pozoInfo={pozoInfo}
        />

        <AnomaliasSection
          mostrarAnomaliasVol={mostrarAnomaliasVol}
          setMostrarAnomaliasVol={setMostrarAnomaliasVol}
          mostrarAnomaliasElec={mostrarAnomaliasElec}
          setMostrarAnomaliasElec={setMostrarAnomaliasElec}
          anomaliasVol={anomaliasVol}
          setAnomaliasVol={setAnomaliasVol}
          anomaliasElec={anomaliasElec}
          setAnomaliasElec={setAnomaliasElec}
          cambioSerieVol={cambioSerieVol}
          setCambioSerieVol={setCambioSerieVol}
          cambioSerieElec={cambioSerieElec}
          setCambioSerieElec={setCambioSerieElec}
          otroVol={otroVol}
          setOtroVol={setOtroVol}
          otroElec={otroElec}
          setOtroElec={setOtroElec}
          handleCheck={handleCheck}
        />

        <ObservacionesSection
          observaciones={observaciones}
          setObservaciones={setObservaciones}
        />

        <View style={styles.submitContainer}>
          <TouchableOpacity
            style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={isSubmitting}
          >
            <Text style={styles.submitButtonText}>
              {isSubmitting ? 'Guardando...' : 'Guardar Lectura'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}
