import React from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { cameraStyles } from '../styles/camera.styles';

interface CameraPermissionProps {
  cameraPermission: any;
  mediaLibraryPermission: boolean | null;
  onRequestPermission: () => void;
  onClose: () => void;
}

export const CameraPermission: React.FC<CameraPermissionProps> = ({
  cameraPermission,
  mediaLibraryPermission,
  onRequestPermission,
  onClose,
}) => {
  // Si no tenemos permisos, mostrar mensaje
  if (!cameraPermission || !mediaLibraryPermission) {
    return (
      <View style={cameraStyles.loadingContainer}>
        <ActivityIndicator size="large" color="#00A86B" />
        <Text style={cameraStyles.text}>Cargando cámara...</Text>
      </View>
    );
  }

  if (!cameraPermission.granted) {
    return (
      <View style={cameraStyles.permissionContainer}>
        <Ionicons name="camera-outline" size={64} color="#666" />
        <Text style={cameraStyles.permissionText}>
          Necesitamos acceso a la cámara
        </Text>
        <TouchableOpacity style={cameraStyles.permissionButton} onPress={onRequestPermission}>
          <Text style={cameraStyles.permissionButtonText}>Permitir acceso</Text>
        </TouchableOpacity>
        <TouchableOpacity style={cameraStyles.cancelButton} onPress={onClose}>
          <Text style={cameraStyles.cancelButtonText}>Cancelar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return null;
}; 