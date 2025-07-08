import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { cameraStyles } from '../styles/camera.styles';

interface CameraPreviewProps {
  capturedImage: string;
  onUsePhoto: () => void;
  onRetakePhoto: () => void;
}

export const CameraPreview: React.FC<CameraPreviewProps> = ({
  capturedImage,
  onUsePhoto,
  onRetakePhoto,
}) => {
  return (
    <View style={cameraStyles.previewContainer}>
      <Image source={{ uri: capturedImage }} style={cameraStyles.previewImage} />
      
      <View style={cameraStyles.previewControls}>
        <TouchableOpacity style={cameraStyles.cancelButton} onPress={onRetakePhoto}>
          <Ionicons name="refresh" size={20} color="#fff" />
          <Text style={cameraStyles.cancelButtonText}>Retomar</Text>
        </TouchableOpacity>

        <TouchableOpacity style={cameraStyles.previewButton} onPress={onUsePhoto}>
          <Ionicons name="checkmark" size={20} color="#fff" />
          <Text style={cameraStyles.previewButtonText}>Usar Foto</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}; 