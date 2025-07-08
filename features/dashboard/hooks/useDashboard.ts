import { useEffect } from 'react';
import { useDispatch, useSelector } from '@/store';
import { loadTickets, selectPendingTickets, selectTodayTickets, syncTickets } from '@/store/ticketsSlice';
import { selectAllPozos, syncPozos } from '@/store/pozosSlice';
import { showSnackbar } from '@/store/snackbarSlice';
import { useRouter } from 'expo-router';

export const useDashboard = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  
  const user = useSelector((state: any) => state.auth.user);
  const pendingTickets = useSelector(selectPendingTickets);
  const todayTickets = useSelector(selectTodayTickets);
  const pozos = useSelector(selectAllPozos);

  // Cargar tickets al montar el componente
  useEffect(() => {
    dispatch(loadTickets());
  }, [dispatch]);

  // Función para nueva captura
  const handleNewCapture = () => {
    router.push("/(tabs)/seleccion-pozo");
    
    dispatch(
      showSnackbar({
        message: "Seleccione un pozo para comenzar la captura",
        type: "info",
        duration: 3000,
      }),
    );
  };

  // Función para sincronización
  const handleSync = async () => {
    dispatch(
      showSnackbar({
        message: "Sincronizando datos...",
        type: "info",
        duration: 2000,
      }),
    );

    try {
      await Promise.all([
        dispatch(syncTickets()).unwrap(),
        dispatch(syncPozos()).unwrap(),
      ]);

      dispatch(
        showSnackbar({
          message: "¡Sincronización completada!",
          type: "success",
          duration: 3000,
        }),
      );
    } catch (error) {
      console.error("Error al sincronizar:", error);
      dispatch(
        showSnackbar({
          message: "Error al sincronizar datos",
          type: "error",
          duration: 3000,
        }),
      );
    }
  };

  return {
    user,
    pendingTickets,
    todayTickets,
    pozos,
    handleNewCapture,
    handleSync,
  };
}; 