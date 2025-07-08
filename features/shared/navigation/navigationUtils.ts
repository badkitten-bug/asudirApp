import { router } from 'expo-router';
import { showSnackbar } from '@/store/snackbarSlice';
import { store } from '@/store';

export const navigationUtils = {
  // Navegar con validación de autenticación
  navigateWithAuth: (route: string, params?: any) => {
    const state = store.getState();
    const isAuthenticated = !!state.auth.user?.token;

    if (!isAuthenticated) {
      store.dispatch(
        showSnackbar({
          message: 'Debes iniciar sesión para acceder a esta función',
          type: 'warning',
          duration: 3000,
        })
      );
      router.push('/(auth)/login');
      return;
    }

    router.push(route as any);
  },

  // Navegar de vuelta con confirmación
  goBackWithConfirmation: (message?: string) => {
    if (message) {
      store.dispatch(
        showSnackbar({
          message,
          type: 'info',
          duration: 2000,
        })
      );
    }
    router.back();
  },

  // Navegar a la pantalla principal
  goToMain: () => {
    router.replace('/(tabs)');
  },

  // Navegar al login
  goToLogin: () => {
    router.replace('/(auth)/login');
  },

  // Navegar con parámetros
  navigateWithParams: (route: string, params: Record<string, any>) => {
    const queryString = Object.entries(params)
      .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
      .join('&');
    
    router.push(`${route}?${queryString}` as any);
  },
}; 