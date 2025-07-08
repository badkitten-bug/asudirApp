import React from 'react';
import { Text, TextProps } from 'react-native';

interface ThemedTextProps extends TextProps {
  type?: 'title' | 'subtitle' | 'body' | 'link' | 'caption';
}

export const ThemedText: React.FC<ThemedTextProps> = ({ 
  type = 'body', 
  style, 
  children, 
  ...props 
}) => {
  const getTextStyle = () => {
    switch (type) {
      case 'title':
        return { fontSize: 24, fontWeight: 'bold' as const, color: '#333' };
      case 'subtitle':
        return { fontSize: 18, fontWeight: '600' as const, color: '#666' };
      case 'link':
        return { fontSize: 16, color: '#00A86B', textDecorationLine: 'underline' as const };
      case 'caption':
        return { fontSize: 12, color: '#999' };
      default:
        return { fontSize: 16, color: '#333' };
    }
  };

  return (
    <Text style={[getTextStyle(), style]} {...props}>
      {children}
    </Text>
  );
}; 