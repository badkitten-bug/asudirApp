import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { registroLecturasStyles } from '../styles/registroLecturas.styles';

interface EmptyStateProps {
  message?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ 
  message = 'No se encontraron lecturas registradas' 
}) => {
  return (
    <View style={registroLecturasStyles.emptyContainer}>
      <Ionicons name="document-text-outline" size={64} color="#ccc" />
      <Text style={registroLecturasStyles.emptyText}>{message}</Text>
    </View>
  );
}; 