import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, StyleSheet } from 'react-native';

interface LoadingButtonProps {
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  title: string;
  loadingTitle?: string;
  style?: any;
  textStyle?: any;
}

export default function LoadingButton({ 
  onPress, 
  disabled = false, 
  loading = false, 
  title, 
  loadingTitle = "Cargando...",
  style,
  textStyle 
}: LoadingButtonProps) {
  return (
    <TouchableOpacity 
      style={[styles.button, style, (disabled || loading) && styles.buttonDisabled]} 
      onPress={onPress}
      disabled={disabled || loading}
    >
      {loading && (
        <ActivityIndicator 
          size="small" 
          color="white" 
          style={styles.loader}
        />
      )}
      <Text style={[styles.buttonText, textStyle]}>
        {loading ? loadingTitle : title}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: "#1E78C6",
    paddingVertical: 16,
    borderRadius: 8,
    marginTop: 10,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: "#ccc",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },
  loader: {
    marginRight: 8,
  },
});
