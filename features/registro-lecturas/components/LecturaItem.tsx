import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { registroLecturasStyles } from '../styles/registroLecturas.styles';
import { LecturaData } from '../hooks/useRegistroLecturas';

interface LecturaItemProps {
  item: LecturaData;
  onPress?: () => void;
}

export const LecturaItem: React.FC<LecturaItemProps> = ({ item, onPress }) => {
  const isPendiente = item.estado === 'pendiente';

  return (
    <TouchableOpacity
      style={[
        registroLecturasStyles.lecturaItem,
        isPendiente && registroLecturasStyles.pendienteItem,
      ]}
      onPress={onPress}
    >
      <View style={registroLecturasStyles.itemHeader}>
        <Text style={registroLecturasStyles.pozoNombre}>{item.pozoNombre}</Text>
        <View style={registroLecturasStyles.estadoContainer}>
          {isPendiente ? (
            <Ionicons name="time-outline" size={16} color="#f39c12" />
          ) : (
            <Ionicons name="checkmark-circle-outline" size={16} color="#00A86B" />
          )}
          <Text
            style={[
              registroLecturasStyles.estadoText,
              isPendiente
                ? registroLecturasStyles.estadoPendiente
                : registroLecturasStyles.estadoCompletado,
            ]}
          >
            {isPendiente ? 'Pendiente' : 'Completado'}
          </Text>
        </View>
      </View>

      <Text style={registroLecturasStyles.ubicacion}>{item.pozoUbicacion}</Text>
      <Text style={registroLecturasStyles.fecha}>{item.fecha}</Text>

      <View style={registroLecturasStyles.datosContainer}>
        <View style={registroLecturasStyles.datoItem}>
          <Text style={registroLecturasStyles.datoLabel}>Volumen:</Text>
          <Text style={registroLecturasStyles.datoValue}>{item.volumen}</Text>
        </View>
        <View style={registroLecturasStyles.datoItem}>
          <Text style={registroLecturasStyles.datoLabel}>Gasto:</Text>
          <Text style={registroLecturasStyles.datoValue}>{item.gasto}</Text>
        </View>
        <View style={registroLecturasStyles.datoItem}>
          <Text style={registroLecturasStyles.datoLabel}>Eléctrica:</Text>
          <Text style={registroLecturasStyles.datoValue}>{item.lecturaElectrica}</Text>
        </View>
      </View>

      {item.observaciones && item.observaciones !== 'Sin observaciones' && (
        <View style={registroLecturasStyles.observacionesContainer}>
          <Text style={registroLecturasStyles.observacionesLabel}>Observaciones:</Text>
          <Text style={registroLecturasStyles.observacionesText}>{item.observaciones}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}; 