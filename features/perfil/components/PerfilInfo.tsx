import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { perfilStyles } from '../styles/perfil.styles';

interface PerfilInfoProps {
  user: any;
  onLogout: () => void;
  onSync: () => void;
  isLoading: boolean;
}

export const PerfilInfo: React.FC<PerfilInfoProps> = ({
  user,
  onLogout,
  onSync,
  isLoading,
}) => {
  return (
    <View style={perfilStyles.container}>
      {/* Header del perfil */}
      <View style={perfilStyles.header}>
        <View style={perfilStyles.avatarContainer}>
          <Ionicons name="person-circle" size={80} color="#00A86B" />
        </View>
        <Text style={perfilStyles.userName}>
          {user?.username || user?.email || 'Usuario'}
        </Text>
        <Text style={perfilStyles.userRole}>
          {user?.role || 'Capturador'}
        </Text>
      </View>

      {/* Información del usuario */}
      <View style={perfilStyles.infoSection}>
        <View style={perfilStyles.infoRow}>
          <Ionicons name="mail-outline" size={20} color="#666" />
          <Text style={perfilStyles.infoLabel}>Email:</Text>
          <Text style={perfilStyles.infoValue}>
            {user?.email || 'No disponible'}
          </Text>
        </View>

        <View style={perfilStyles.infoRow}>
          <Ionicons name="person-outline" size={20} color="#666" />
          <Text style={perfilStyles.infoLabel}>Nombre:</Text>
          <Text style={perfilStyles.infoValue}>
            {user?.username || user?.name || 'No disponible'}
          </Text>
        </View>

        <View style={perfilStyles.infoRow}>
          <Ionicons name="id-card-outline" size={20} color="#666" />
          <Text style={perfilStyles.infoLabel}>ID:</Text>
          <Text style={perfilStyles.infoValue}>
            {user?.id || 'No disponible'}
          </Text>
        </View>
      </View>

      {/* Acciones */}
      <View style={perfilStyles.actionsSection}>
        <TouchableOpacity
          style={[perfilStyles.actionButton, perfilStyles.syncButton]}
          onPress={onSync}
          disabled={isLoading}
        >
          <Ionicons name="sync-outline" size={20} color="#fff" />
          <Text style={perfilStyles.actionButtonText}>
            {isLoading ? 'Sincronizando...' : 'Sincronizar Datos'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[perfilStyles.actionButton, perfilStyles.logoutButton]}
          onPress={onLogout}
          disabled={isLoading}
        >
          <Ionicons name="log-out-outline" size={20} color="#fff" />
          <Text style={perfilStyles.actionButtonText}>Cerrar Sesión</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}; 