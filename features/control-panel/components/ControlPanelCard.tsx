import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { controlPanelStyles } from '../styles/controlPanel.styles';

interface ControlPanelCardProps {
  title: string;
  value: string | number;
  subtitle: string;
  icon: keyof typeof Ionicons.glyphMap;
  onPress?: () => void;
  valueColor?: string;
}

export const ControlPanelCard: React.FC<ControlPanelCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  onPress,
  valueColor = '#000',
}) => {
  const CardComponent = onPress ? TouchableOpacity : View;

  return (
    <CardComponent
      style={controlPanelStyles.card}
      onPress={onPress}
      disabled={!onPress}
    >
      <View style={controlPanelStyles.cardHeader}>
        <Text style={controlPanelStyles.cardTitle}>{title}</Text>
        <Ionicons name={icon} size={24} color="#000" />
      </View>
      <Text style={[controlPanelStyles.cardValue, { color: valueColor }]}>
        {value}
      </Text>
      <Text style={controlPanelStyles.cardSubtitle}>{subtitle}</Text>
    </CardComponent>
  );
}; 