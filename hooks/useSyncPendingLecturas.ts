import { useEffect, useRef } from 'react';
import NetInfo from '@react-native-community/netinfo';
import { useDispatch, useSelector } from '../store';
import { removePendingLectura, PendingLectura } from '../store/pendingLecturasSlice';
import { removeTicket, selectPendingTickets } from '../store/ticketsSlice';
import { showSnackbar } from '../store/snackbarSlice';

async function subirLecturaYFotos(pending: PendingLectura, token: string) {
  console.log('[SYNC] Subiendo lectura pendiente:', pending.id, pending.data);
  // 1. Subir la lectura
  const res = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/lectura-pozos`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ data: pending.data }),
  });
  if (res.status === 409) {
    // Error de duplicado
    const error = await res.json();
    const err: any = new Error(error.error || 'Duplicado');
    err.isDuplicate = true;
    throw err;
  }
  if (!res.ok) throw new Error('Error al crear la lectura');
  const lectura = await res.json();
  const lecturaId = lectura.data?.id;
  if (!lecturaId) throw new Error('No se pudo obtener el ID de la lectura');

  // 2. Subir fotos
  for (const foto of pending.fotos) {
    const formData = new FormData();
    if (typeof foto.file === 'string') {
      formData.append('files', {
        uri: foto.file,
        name: `${foto.field}.jpg`,
        type: 'image/jpeg',
      } as any);
    } else {
      formData.append('files', foto.file);
    }
    formData.append('ref', 'api::lectura-pozo.lectura-pozo');
    formData.append('refId', String(lecturaId));
    formData.append('field', foto.field);
    const resFoto = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/upload`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });
    if (!resFoto.ok) throw new Error(`Error al subir ${foto.field}`);
  }
}

export function useSyncPendingLecturas() {
  const dispatch = useDispatch();
  const pendingLecturas = useSelector((state: any) => state.pendingLecturas?.items || []);
  const pendingTickets = useSelector(selectPendingTickets);
  const user = useSelector((state: any) => state.auth.user);
  const isProcessingRef = useRef(false);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(async state => {
      console.log('[SYNC] NetInfo changed:', state.isConnected);
      if (state.isConnected && user?.token && (pendingLecturas?.length > 0 || pendingTickets?.length > 0) && !isProcessingRef.current) {
        isProcessingRef.current = true;
        console.log('[SYNC] Iniciando sincronización de lecturas/tickets pendientes...');
        
        try {
          // Procesar lecturas pendientes del slice anterior (si existe)
          if (pendingLecturas && pendingLecturas.length > 0) {
            for (const pending of pendingLecturas) {
              try {
                await subirLecturaYFotos(pending, user.token);
                console.log('[SYNC] Lectura sincronizada y eliminada:', pending.id);
                dispatch(removePendingLectura(pending.id));
                dispatch(showSnackbar({ 
                  message: 'Lectura sincronizada con éxito', 
                  type: 'success', 
                  duration: 2000 
                }));
              } catch (error: any) {
                if (error.isDuplicate) {
                  console.log('[SYNC] Lectura duplicada, eliminando:', pending.id);
                  dispatch(removePendingLectura(pending.id));
                  dispatch(showSnackbar({ 
                    message: 'Ya existe una lectura para este pozo en el mes actual', 
                    type: 'warning', 
                    duration: 3000 
                  }));
                } else {
                  console.log('[SYNC] Error sincronizando lectura:', error, pending.id);
                  // No mostrar error al usuario, solo mantener como pendiente
                  break; // Si falla una, esperar a la próxima conexión
                }
              }
            }
          }

          // Procesar tickets pendientes del nuevo sistema
          if (pendingTickets && pendingTickets.length > 0) {
            for (const ticket of pendingTickets) {
              try {
                console.log('[SYNC] Subiendo ticket pendiente:', ticket.id, ticket);
                // Crear payload de lectura
                const lecturaPayload = {
                  fecha: ticket.fecha,
                  lectura_volumetrica: String(ticket.lecturaVolumen),
                  gasto: String(ticket.gastoPozo),
                  lectura_electrica: String(ticket.lecturaElectrica),
                  observaciones: ticket.observaciones || undefined,
                  pozo: ticket.pozoId ? String(ticket.pozoId) : undefined,
                  capturador: ticket.capturadorId ? String(ticket.capturadorId) : undefined,
                  estado: "pendiente"
                };

                // Subir lectura
                const res = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/lectura-pozos`, {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${user.token}`,
                  },
                  body: JSON.stringify({ data: lecturaPayload }),
                });

                if (res.status === 409) {
                  // Duplicado, remover de pendientes
                  dispatch(removeTicket(ticket.id));
                  dispatch(showSnackbar({ 
                    message: 'Ya existe una lectura para este pozo en el mes actual', 
                    type: 'warning', 
                    duration: 3000 
                  }));
                  continue;
                }

                if (!res.ok) throw new Error('Error al crear la lectura');
                const lecturaData = await res.json();
                const lecturaId = lecturaData.data?.id;

                // Subir fotos si existen
                const fotos = [];
                if (ticket.photoVolumenUri) {
                  fotos.push({ field: 'foto_volumetrico', file: ticket.photoVolumenUri });
                }
                if (ticket.photoElectricaUri) {
                  fotos.push({ field: 'foto_electrico', file: ticket.photoElectricaUri });
                }

                for (const foto of fotos) {
                  const formData = new FormData();
                  formData.append('files', {
                    uri: foto.file,
                    name: `${foto.field}.jpg`,
                    type: 'image/jpeg',
                  } as any);
                  formData.append('ref', 'api::lectura-pozo.lectura-pozo');
                  formData.append('refId', String(lecturaId));
                  formData.append('field', foto.field);
                  
                  const resFoto = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/upload`, {
                    method: 'POST',
                    headers: { Authorization: `Bearer ${user.token}` },
                    body: formData,
                  });
                  if (!resFoto.ok) throw new Error(`Error al subir ${foto.field}`);
                }

                // Todo exitoso, remover de pendientes
                dispatch(removeTicket(ticket.id));
                console.log('[SYNC] Ticket sincronizado y eliminado:', ticket.id);
                dispatch(showSnackbar({ 
                  message: 'Lectura sincronizada completamente', 
                  type: 'success', 
                  duration: 2000 
                }));

              } catch (error: any) {
                console.log('[SYNC] Error sincronizando ticket:', error, ticket.id);
                // Mantener como pendiente para reintentar
                break;
              }
            }
          }
        } finally {
          isProcessingRef.current = false;
          console.log('[SYNC] Proceso de sincronización finalizado.');
        }
      }
    });
    return () => unsubscribe();
  }, [pendingLecturas, pendingTickets, user?.token, dispatch]);
} 