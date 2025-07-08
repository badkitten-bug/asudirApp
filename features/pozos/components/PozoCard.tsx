import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { pozoStyles } from '../styles/pozo.styles';
import { Pozo } from '../hooks/usePozos';

interface PozoCardProps {
  pozo: Pozo;
  hasLectura: boolean;
  onSelect: (pozo: Pozo) => void;
}

export const PozoCard: React.FC<PozoCardProps> = ({
  pozo,
  hasLectura,
  onSelect,
}) => {
  return (
    <TouchableOpacity
      style={[
        pozoStyles.pozoCard,
        hasLectura && pozoStyles.pozoCardDisabled
      ]}
      onPress={() => onSelect(pozo)}
      disabled={hasLectura}
      activeOpacity={0.7}
    >
      <View style={pozoStyles.pozoIcon}>
        <Ionicons 
          name="water-outline" 
          size={24} 
          color={hasLectura ? "#ccc" : "#00A86B"} 
        />
      </View>
      
      <View style={pozoStyles.pozoInfo}>
        <Text style={[
          pozoStyles.pozoName,
          hasLectura && pozoStyles.pozoNameDisabled
        ]}>
          {pozo.numeropozo}
        </Text>
        <Text style={[
          pozoStyles.pozoLocation,
          hasLectura && pozoStyles.pozoLocationDisabled
        ]}>
          {pozo.predio}
        </Text>
        {pozo.bateria && (
          <Text style={[
            pozoStyles.pozoBateria,
            hasLectura && pozoStyles.pozoBateriaDisabled
          ]}>
            Batería: {pozo.bateria.nombrebateria}
          </Text>
        )}
      </View>

      {hasLectura && (
        <View style={pozoStyles.badgeContainer}>
          <Ionicons name="checkmark-circle" size={20} color="#00A86B" />
          <Text style={pozoStyles.badgeText}>Hecho</Text>
        </View>
      )}

      <Ionicons 
        name="chevron-forward" 
        size={20} 
        color={hasLectura ? "#ccc" : "#999"} 
      />
    </TouchableOpacity>
  );
}; 