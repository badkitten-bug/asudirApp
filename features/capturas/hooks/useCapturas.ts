import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from '@/store';
import { loadTickets, selectAllTickets } from '@/store/ticketsSlice';
import { showSnackbar } from '@/store/snackbarSlice';
import { selectUser } from '@/store/authSlice';
import { useRouter } from 'expo-router';

export const useCapturas = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const user = useSelector(selectUser);
  const tickets = useSelector(selectAllTickets);
  
  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Cargar tickets al montar el componente
  useEffect(() => {
    if (user?.token) {
      loadTicketsData();
    }
  }, [user?.token]);

  // Función para cargar tickets
  const loadTicketsData = async () => {
    setIsLoading(true);
    try {
      await dispatch(loadTickets()).unwrap();
      dispatch(showSnackbar({
        message: 'Tickets cargados correctamente',
        type: 'success',
        duration: 2000,
      }));
    } catch (error) {
      console.error('Error al cargar tickets:', error);
      dispatch(showSnackbar({
        message: 'Error al cargar tickets',
        type: 'error',
        duration: 3000,
      }));
    } finally {
      setIsLoading(false);
    }
  };

  // Función para refrescar tickets
  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await dispatch(loadTickets()).unwrap();
      dispatch(showSnackbar({
        message: 'Tickets actualizados',
        type: 'success',
        duration: 1500,
      }));
    } catch (error) {
      dispatch(showSnackbar({
        message: 'Error al actualizar tickets',
        type: 'error',
        duration: 3000,
      }));
    } finally {
      setRefreshing(false);
    }
  };

  // Función para ver un ticket
  const handleVerTicket = (ticketId: string) => {
    const ticket = tickets.find((t) => t.id === ticketId);
    if (ticket) {
      router.push({
        pathname: "/(tabs)/ticket",
        params: {
          pozoId: ticket.pozoId,
          pozoNombre: ticket.pozoNombre,
          pozoUbicacion: ticket.pozoUbicacion,
          lecturaVolumen: ticket.lecturaVolumen,
          lecturaElectrica: ticket.lecturaElectrica,
          cargaMotor: ticket.cargaMotor,
          gastoPozo: ticket.gastoPozo,
          observaciones: ticket.observaciones,
        },
      });
    }
  };

  // Función para sincronizar tickets
  const handleSyncTickets = async () => {
    setIsLoading(true);
    try {
      await dispatch(loadTickets()).unwrap();
      dispatch(showSnackbar({
        message: 'Sincronización completada',
        type: 'success',
        duration: 2000,
      }));
    } catch (error) {
      dispatch(showSnackbar({
        message: 'Error en la sincronización',
        type: 'error',
        duration: 3000,
      }));
    } finally {
      setIsLoading(false);
    }
  };

  return {
    tickets,
    isLoading,
    refreshing,
    loadTicketsData,
    handleRefresh,
    handleVerTicket,
    handleSyncTickets,
  };
}; 