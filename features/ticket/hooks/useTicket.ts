import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from '@/store';
import { addTicket, selectAllTickets } from '@/store/ticketsSlice';
import { showSnackbar } from '@/store/snackbarSlice';
import { useRouter } from 'expo-router';
import { selectUser } from '@/store/authSlice';

export const useTicket = (ticketDocumentId?: string) => {
  const dispatch = useDispatch();
  const router = useRouter();
  const user = useSelector(selectUser);
  const allTickets = useSelector(selectAllTickets);

  const [ticketData, setTicketData] = useState<any>(null);
  const [lecturaData, setLecturaData] = useState<any>(null);
  const [loadingTicket, setLoadingTicket] = useState(false);
  const [pozoData, setPozoData] = useState<any>(null);
  const [loadingPozoData, setLoadingPozoData] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [ticketSaved, setTicketSaved] = useState(false);

  // Cargar ticket desde backend
  useEffect(() => {
    const fetchTicket = async () => {
      if (!ticketDocumentId || !user?.token) return;
      setLoadingTicket(true);
      try {
        const res = await fetch(
          `${process.env.EXPO_PUBLIC_API_URL}/tickets/${ticketDocumentId}?populate[lectura]=true&populate[pozo]=true`,
          {
            headers: { 'Authorization': `Bearer ${user.token}` }
          }
        );
        const data = await res.json();
        setTicketData(data.data);
        setLecturaData(data.data?.lectura);
      } catch (e) {
        setTicketData(null);
        setLecturaData(null);
      } finally {
        setLoadingTicket(false);
      }
    };
    if (ticketDocumentId) fetchTicket();
  }, [ticketDocumentId, user?.token]);

  // Cargar datos del pozo
  const fetchPozoData = async (pozoId: string) => {
    if (!user?.token) return;
    setLoadingPozoData(true);
    try {
      const res = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/pozos/${pozoId}?populate[bateria]=true`,
        {
          headers: { 'Authorization': `Bearer ${user.token}` }
        }
      );
      const data = await res.json();
      setPozoData(data.data);
    } catch (e) {
      setPozoData(null);
    } finally {
      setLoadingPozoData(false);
    }
  };

  // Guardar ticket si no existe
  const saveTicketIfNeeded = async (ticketInfo: any) => {
    if (ticketSaved) return null;

    const uniqueId = `TICKET-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    const lectura = ticketData?.lectura ?? {};
    const pozo = lectura?.pozo ?? {};

    const newTicket = {
      id: uniqueId,
      pozoId: ticketInfo.pozoId,
      pozoNombre: pozo?.numeropozo ?? 'N/A',
      pozoUbicacion: pozo?.predio ?? 'N/A',
      lecturaVolumen: ticketInfo.lecturaVolumen || 'N/A',
      lecturaElectrica: ticketInfo.lecturaElectrica || 'N/A',
      cargaMotor: lectura?.carga_motor ?? 'N/A',
      gastoPozo: lectura?.gasto_pozo ?? 'N/A',
      observaciones: lectura?.observaciones ?? 'Sin observaciones',
      fecha: ticketData?.fecha?.split('T')[0] ?? '',
      hora: ticketData?.fecha?.split('T')[1] ?? '',
      estado: "pendiente" as const,
    };

    try {
      await dispatch(addTicket(newTicket)).unwrap();
      setTicketSaved(true);
      dispatch(showSnackbar({
        message: "Ticket guardado correctamente",
        type: "success",
        duration: 2000,
      }));
      return uniqueId;
    } catch (error) {
      console.error("Error al guardar el ticket:", error);
      dispatch(showSnackbar({
        message: "Error al guardar el ticket",
        type: "error",
        duration: 3000,
      }));
      return null;
    }
  };

  // Verificar si ticket ya existe
  const checkExistingTicket = (pozoId: string, fecha: string) => {
    const existingTicket = allTickets.find(
      (t) => t.pozoId === pozoId && t.fecha === fecha
    );
    if (existingTicket) {
      setTicketSaved(true);
      return true;
    }
    return false;
  };

  return {
    ticketData,
    lecturaData,
    pozoData,
    loadingTicket,
    loadingPozoData,
    isLoading,
    ticketSaved,
    setTicketData,
    setLecturaData,
    setLoadingTicket,
    setLoadingPozoData,
    setIsLoading,
    setTicketSaved,
    fetchPozoData,
    saveTicketIfNeeded,
    checkExistingTicket,
  };
}; 