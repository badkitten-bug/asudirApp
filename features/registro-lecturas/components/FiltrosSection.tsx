import React from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { registroLecturasStyles } from '../styles/registroLecturas.styles';
import { MESES } from '../hooks/useRegistroLecturas';

interface FiltrosSectionProps {
  showFilters: boolean;
  searchQuery: string;
  filtroPozo: string;
  filtroBateria: string;
  filtroDia: string;
  filtroMes: string;
  filtroAno: string;
  filtroFechaInicio: string;
  filtroFechaFin: string;
  baterias: string[];
  anos: string[];
  setSearchQuery: (value: string) => void;
  setFiltroPozo: (value: string) => void;
  setFiltroBateria: (value: string) => void;
  setFiltroDia: (value: string) => void;
  setFiltroMes: (value: string) => void;
  setFiltroAno: (value: string) => void;
  setFiltroFechaInicio: (value: string) => void;
  setFiltroFechaFin: (value: string) => void;
  handleClearFilters: () => void;
}

export const FiltrosSection: React.FC<FiltrosSectionProps> = ({
  showFilters,
  searchQuery,
  filtroPozo,
  filtroBateria,
  filtroDia,
  filtroMes,
  filtroAno,
  filtroFechaInicio,
  filtroFechaFin,
  baterias,
  anos,
  setSearchQuery,
  setFiltroPozo,
  setFiltroBateria,
  setFiltroDia,
  setFiltroMes,
  setFiltroAno,
  setFiltroFechaInicio,
  setFiltroFechaFin,
  handleClearFilters,
}) => {
  if (!showFilters) return null;

  return (
    <View style={registroLecturasStyles.filtersContainer}>
      <Text style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 12 }}>
        Filtros
      </Text>

      {/* Filtro por búsqueda */}
      <View style={registroLecturasStyles.filterRow}>
        <Text style={registroLecturasStyles.filterLabel}>Buscar:</Text>
        <TextInput
          style={registroLecturasStyles.filterInput}
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Buscar por pozo o ubicación..."
        />
      </View>

      {/* Filtro por pozo */}
      <View style={registroLecturasStyles.filterRow}>
        <Text style={registroLecturasStyles.filterLabel}>Pozo:</Text>
        <TextInput
          style={registroLecturasStyles.filterInput}
          value={filtroPozo}
          onChangeText={setFiltroPozo}
          placeholder="Filtrar por pozo..."
        />
      </View>

      {/* Filtro por batería */}
      <View style={registroLecturasStyles.filterRow}>
        <Text style={registroLecturasStyles.filterLabel}>Batería:</Text>
        <TextInput
          style={registroLecturasStyles.filterInput}
          value={filtroBateria}
          onChangeText={setFiltroBateria}
          placeholder="Filtrar por batería..."
        />
      </View>

      {/* Filtros de fecha */}
      <View style={registroLecturasStyles.filterRow}>
        <Text style={registroLecturasStyles.filterLabel}>Día:</Text>
        <TextInput
          style={registroLecturasStyles.filterInput}
          value={filtroDia}
          onChangeText={setFiltroDia}
          placeholder="DD"
          keyboardType="numeric"
        />
      </View>

      <View style={registroLecturasStyles.filterRow}>
        <Text style={registroLecturasStyles.filterLabel}>Mes:</Text>
        <TextInput
          style={registroLecturasStyles.filterInput}
          value={filtroMes}
          onChangeText={setFiltroMes}
          placeholder="MM"
          keyboardType="numeric"
        />
      </View>

      <View style={registroLecturasStyles.filterRow}>
        <Text style={registroLecturasStyles.filterLabel}>Año:</Text>
        <TextInput
          style={registroLecturasStyles.filterInput}
          value={filtroAno}
          onChangeText={setFiltroAno}
          placeholder="YYYY"
          keyboardType="numeric"
        />
      </View>

      {/* Filtro por rango de fechas */}
      <View style={registroLecturasStyles.filterRow}>
        <Text style={registroLecturasStyles.filterLabel}>Desde:</Text>
        <TextInput
          style={registroLecturasStyles.filterInput}
          value={filtroFechaInicio}
          onChangeText={setFiltroFechaInicio}
          placeholder="YYYY-MM-DD"
        />
      </View>

      <View style={registroLecturasStyles.filterRow}>
        <Text style={registroLecturasStyles.filterLabel}>Hasta:</Text>
        <TextInput
          style={registroLecturasStyles.filterInput}
          value={filtroFechaFin}
          onChangeText={setFiltroFechaFin}
          placeholder="YYYY-MM-DD"
        />
      </View>

      {/* Botón para limpiar filtros */}
      <TouchableOpacity
        style={registroLecturasStyles.clearFiltersButton}
        onPress={handleClearFilters}
      >
        <Text style={registroLecturasStyles.clearFiltersText}>
          Limpiar Filtros
        </Text>
      </TouchableOpacity>
    </View>
  );
}; 