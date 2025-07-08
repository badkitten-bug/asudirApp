import { useState, useEffect, useCallback } from 'react';
import { getApiUrl, getAuthHeaders } from '@/src/config/api';

export function usePozoInfo(pozoId: string, userToken: string | undefined) {
  const [pozoInfo, setPozoInfo] = useState<any>(null);
  const [loadingPozo, setLoadingPozo] = useState(true);
  const [usuarioPozoId, setUsuarioPozoId] = useState<number | null>(null);
  const [cicloId, setCicloId] = useState<number | null>(null);

  const fetchPozo = useCallback(async () => {
    if (!userToken) {
      setLoadingPozo(false);
      return;
    }

    setLoadingPozo(true);
    try {
      const url = `${getApiUrl()}/pozos/${pozoId}?populate[usuario_pozos]=true&populate[ciclo_agricola]=true`;
      const headers = getAuthHeaders(userToken);
      
      console.log('URL de fetchPozo:', url);
      console.log('Headers de fetchPozo:', headers);
      
      const res = await fetch(url, { headers });
      
      if (!res.ok) {
        const errorText = await res.text();
        console.error('Error response fetchPozo:', errorText);
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }
      
      const data = await res.json();
      setPozoInfo(data.data);
      setUsuarioPozoId(data.data?.usuario_pozos?.[0]?.id ?? null);
      setCicloId(data.data?.ciclo_agricola?.id ?? null);
    } catch (error) {
      console.error('Error al obtener información del pozo:', error);
    } finally {
      setLoadingPozo(false);
    }
  }, [pozoId, userToken]);

  useEffect(() => {
    fetchPozo();
  }, [fetchPozo]);

  return { pozoInfo, loadingPozo, usuarioPozoId, cicloId, refetch: fetchPozo };
}