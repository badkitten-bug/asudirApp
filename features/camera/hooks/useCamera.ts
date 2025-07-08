import { useState, useRef, useEffect } from 'react';
import { Animated, Platform } from 'react-native';
import { CameraType, FlashMode, useCameraPermissions } from 'expo-camera';
import * as MediaLibrary from 'expo-media-library';

export const useCamera = () => {
  // Estados para la cámara
  const [facing, setFacing] = useState<CameraType>('back');
  const [flash, setFlash] = useState<FlashMode>('off');
  const [zoom, setZoom] = useState(0);
  const [isTakingPicture, setIsTakingPicture] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [showControls, setShowControls] = useState(true);

  // Animaciones
  const fadeAnim = useRef(new Animated.Value(1)).current;

  // Referencias
  const cameraRef = useRef<any>(null);

  // Permisos
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const [mediaLibraryPermission, setMediaLibraryPermission] = useState<boolean | null>(null);

  // Solicitar permisos al montar el componente
  useEffect(() => {
    const getPermissions = async () => {
      if (!cameraPermission?.granted) {
        await requestCameraPermission();
      }

      // Solicitar permisos de MediaLibrary
      const { status } = await MediaLibrary.requestPermissionsAsync();
      setMediaLibraryPermission(status === 'granted');
    };

    getPermissions();
  }, []);

  // Efecto para ocultar controles después de un tiempo
  useEffect(() => {
    let timer: NodeJS.Timeout;

    if (showControls) {
      // Mostrar controles
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: Platform.OS !== 'web', // Solo usar native driver en móvil
      }).start();

      // Configurar temporizador para ocultarlos
      timer = setTimeout(() => {
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: Platform.OS !== 'web', // Solo usar native driver en móvil
        }).start(() => setShowControls(false));
      }, 4000);
    }

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [showControls]);

  // Función para cambiar entre cámara frontal y trasera
  const toggleCameraFacing = () => {
    setFacing((current) => (current === 'back' ? 'front' : 'back'));
  };

  // Función para cambiar el modo de flash
  const toggleFlash = () => {
    setFlash((current) => {
      switch (current) {
        case 'off':
          return 'on';
        case 'on':
          return 'auto';
        case 'auto':
          return 'off';
        default:
          return 'off';
      }
    });
  };

  // Función para mostrar los controles
  const handleShowControls = () => {
    if (!showControls) {
      setShowControls(true);
    }
  };

  // Función para tomar una foto
  const takePicture = async () => {
    if (cameraRef.current && !isTakingPicture) {
      try {
        setIsTakingPicture(true);
        const photo = await cameraRef.current.takePictureAsync({
          quality: 0.9,
          skipProcessing: Platform.OS === 'android', // Evitar problemas en Android
        });
        if (photo?.uri) {
          setCapturedImage(photo.uri);
        }

        // Guardar en la galería si tenemos permiso
        if (mediaLibraryPermission) {
          if (photo?.uri) {
            await MediaLibrary.saveToLibraryAsync(photo.uri);
          }
        }
      } catch (error) {
        console.error('Error al tomar la foto:', error);
      } finally {
        setIsTakingPicture(false);
      }
    }
  };

  // Función para descartar la foto y volver a la cámara
  const retakePhoto = () => {
    setCapturedImage(null);
  };

  return {
    // Estados
    facing,
    flash,
    zoom,
    isTakingPicture,
    capturedImage,
    showControls,
    fadeAnim,
    cameraRef,
    cameraPermission,
    mediaLibraryPermission,

    // Funciones
    toggleCameraFacing,
    toggleFlash,
    handleShowControls,
    takePicture,
    retakePhoto,
    setZoom,
    requestCameraPermission,
  };
}; 