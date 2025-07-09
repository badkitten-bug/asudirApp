import { useEffect } from 'react';
import NetInfo from '@react-native-community/netinfo';
import { useDispatch, useSelector } from '../store';
import { removePendingLectura, PendingLectura } from '../store/pendingLecturasSlice';
import { showSnackbar } from '../store/snackbarSlice';

async function subirLecturaYFotos(pending: PendingLectura, token: string) {
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
  const pendingLecturas = useSelector((state: any) => state.pendingLecturas.items);
  const user = useSelector((state: any) => state.auth.user);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(async state => {
      if (state.isConnected && user?.token && pendingLecturas.length > 0) {
        for (const pending of pendingLecturas) {
          try {
            await subirLecturaYFotos(pending, user.token);
            dispatch(removePendingLectura(pending.id));
            dispatch(showSnackbar({ message: 'Lectura sincronizada con éxito', type: 'success', duration: 3000 }));
          } catch (error: any) {
            if (error.isDuplicate) {
              dispatch(removePendingLectura(pending.id));
              dispatch(showSnackbar({ message: 'Ya existe una lectura para este pozo en el mes actual', type: 'warning', duration: 4000 }));
            } else {
              dispatch(showSnackbar({ message: error.message || 'Error al sincronizar lectura', type: 'error', duration: 4000 }));
              break; // Si falla una, espera a la próxima conexión
            }
          }
        }
      }
    });
    return () => unsubscribe();
  }, [pendingLecturas, user?.token, dispatch]);
} 