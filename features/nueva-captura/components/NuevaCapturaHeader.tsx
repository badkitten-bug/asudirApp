import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { nuevaCapturaStyles } from '../styles/nuevaCaptura.styles';

interface NuevaCapturaHeaderProps {
  pozoNombre: string;
  pozoUbicacion: string;
  onBack: () => void;
}

export const NuevaCapturaHeader: React.FC<NuevaCapturaHeaderProps> = ({
  pozoNombre,
  pozoUbicacion,
  onBack,
}) => {
  return (
    <View style={nuevaCapturaStyles.header}>
      <TouchableOpacity onPress={onBack} style={nuevaCapturaStyles.backButton}>
        <Ionicons name="arrow-back" size={24} color="#000" />
      </TouchableOpacity>
      
      <View style={nuevaCapturaStyles.headerInfo}>
        <Text style={nuevaCapturaStyles.headerTitle}>Nueva Captura</Text>
        <Text style={nuevaCapturaStyles.pozoInfo}>{pozoNombre}</Text>
        <Text style={nuevaCapturaStyles.ubicacionInfo}>{pozoUbicacion}</Text>
      </View>
    </View>
  );
}; 