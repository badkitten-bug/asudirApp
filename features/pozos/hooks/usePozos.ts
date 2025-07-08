import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from '@/store';
import { showSnackbar } from '@/store/snackbarSlice';
import { selectUser } from '@/store/authSlice';
import { selectAllTickets } from '@/store/ticketsSlice';
import { useRouter } from 'expo-router';

export interface Pozo {
  id: string;
  numeropozo: string;
  predio: string;
  localizacion?: string;
  profundidad?: number;
  bateria?: {
    id: string;
    nombrebateria: string;
  };
}

export const usePozos = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const user = useSelector(selectUser);
  const tickets = useSelector(selectAllTickets);
  
  const [pozos, setPozos] = useState<Pozo[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Cargar pozos al montar el componente
  useEffect(() => {
    if (user?.token) {
      loadPozos();
    }
  }, [user?.token]);

  // Función para cargar pozos
  const loadPozos = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/pozos?populate[bateria]=true`,
        {
          headers: { 'Authorization': `Bearer ${user?.token}` }
        }
      );
      
      if (!response.ok) {
        throw new Error('Error al cargar pozos');
      }
      
      const data = await response.json();
      setPozos(data.data || []);
      
      dispatch(showSnackbar({
        message: 'Pozos cargados correctamente',
        type: 'success',
        duration: 2000,
      }));
    } catch (error) {
      console.error('Error al cargar pozos:', error);
      dispatch(showSnackbar({
        message: 'Error al cargar pozos',
        type: 'error',
        duration: 3000,
      }));
    } finally {
      setIsLoading(false);
    }
  };

  // Función para refrescar pozos
  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await loadPozos();
    } finally {
      setRefreshing(false);
    }
  };

  // Función para verificar si un pozo ya tiene lectura en el mes actual
  const checkPozoHasLectura = (pozoId: string): boolean => {
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth() + 1;

    // Verificar tickets locales
    const hasLocalTicket = tickets.some(ticket => {
      if (ticket.pozoId !== pozoId) return false;
      
      const ticketDate = new Date(ticket.fecha);
      const ticketYear = ticketDate.getFullYear();
      const ticketMonth = ticketDate.getMonth() + 1;
      
      return ticketYear === currentYear && ticketMonth === currentMonth;
    });

    if (hasLocalTicket) return true;

    // Verificar lecturas del backend (si tenemos datos)
    // Esta lógica se puede expandir cuando tengamos acceso a las lecturas del backend
    return false;
  };

  // Función para seleccionar un pozo
  const handleSelectPozo = (pozo: Pozo) => {
    if (checkPozoHasLectura(pozo.id)) {
      dispatch(showSnackbar({
        message: 'Este pozo ya tiene una lectura registrada este mes',
        type: 'warning',
        duration: 3000,
      }));
      return;
    }

    router.push({
      pathname: "/(tabs)/nueva-captura",
      params: {
        pozoId: pozo.id,
        pozoNombre: pozo.numeropozo,
        pozoUbicacion: pozo.predio,
      },
    });
  };

  return {
    pozos,
    isLoading,
    refreshing,
    loadPozos,
    handleRefresh,
    handleSelectPozo,
    checkPozoHasLectura,
  };
}; 