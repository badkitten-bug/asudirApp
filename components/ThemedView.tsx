import React from 'react';
import { View, ViewProps } from 'react-native';

export const ThemedView: React.FC<ViewProps> = ({ style, children, ...props }) => {
  return (
    <View style={[{ backgroundColor: '#fff' }, style]} {...props}>
      {children}
    </View>
  );
}; 