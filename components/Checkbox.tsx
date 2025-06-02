import React from 'react';
import { TouchableOpacity, View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface CheckboxProps {
  checked: boolean;
  onPress: () => void;
  size?: number;
  color?: string;
  style?: any;
}

const Checkbox: React.FC<CheckboxProps> = ({ checked, onPress, size = 24, color = '#00A86B', style }) => {
  return (
    <TouchableOpacity onPress={onPress} style={[styles.container, style]} activeOpacity={0.7}>
      <View style={[styles.box, { borderColor: color, width: size, height: size }]}> 
        {checked && (
          <Ionicons name="checkmark" size={size * 0.8} color={color} />
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  box: {
    borderWidth: 2,
    borderRadius: 6,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default Checkbox; 