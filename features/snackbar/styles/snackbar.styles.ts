import { StyleSheet } from 'react-native';

export const snackbarStyles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
  },
  snackbar: {
    margin: 16,
    padding: 16,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  success: {
    backgroundColor: '#00A86B',
  },
  error: {
    backgroundColor: '#e74c3c',
  },
  warning: {
    backgroundColor: '#f39c12',
  },
  info: {
    backgroundColor: '#3498db',
  },
  message: {
    color: '#fff',
    fontSize: 14,
    flex: 1,
    marginRight: 8,
  },
  closeButton: {
    padding: 4,
  },
  icon: {
    marginRight: 8,
  },
}); 