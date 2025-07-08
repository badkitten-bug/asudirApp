import { useState, useRef, useCallback } from 'react';
import { Platform, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useDispatch, useSelector } from '@/store';
import { showSnackbar } from '@/store/snackbarSlice';
import { selectUser } from '@/store/authSlice';
import { addTicket } from '@/store/ticketsSlice';
import * as ImagePicker from 'expo-image-picker';
import { useFocusEffect } from '@react-navigation/native';
import NetInfo from '@react-native-community/netinfo';
import { useLecturaPozoForm } from '@/features/lectura-pozo/hooks/useLecturaPozoForm';
import { usePozoInfo } from '@/features/lectura-pozo/hooks/usePozoInfo';
import { validateForm } from '@/features/lectura-pozo/validation/lecturaPozo.validation';
import { crearLecturaPozoConFotos } from '@/features/lectura-pozo/api/lecturaPozoApi';

export const useNuevaCaptura = () => {
  const router = useRouter();
  const dispatch = useDispatch();
  const params = useLocalSearchParams();
  const user = useSelector(selectUser);

  // Parámetros del pozo
  const pozoId = (params.pozoId as string) || '';
  const pozoNombre = (params.pozoNombre as string) || 'N/A';
  const pozoUbicacion = (params.pozoUbicacion as string) || 'N/A';

  // Usar hook modularizado para el formulario
  const form = useLecturaPozoForm(pozoId);

  // Hook para obtener pozoInfo
  const { pozoInfo, refetch: refetchPozoInfo, loadingPozo } = usePozoInfo(
    pozoId,
    user?.token,
  );

  // Estado para mostrar el modal de previsualización
  const [showPreview, setShowPreview] = useState(false);

  // Estados para archivos web
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoFileElec, setPhotoFileElec] = useState<File | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const inputRefElec = useRef<HTMLInputElement>(null);

  // Refrescar automáticamente la info del pozo al entrar a la pantalla
  useFocusEffect(
    useCallback(() => {
      if (pozoId) {
        refetchPozoInfo();
      }
    }, [pozoId, refetchPozoInfo]),
  );

  // Función para volver al Panel de Control
  const handleBack = () => {
    router.back();
  };

  // Función para abrir la cámara
  const handleOpenCamera = () => {
    form.setShowCamera(true);
  };

  // Función para manejar la foto tomada
  const handlePhotoTaken = (uri: string) => {
    form.setPhotoUri(uri);
    form.setShowCamera(false);
    dispatch(
      showSnackbar({
        message: 'Foto del medidor volumétrico guardada correctamente',
        type: 'success',
        duration: 2000,
      }),
    );
  };

  // Función para cerrar la cámara
  const handleCloseCamera = () => {
    form.setShowCamera(false);
  };

  // Función para abrir la cámara del medidor eléctrico
  const handleOpenCameraElec = () => {
    form.setShowCameraElec(true);
  };

  // Función para manejar la foto del medidor eléctrico
  const handlePhotoTakenElec = (uri: string) => {
    form.setPhotoUriElec(uri);
    form.setShowCameraElec(false);
    dispatch(
      showSnackbar({
        message: 'Foto del medidor eléctrico guardada correctamente',
        type: 'success',
        duration: 2000,
      }),
    );
  };

  // Función para cerrar la cámara del medidor eléctrico
  const handleCloseCameraElec = () => {
    form.setShowCameraElec(false);
  };

  const handleGenerateTicket = () => {
    // Validar formulario completo usando la función modularizada
    const validation = validateForm(form, dispatch);
    if (!validation.isValid) {
      return;
    }

    if (Platform.OS === 'web') {
      const confirmed = window.confirm('¿Estás seguro de que todos los datos son correctos?');
      if (confirmed) setShowPreview(true);
    } else {
      Alert.alert('Confirmar Lectura', '¿Estás seguro de que todos los datos son correctos?', [
        { text: 'Revisar', style: 'cancel' },
        { text: 'Confirmar', onPress: () => setShowPreview(true) },
      ]);
    }
  };

  // Función para elegir foto volumétrico
  const handleChoosePhotoOption = () => {
    if (Platform.OS === 'web') {
      inputRef.current?.click();
    } else {
      Alert.alert('Agregar foto', '¿Qué deseas hacer?', [
        { text: 'Tomar foto', onPress: handleOpenCamera },
        { text: 'Elegir de galería', onPress: handlePickImage },
        { text: 'Cancelar', style: 'cancel' },
      ]);
    }
  };

  // Función para elegir foto eléctrico
  const handleChoosePhotoOptionElec = () => {
    if (Platform.OS === 'web') {
      inputRefElec.current?.click();
    } else {
      Alert.alert('Agregar foto', '¿Qué deseas hacer?', [
        { text: 'Tomar foto', onPress: handleOpenCameraElec },
        { text: 'Elegir de galería', onPress: handlePickImageElec },
        { text: 'Cancelar', style: 'cancel' },
      ]);
    }
  };

  // Handler para input file web (volumétrico)
  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhotoFile(file);
      form.setPhotoUri(URL.createObjectURL(file));
    }
  };

  // Handler para input file web (eléctrico)
  const handleFileInputChangeElec = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhotoFileElec(file);
      form.setPhotoUriElec(URL.createObjectURL(file));
    }
  };

  // Función para elegir imagen de galería (volumétrico)
  const handlePickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        form.setPhotoUri(result.assets[0].uri);
        dispatch(
          showSnackbar({
            message: 'Foto seleccionada correctamente',
            type: 'success',
            duration: 2000,
          }),
        );
      }
    } catch (error) {
      console.error('Error al seleccionar imagen:', error);
      dispatch(
        showSnackbar({
          message: 'Error al seleccionar imagen',
          type: 'error',
          duration: 3000,
        }),
      );
    }
  };

  // Función para elegir imagen de galería (eléctrico)
  const handlePickImageElec = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        form.setPhotoUriElec(result.assets[0].uri);
        dispatch(
          showSnackbar({
            message: 'Foto seleccionada correctamente',
            type: 'success',
            duration: 2000,
          }),
        );
      }
    } catch (error) {
      console.error('Error al seleccionar imagen:', error);
      dispatch(
        showSnackbar({
          message: 'Error al seleccionar imagen',
          type: 'error',
          duration: 3000,
        }),
      );
    }
  };

  // Función para confirmar la lectura
  const handleConfirmar = async () => {
    try {
      // Verificar conectividad
      const netInfo = await NetInfo.fetch();
      if (!netInfo.isConnected) {
        dispatch(
          showSnackbar({
            message: 'Sin conexión a internet. Los datos se guardarán localmente.',
            type: 'warning',
            duration: 4000,
          }),
        );
      }

      // Crear ticket local
      const ticketData = {
        id: form.generateTicketId(),
        fecha: form.fecha,
        pozoId: pozoId,
        pozoNombre: pozoNombre,
        pozoUbicacion: pozoUbicacion,
        lecturaVolumen: form.lecturaVolumen,
        gastoPozo: form.gastoPozo,
        lecturaElectrica: form.lecturaElectrica,
        observaciones: form.observaciones,
        anomalias: form.anomalias,
        photoUri: form.photoUri,
        photoUriElec: form.photoUriElec,
        capturadorId: user?.id,
        estado: 'pendiente',
      };

      dispatch(addTicket(ticketData));

      // Si hay conexión, intentar enviar al servidor
      if (netInfo.isConnected && user?.token) {
        try {
          await crearLecturaPozoConFotos(ticketData, user.token);
          dispatch(
            showSnackbar({
              message: 'Lectura enviada al servidor correctamente',
              type: 'success',
              duration: 3000,
            }),
          );
        } catch (error) {
          console.error('Error al enviar al servidor:', error);
          dispatch(
            showSnackbar({
              message: 'Error al enviar al servidor. Los datos se guardaron localmente.',
              type: 'warning',
              duration: 4000,
            }),
          );
        }
      }

      setShowPreview(false);
      router.replace('/(tabs)');
    } catch (error) {
      console.error('Error al confirmar lectura:', error);
      dispatch(
        showSnackbar({
          message: 'Error al confirmar la lectura',
          type: 'error',
          duration: 3000,
        }),
      );
    }
  };

  return {
    // Parámetros del pozo
    pozoId,
    pozoNombre,
    pozoUbicacion,
    
    // Formulario y datos
    form,
    pozoInfo,
    loadingPozo,
    
    // Estados de UI
    showPreview,
    photoFile,
    photoFileElec,
    inputRef,
    inputRefElec,
    
    // Handlers
    handleBack,
    handleOpenCamera,
    handlePhotoTaken,
    handleCloseCamera,
    handleOpenCameraElec,
    handlePhotoTakenElec,
    handleCloseCameraElec,
    handleGenerateTicket,
    handleChoosePhotoOption,
    handleChoosePhotoOptionElec,
    handleFileInputChange,
    handleFileInputChangeElec,
    handlePickImage,
    handlePickImageElec,
    handleConfirmar,
    setShowPreview,
  };
}; 