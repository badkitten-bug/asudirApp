import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from '@/store';
import { login, logout, selectUser, selectIsAuthenticated } from '@/store/authSlice';
import { showSnackbar } from '@/store/snackbarSlice';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface LoginCredentials {
  email: string;
  password: string;
}

export const useAuth = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const user = useSelector(selectUser);
  const isAuthenticated = useSelector(selectIsAuthenticated);
  
  const [isLoading, setIsLoading] = useState(false);

  // Verificar token al iniciar
  useEffect(() => {
    checkAuthStatus();
  }, []);

  // Función para verificar el estado de autenticación
  const checkAuthStatus = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (token && !isAuthenticated) {
        // Aquí podrías validar el token con el backend
        // Por ahora solo verificamos que existe
        console.log('Token encontrado en almacenamiento');
      }
    } catch (error) {
      console.error('Error al verificar autenticación:', error);
    }
  };

  // Función para iniciar sesión
  const handleLogin = async (credentials: LoginCredentials) => {
    setIsLoading(true);
    try {
      const baseUrl = process.env.EXPO_PUBLIC_API_URL || '';
      const response = await fetch(`${baseUrl}/auth/custom/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          identifier: credentials.email,
          password: credentials.password,
          platform: 'mobile',
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || 'Error de autenticación');
      }

      // Guardar token en AsyncStorage
      await AsyncStorage.setItem('userToken', data.jwt);
      await AsyncStorage.setItem('userData', JSON.stringify(data.user));

      // Actualizar store
      dispatch(login({
        user: data.user,
        token: data.jwt,
      }));

      dispatch(showSnackbar({
        message: 'Inicio de sesión exitoso',
        type: 'success',
        duration: 2000,
      }));

      // Navegar al dashboard
      router.replace('/(tabs)');
    } catch (error) {
      console.error('Error en login:', error);
      dispatch(showSnackbar({
        message: error instanceof Error ? error.message : 'Error al iniciar sesión',
        type: 'error',
        duration: 3000,
      }));
    } finally {
      setIsLoading(false);
    }
  };

  // Función para cerrar sesión
  const handleLogout = async () => {
    try {
      // Limpiar AsyncStorage
      await AsyncStorage.removeItem('userToken');
      await AsyncStorage.removeItem('userData');

      // Actualizar store
      dispatch(logout());

      dispatch(showSnackbar({
        message: 'Sesión cerrada correctamente',
        type: 'success',
        duration: 2000,
      }));

      // Navegar al login
      router.replace('/(auth)');
    } catch (error) {
      console.error('Error en logout:', error);
      dispatch(showSnackbar({
        message: 'Error al cerrar sesión',
        type: 'error',
        duration: 3000,
      }));
    }
  };

  // Función para validar credenciales
  const validateCredentials = (credentials: LoginCredentials): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];

    if (!credentials.email.trim()) {
      errors.push('El email es requerido');
    } else if (!/\S+@\S+\.\S+/.test(credentials.email)) {
      errors.push('El email no es válido');
    }

    if (!credentials.password.trim()) {
      errors.push('La contraseña es requerida');
    } else if (credentials.password.length < 6) {
      errors.push('La contraseña debe tener al menos 6 caracteres');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  };

  return {
    user,
    isAuthenticated,
    isLoading,
    handleLogin,
    handleLogout,
    validateCredentials,
    checkAuthStatus,
  };
}; 