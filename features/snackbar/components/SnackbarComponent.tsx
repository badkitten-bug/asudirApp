import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { snackbarStyles } from '../styles/snackbar.styles';
import { useSnackbar } from '../hooks/useSnackbar';

export const SnackbarComponent: React.FC = () => {
  const { snackbar, handleHideSnackbar } = useSnackbar();
  const fadeAnim = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (snackbar.visible) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();

      // Auto-hide after duration
      const timer = setTimeout(() => {
        handleHideSnackbar();
      }, snackbar.duration || 3000);

      return () => clearTimeout(timer);
    } else {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [snackbar.visible, snackbar.duration, handleHideSnackbar, fadeAnim]);

  if (!snackbar.visible) return null;

  const getIconName = () => {
    switch (snackbar.type) {
      case 'success':
        return 'checkmark-circle';
      case 'error':
        return 'close-circle';
      case 'warning':
        return 'warning';
      case 'info':
        return 'information-circle';
      default:
        return 'information-circle';
    }
  };

  const getSnackbarStyle = () => {
    switch (snackbar.type) {
      case 'success':
        return snackbarStyles.success;
      case 'error':
        return snackbarStyles.error;
      case 'warning':
        return snackbarStyles.warning;
      case 'info':
        return snackbarStyles.info;
      default:
        return snackbarStyles.info;
    }
  };

  return (
    <Animated.View style={[snackbarStyles.container, { opacity: fadeAnim }]}>
      <View style={[snackbarStyles.snackbar, getSnackbarStyle()]}>
        <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
          <Ionicons
            name={getIconName() as any}
            size={20}
            color="#fff"
            style={snackbarStyles.icon}
          />
          <Text style={snackbarStyles.message}>{snackbar.message}</Text>
        </View>
        <TouchableOpacity style={snackbarStyles.closeButton} onPress={handleHideSnackbar}>
          <Ionicons name="close" size={20} color="#fff" />
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
}; 