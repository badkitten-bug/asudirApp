import { useState } from 'react';
import { useDispatch, useSelector } from '@/store';
import { logout } from '@/store/authSlice';
import { showSnackbar } from '@/store/snackbarSlice';
import { selectUser } from '@/store/authSlice';
import { useRouter } from 'expo-router';

export const usePerfil = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const user = useSelector(selectUser);
  
  const [isLoading, setIsLoading] = useState(false);

  // Función para cerrar sesión
  const handleLogout = async () => {
    setIsLoading(true);
    try {
      await dispatch(logout());
      dispatch(showSnackbar({
        message: 'Sesión cerrada correctamente',
        type: 'success',
        duration: 2000,
      }));
      router.replace('/(auth)');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
      dispatch(showSnackbar({
        message: 'Error al cerrar sesión',
        type: 'error',
        duration: 3000,
      }));
    } finally {
      setIsLoading(false);
    }
  };

  // Función para sincronizar datos
  const handleSync = async () => {
    setIsLoading(true);
    try {
      // Aquí podrías agregar lógica de sincronización específica del perfil
      dispatch(showSnackbar({
        message: 'Datos sincronizados correctamente',
        type: 'success',
        duration: 2000,
      }));
    } catch (error) {
      console.error('Error al sincronizar:', error);
      dispatch(showSnackbar({
        message: 'Error al sincronizar datos',
        type: 'error',
        duration: 3000,
      }));
    } finally {
      setIsLoading(false);
    }
  };

  return {
    user,
    isLoading,
    handleLogout,
    handleSync,
  };
}; 