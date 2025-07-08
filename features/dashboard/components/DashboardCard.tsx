import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { dashboardStyles } from '../styles/dashboard.styles';

interface DashboardCardProps {
  title: string;
  value: string | number;
  subtitle: string;
  icon: keyof typeof Ionicons.glyphMap;
  color?: string;
  onPress?: () => void;
}

export const DashboardCard: React.FC<DashboardCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  color = '#00A86B',
  onPress,
}) => {
  const CardComponent = onPress ? TouchableOpacity : View;
  
  return (
    <CardComponent 
      style={dashboardStyles.card}
      onPress={onPress}
      disabled={!onPress}
    >
      <View style={dashboardStyles.cardHeader}>
        <Text style={dashboardStyles.cardTitle}>{title}</Text>
        <Ionicons name={icon} size={24} color="#000" />
      </View>
      <Text style={[dashboardStyles.cardValue, { color }]}>{value}</Text>
      <Text style={dashboardStyles.cardSubtitle}>{subtitle}</Text>
    </CardComponent>
  );
}; 