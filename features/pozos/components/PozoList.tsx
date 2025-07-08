import React from 'react';
import { View, Text, FlatList, RefreshControl, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { PozoCard } from './PozoCard';
import { pozoStyles } from '../styles/pozo.styles';
import { Pozo } from '../hooks/usePozos';

interface PozoListProps {
  pozos: Pozo[];
  isLoading: boolean;
  refreshing: boolean;
  onRefresh: () => void;
  onSelectPozo: (pozo: Pozo) => void;
  checkPozoHasLectura: (pozoId: string) => boolean;
}

export const PozoList: React.FC<PozoListProps> = ({
  pozos,
  isLoading,
  refreshing,
  onRefresh,
  onSelectPozo,
  checkPozoHasLectura,
}) => {
  // Renderizar cada item de la lista
  const renderPozoItem = ({ item }: { item: Pozo }) => (
    <PozoCard
      pozo={item}
      hasLectura={checkPozoHasLectura(item.id)}
      onSelect={onSelectPozo}
    />
  );

  // Renderizar lista vacía
  const renderEmptyList = () => (
    <View style={pozoStyles.emptyContainer}>
      <Ionicons name="water-outline" size={64} color="#ccc" />
      <Text style={pozoStyles.emptyTitle}>No hay pozos disponibles</Text>
      <Text style={pozoStyles.emptySubtitle}>
        Contacta al administrador para agregar pozos
      </Text>
    </View>
  );

  if (isLoading) {
    return (
      <View style={pozoStyles.loadingContainer}>
        <ActivityIndicator size="large" color="#00A86B" />
        <Text style={pozoStyles.loadingText}>Cargando pozos...</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={pozos}
      renderItem={renderPozoItem}
      keyExtractor={(item) => item.id}
      contentContainerStyle={pozoStyles.listContainer}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
      ListEmptyComponent={renderEmptyList}
      showsVerticalScrollIndicator={false}
    />
  );
}; 