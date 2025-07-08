import React from 'react';
import { View, Text, TouchableOpacity, FlatList, RefreshControl, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { capturasStyles } from '../styles/capturas.styles';

interface CapturasListProps {
  tickets: any[];
  isLoading: boolean;
  refreshing: boolean;
  onRefresh: () => void;
  onVerTicket: (ticketId: string) => void;
  onSyncTickets: () => void;
}

export const CapturasList: React.FC<CapturasListProps> = ({
  tickets,
  isLoading,
  refreshing,
  onRefresh,
  onVerTicket,
  onSyncTickets,
}) => {
  // Renderizar cada item de la lista
  const renderTicketItem = ({ item }: { item: any }) => (
    <TouchableOpacity 
      style={capturasStyles.ticketItem} 
      onPress={() => onVerTicket(item.id)} 
      activeOpacity={0.7}
    >
      <View style={capturasStyles.ticketImagePlaceholder}>
        <Ionicons name="document-text-outline" size={24} color="#999" />
      </View>
      <View style={capturasStyles.ticketInfo}>
        <Text style={capturasStyles.ticketId}>ID: {item.id}</Text>
        <Text style={capturasStyles.ticketFecha}>
          Fecha: {item.fecha} {item.hora}
        </Text>
        <Text style={capturasStyles.ticketPozo}>
          Pozo: {item.pozoNombre}
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color="#ccc" />
    </TouchableOpacity>
  );

  // Renderizar lista vacía
  const renderEmptyList = () => (
    <View style={capturasStyles.emptyContainer}>
      <Ionicons name="document-outline" size={64} color="#ccc" />
      <Text style={capturasStyles.emptyTitle}>No hay tickets registrados</Text>
      <Text style={capturasStyles.emptySubtitle}>
        Los tickets aparecerán aquí después de registrar lecturas
      </Text>
    </View>
  );

  if (isLoading) {
    return (
      <View style={capturasStyles.loadingContainer}>
        <ActivityIndicator size="large" color="#00A86B" />
        <Text style={capturasStyles.loadingText}>Cargando tickets...</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={tickets}
      renderItem={renderTicketItem}
      keyExtractor={(item) => item.id}
      contentContainerStyle={capturasStyles.listContainer}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
      ListEmptyComponent={renderEmptyList}
      showsVerticalScrollIndicator={false}
    />
  );
}; 