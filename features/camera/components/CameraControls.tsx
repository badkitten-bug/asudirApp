import React from 'react';
import { View, TouchableOpacity, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { cameraStyles } from '../styles/camera.styles';

interface CameraControlsProps {
  facing: 'front' | 'back';
  flash: 'off' | 'on' | 'auto';
  isTakingPicture: boolean;
  showControls: boolean;
  fadeAnim: Animated.Value;
  onToggleCamera: () => void;
  onToggleFlash: () => void;
  onTakePicture: () => void;
  onClose: () => void;
}

export const CameraControls: React.FC<CameraControlsProps> = ({
  facing,
  flash,
  isTakingPicture,
  showControls,
  fadeAnim,
  onToggleCamera,
  onToggleFlash,
  onTakePicture,
  onClose,
}) => {
  if (!showControls) return null;

  return (
    <Animated.View style={[cameraStyles.controlsContainer, { opacity: fadeAnim }]}>
      {/* Controles superiores */}
      <View style={cameraStyles.topControls}>
        <TouchableOpacity style={cameraStyles.closeButton} onPress={onClose}>
          <Ionicons name="close" size={24} color="#fff" />
        </TouchableOpacity>

        <TouchableOpacity style={cameraStyles.flashButton} onPress={onToggleFlash}>
          <Ionicons
            name={flash === 'on' ? 'flash' : flash === 'auto' ? 'flash-outline' : 'flash-off'}
            size={24}
            color="#fff"
          />
        </TouchableOpacity>
      </View>

      {/* Controles inferiores */}
      <View style={cameraStyles.bottomControls}>
        <TouchableOpacity style={cameraStyles.sideButton} onPress={onToggleCamera}>
          <Ionicons name="camera-reverse" size={24} color="#fff" />
        </TouchableOpacity>

        <TouchableOpacity
          style={cameraStyles.captureButton}
          onPress={onTakePicture}
          disabled={isTakingPicture}
        >
          <View style={cameraStyles.captureButtonInner} />
        </TouchableOpacity>

        <View style={cameraStyles.sideButton} />
      </View>
    </Animated.View>
  );
}; 