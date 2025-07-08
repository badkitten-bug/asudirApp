import { useEffect } from 'react';
import { useDispatch, useSelector } from '@/store';
import { useRouter } from 'expo-router';
import { showSnackbar } from '@/store/snackbarSlice';
import { loadTickets, selectPendingTickets, selectTodayTickets, syncTickets } from '@/store/ticketsSlice';
import { selectAllPozos, syncPozos } from '@/store/pozosSlice';
import { syncUsers } from '@/store/authSlice';

export const useControlPanel = () => {
  const dispatch = useDispatch();
  const router = useRouter();

  // Obtener datos reales de tickets
  const pendingTickets = useSelector(selectPendingTickets);
  const todayTickets = useSelector(selectTodayTickets);
  const pozos = useSelector(selectAllPozos);

  // Cargar tickets al montar el componente
  useEffect(() => {
    dispatch(loadTickets());
  }, [dispatch]);

  const handleNewCapture = () => {
    // Navegar a la pantalla de selección de pozo
    router.push('/(tabs)/seleccion-pozo');

    // Mostrar mensaje informativo
    dispatch(
      showSnackbar({
        message: 'Seleccione un pozo o use los datos predefinidos',
        type: 'info',
        duration: 3000,
      }),
    );
  };

  // Modificar la función handleSync para incluir la sincronización de usuarios
  const handleSync = async () => {
    // Mostrar mensaje de inicio de sincronización
    dispatch(
      showSnackbar({
        message: 'Sincronizando datos...',
        type: 'info',
        duration: 2000,
      }),
    );

    try {
      // Sincronizar tickets, pozos y usuarios
      await Promise.all([
        dispatch(syncTickets()).unwrap(),
        dispatch(syncPozos()).unwrap(),
        dispatch(syncUsers()).unwrap(),
      ]);

      dispatch(
        showSnackbar({
          message: '¡Sincronización completada!',
          type: 'success',
          duration: 3000,
        }),
      );
    } catch (error) {
      console.error('Error al sincronizar:', error);
      dispatch(
        showSnackbar({
          message: 'Error al sincronizar datos',
          type: 'error',
          duration: 3000,
        }),
      );
    }
  };

  return {
    pendingTickets,
    todayTickets,
    pozos,
    handleNewCapture,
    handleSync,
  };
}; 