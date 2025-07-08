"use client";

import { useState, useRef, useEffect } from "react";
import { View, Text, TouchableOpacity, Image, ActivityIndicator, Dimensions, StatusBar as RNStatusBar, Platform, Animated } from "react-native";
import { CameraView, type CameraType, FlashMode, useCameraPermissions } from "expo-camera";
import { Ionicons } from "@expo/vector-icons";
import * as MediaLibrary from "expo-media-library";
import Constants from "expo-constants";
import { useCamera } from "@/features/camera/hooks/useCamera";
import { CameraControls } from "@/features/camera/components/CameraControls";
import { CameraPreview } from "@/features/camera/components/CameraPreview";
import { CameraPermission } from "@/features/camera/components/CameraPermission";
import { cameraStyles } from "@/features/camera/styles/camera.styles";

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
  const {
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
    toggleCameraFacing,
    toggleFlash,
    handleShowControls,
    takePicture,
    retakePhoto,
    setZoom,
    requestCameraPermission,
  } = useCamera();

  // Función para usar la foto capturada
  const usePhoto = () => {
    if (capturedImage) {
      onPhotoTaken(capturedImage);
    }
  };

  return (
    <View style={cameraStyles.container}>
      {/* Configuración del StatusBar nativo */}
      <RNStatusBar backgroundColor="#000" barStyle="light-content" translucent={true} />

      {/* Espacio para el StatusBar */}
      <View style={{ height: STATUSBAR_HEIGHT, backgroundColor: "#000" }} />

      {/* Verificar permisos */}
      <CameraPermission
        cameraPermission={cameraPermission}
        mediaLibraryPermission={mediaLibraryPermission}
        onRequestPermission={requestCameraPermission}
        onClose={onClose}
      />

      {/* Si hay una imagen capturada, mostrar preview */}
      {capturedImage ? (
        <CameraPreview
          capturedImage={capturedImage}
          onUsePhoto={usePhoto}
          onRetakePhoto={retakePhoto}
        />
      ) : (
        /* Cámara activa */
        <TouchableOpacity
          style={cameraStyles.camera}
          activeOpacity={1}
          onPress={handleShowControls}
        >
          <CameraView
            ref={cameraRef}
            style={cameraStyles.camera}
            facing={facing}
            flash={flash}
            zoom={zoom}
          />

          {/* Controles de la cámara */}
          <CameraControls
            facing={facing}
            flash={flash}
            isTakingPicture={isTakingPicture}
            showControls={showControls}
            fadeAnim={fadeAnim}
            onToggleCamera={toggleCameraFacing}
            onToggleFlash={toggleFlash}
            onTakePicture={takePicture}
            onClose={onClose}
          />
        </TouchableOpacity>
      )}
    </View>
  );
}
