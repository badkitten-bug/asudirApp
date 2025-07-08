import { useState, useEffect, useCallback } from 'react';

export function usePozoInfo(pozoId: string, userToken: string | undefined) {
  const [pozoInfo, setPozoInfo] = useState<any>(null);
  const [loadingPozo, setLoadingPozo] = useState(true);

  const fetchPozo = useCallback(async () => {
    setLoadingPozo(true);
    try {
      let baseUrl = process.env.EXPO_PUBLIC_API_URL || '';
      if (baseUrl.endsWith('/')) baseUrl = baseUrl.slice(0, -1);
      if (!baseUrl.endsWith('/api')) baseUrl = baseUrl + '/api';
      const url = `${baseUrl}/pozos/${pozoId}`;
      const headers = {
        'Authorization': `Bearer ${userToken}`,
        'Content-Type': 'application/json',
      };
      console.log('Valor de EXPO_PUBLIC_API_URL:', process.env.EXPO_PUBLIC_API_URL);
      console.log('URL de fetchPozo:', url);
      console.log('Headers de fetchPozo:', headers);
      const res = await fetch(url, { headers });
      if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      const data = await res.json();
      setPozoInfo(data.data);
      setLoadingPozo(false);
    } catch (error) {
      console.error('Error al obtener información del pozo:', error);
      setLoadingPozo(false);
    }
  }, [pozoId, userToken]);

  useEffect(() => {
    fetchPozo();
  }, [fetchPozo]);

  return { pozoInfo, loadingPozo, refetch: fetchPozo };
}