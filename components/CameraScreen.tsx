"use client";

import { useState, useRef, useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Dimensions,
  StatusBar as RNStatusBar,
  Platform,
  Animated,
} from "react-native";
import {
  CameraView,
  type CameraType,
  FlashMode,
  useCameraPermissions,
} from "expo-camera";
import { Ionicons } from "@expo/vector-icons";
import * as MediaLibrary from "expo-media-library";
import Constants from "expo-constants";

const STATUSBAR_HEIGHT = Constants.statusBarHeight || 0;
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

interface CameraScreenProps {
  onPhotoTaken: (uri: string) => void;
  onClose: () => void;
  title?: string;
}

export default function CameraScreen({
  onPhotoTaken,
  onClose,
  title = "Tomar Foto",
}: CameraScreenProps) {
  // Estados para la cámara
  const [facing, setFacing] = useState<CameraType>("back");
  const [flash, setFlash] = useState<FlashMode>("off");
  const [zoom, setZoom] = useState(0);
  const [isTakingPicture, setIsTakingPicture] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [showControls, setShowControls] = useState(true);

  // Animaciones
  const fadeAnim = useRef(new Animated.Value(1)).current;

  // Referencias
  const cameraRef = useRef<CameraView>(null);

  // Permisos
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const [mediaLibraryPermission, setMediaLibraryPermission] = useState<
    boolean | null
  >(null);

  // Solicitar permisos al montar el componente
  useEffect(() => {
    const getPermissions = async () => {
      if (!cameraPermission?.granted) {
        await requestCameraPermission();
      }

      // Solicitar permisos de MediaLibrary
      const { status } = await MediaLibrary.requestPermissionsAsync();
      setMediaLibraryPermission(status === "granted");
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
    setFacing((current) => (current === "back" ? "front" : "back"));
  };

  // Función para cambiar el modo de flash
  const toggleFlash = () => {
    setFlash((current) => {
      switch (current) {
        case "off":
          return "on";
        case "on":
          return "auto";
        case "auto":
          return "off";
        default:
          return "off";
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
          skipProcessing: Platform.OS === "android", // Evitar problemas en Android
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
        console.error("Error al tomar la foto:", error);
      } finally {
        setIsTakingPicture(false);
      }
    }
  };

  // Función para usar la foto capturada
  const usePhoto = () => {
    if (capturedImage) {
      onPhotoTaken(capturedImage);
    }
  };

  // Función para descartar la foto y volver a la cámara
  const retakePhoto = () => {
    setCapturedImage(null);
  };

  // Si no tenemos permisos, mostrar mensaje
  if (!cameraPermission || !mediaLibraryPermission) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#00A86B" />
        <Text style={styles.text}>Cargando cámara...</Text>
      </View>
    );
  }

  if (!cameraPermission.granted) {
    return (
      <View style={styles.permissionContainer}>
        <Ionicons name="camera-outline" size={64} color="#666" />
        <Text style={styles.permissionText}>
          Necesitamos acceso a la cámara
        </Text>
        <TouchableOpacity
          style={styles.permissionButton}
          onPress={requestCameraPermission}
        >
          <Text style={styles.permissionButtonText}>Permitir acceso</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
          <Text style={styles.cancelButtonText}>Cancelar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!cameraPermission.granted) {
    return (
      <View style={styles.permissionContainer}>
        <Ionicons name="images-outline" size={64} color="#666" />
        <Text style={styles.permissionText}>
          Necesitamos acceso a la galería para guardar fotos
        </Text>
        <TouchableOpacity
          style={styles.permissionButton}
          onPress={requestCameraPermission}
        >
          <Text style={styles.permissionButtonText}>Permitir acceso</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
          <Text style={styles.cancelButtonText}>Cancelar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <RNStatusBar backgroundColor="black" barStyle="light-content" />

      {capturedImage ? (
        // Mostrar la imagen capturada
        <View style={styles.previewContainer}>
          <Image source={{ uri: capturedImage }} style={styles.preview} />

          {/* Header en modo preview */}
          <View style={styles.previewHeader}>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Ionicons name="close" size={28} color="white" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>{title}</Text>
            <View style={{ width: 28 }} />
          </View>

          {/* Acciones de preview */}
          <View style={styles.previewActions}>
            <TouchableOpacity
              style={styles.previewButton}
              onPress={retakePhoto}
            >
              <Ionicons name="refresh" size={24} color="white" />
              <Text style={styles.previewButtonText}>Volver a tomar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.previewButton, styles.useButton]}
              onPress={usePhoto}
            >
              <Ionicons name="checkmark" size={24} color="white" />
              <Text style={styles.previewButtonText}>Usar foto</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        // Mostrar la cámara
        <TouchableOpacity
          activeOpacity={1}
          style={styles.cameraContainer}
          onPress={handleShowControls}
        >
          <CameraView
            style={styles.camera}
            facing={facing}
            flash={flash}
            zoom={zoom}
            ref={cameraRef}
          >
            {/* Header */}
            <View 
              style={[
                styles.header,
                { pointerEvents: showControls ? "auto" : "none" }
              ]}
            >
              <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                <Ionicons name="close" size={28} color="white" />
              </TouchableOpacity>
              <Text style={styles.headerTitle}>{title}</Text>
              <TouchableOpacity
                style={styles.flashButton}
                onPress={toggleFlash}
              >
                <Ionicons
                  name={
                    flash === "off"
                      ? "flash-off"
                      : flash === "on"
                      ? "flash"
                      : flash === "auto"
                      ? "flash-outline"
                      : "flashlight"
                  }
                  size={24}
                  color="white"
                />
              </TouchableOpacity>
            </View>

            {/* Controles laterales */}
            <View 
              style={[
                styles.sideControls,
                { pointerEvents: showControls ? "auto" : "none" }
              ]}
            >
              <TouchableOpacity
                style={styles.sideButton}
                onPress={toggleCameraFacing}
              >
                <Ionicons name="camera-reverse" size={24} color="white" />
              </TouchableOpacity>

              <TouchableOpacity style={styles.sideButton}>
                <Ionicons name="grid" size={24} color="white" />
              </TouchableOpacity>

              <TouchableOpacity style={styles.sideButton}>
                <Ionicons name="timer-outline" size={24} color="white" />
              </TouchableOpacity>
            </View>

            {/* Botón de captura */}
            <View style={styles.captureContainer}>
              <TouchableOpacity
                style={styles.captureButton}
                onPress={takePicture}
                disabled={isTakingPicture}
              >
                {isTakingPicture ? (
                  <ActivityIndicator size="large" color="white" />
                ) : (
                  <View style={styles.captureButtonInner} />
                )}
              </TouchableOpacity>
            </View>
          </CameraView>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "black",
  },
  permissionContainer: {
    flex: 1,
    backgroundColor: "white",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  permissionText: {
    fontSize: 18,
    textAlign: "center",
    marginTop: 20,
    marginBottom: 30,
    color: "#333",
  },
  permissionButton: {
    backgroundColor: "#00A86B",
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 8,
    marginBottom: 16,
  },
  permissionButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  cancelButton: {
    paddingVertical: 12,
    paddingHorizontal: 30,
  },
  cancelButtonText: {
    color: "#666",
    fontSize: 16,
  },
  cameraContainer: {
    flex: 1,
  },
  camera: {
    flex: 1,
  },
  header: {
    position: "absolute",
    top: STATUSBAR_HEIGHT,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "rgba(0,0,0,0.4)",
    zIndex: 10,
  },
  headerTitle: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  closeButton: {
    padding: 4,
  },
  flashButton: {
    padding: 4,
  },
  sideControls: {
    position: "absolute",
    top: STATUSBAR_HEIGHT + 70,
    right: 16,
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.4)",
    borderRadius: 30,
    padding: 8,
  },
  sideButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 8,
  },
  captureContainer: {
    position: "absolute",
    bottom: 40,
    left: 0,
    right: 0,
    alignItems: "center",
  },
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(255,255,255,0.3)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 4,
    borderColor: "rgba(255,255,255,0.5)",
  },
  captureButtonInner: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "white",
  },
  text: {
    color: "white",
    fontSize: 16,
    marginTop: 16,
    textAlign: "center",
  },
  previewContainer: {
    flex: 1,
    backgroundColor: "black",
  },
  preview: {
    flex: 1,
    resizeMode: "contain",
  },
  previewHeader: {
    position: "absolute",
    top: STATUSBAR_HEIGHT,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "rgba(0,0,0,0.6)",
    zIndex: 10,
  },
  previewActions: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-around",
    padding: 20,
    backgroundColor: "rgba(0,0,0,0.6)",
  },
  previewButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.6)",
    padding: 12,
    borderRadius: 8,
    minWidth: 150,
    justifyContent: "center",
  },
  useButton: {
    backgroundColor: "#00A86B",
  },
  previewButtonText: {
    color: "white",
    marginLeft: 8,
    fontSize: 16,
  },
});
