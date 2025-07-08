import React from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import CameraScreen from '@/components/CameraScreen';

interface FotosSectionProps {
  // Props del formulario
  lecturaElectrica: string;
  photoUriElec: string | null;
  showCameraElec: boolean;
  
  // Setters del formulario
  setLecturaElectrica: (value: string) => void;
  setPhotoUriElec: (value: string | null) => void;
  setShowCameraElec: (value: boolean) => void;
  
  // Handlers de cámara
  handleOpenCameraElec: () => void;
  handlePhotoTakenElec: (uri: string) => void;
  handleCloseCameraElec: () => void;
  handleChoosePhotoOptionElec: () => void;
  handlePickImageElec: () => void;
  
  // Estilos
  styles: any;
}

export function FotosSection({
  lecturaElectrica,
  photoUriElec,
  showCameraElec,
  setLecturaElectrica,
  setPhotoUriElec,
  setShowCameraElec,
  handleOpenCameraElec,
  handlePhotoTakenElec,
  handleCloseCameraElec,
  handleChoosePhotoOptionElec,
  handlePickImageElec,
  styles,
}: FotosSectionProps) {
  return (
    <>
      <Text style={styles.inputLabel}>Lectura Eléctrica (kWh) *</Text>
      <TextInput
        style={styles.input}
        placeholder="Ingrese la lectura eléctrica (solo números enteros)"
        value={lecturaElectrica}
        onChangeText={setLecturaElectrica}
        keyboardType="numeric"
      />

      {/* Foto obligatoria del medidor eléctrico */}
      <Text style={[styles.inputLabel, { color: '#e74c3c', fontWeight: 'bold' }]}>
        Foto del Medidor Eléctrico *
      </Text>
      {photoUriElec ? (
        <View style={styles.photoPreviewContainer}>
          <Image source={{ uri: photoUriElec }} style={styles.photoPreview} />
          <TouchableOpacity style={styles.retakeButton} onPress={handleChoosePhotoOptionElec}>
            <Ionicons name="camera" size={20} color="white" />
            <Text style={styles.photoButtonText}>Volver a tomar</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity 
          style={[styles.photoButton, { backgroundColor: '#e74c3c' }]} 
          onPress={handleChoosePhotoOptionElec}
        >
          <Ionicons name="camera-outline" size={20} color="white" />
          <Text style={styles.photoButtonText}>Tomar Foto (Obligatorio)</Text>
        </TouchableOpacity>
      )}

      {/* Modal de cámara para medidor eléctrico */}
      <Modal visible={showCameraElec} animationType="slide" onRequestClose={handleCloseCameraElec}>
        <CameraScreen
          onPhotoTaken={handlePhotoTakenElec}
          onClose={handleCloseCameraElec}
          title="Foto del Medidor Eléctrico"
        />
      </Modal>
    </>
  );
} 