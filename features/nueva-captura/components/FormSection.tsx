import React from 'react';
import { View, Text, TextInput } from 'react-native';
import { nuevaCapturaStyles } from '../styles/nuevaCaptura.styles';

interface FormSectionProps {
  title: string;
  children: React.ReactNode;
}

export const FormSection: React.FC<FormSectionProps> = ({ title, children }) => {
  return (
    <View style={nuevaCapturaStyles.section}>
      <Text style={nuevaCapturaStyles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );
};

interface FormInputProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  keyboardType?: 'default' | 'numeric' | 'email-address' | 'phone-pad';
  multiline?: boolean;
}

export const FormInput: React.FC<FormInputProps> = ({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType = 'default',
  multiline = false,
}) => {
  return (
    <View style={nuevaCapturaStyles.inputContainer}>
      <Text style={nuevaCapturaStyles.inputLabel}>{label}</Text>
      <TextInput
        style={[
          nuevaCapturaStyles.input,
          multiline && { height: 80, textAlignVertical: 'top' },
        ]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        keyboardType={keyboardType}
        multiline={multiline}
      />
    </View>
  );
}; 