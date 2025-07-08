import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from '@/store';
import { selectAllPozos } from '@/store/pozosSlice';
import { selectPendingTickets } from '@/store/ticketsSlice';
import { getApiUrl, getAuthHeaders } from '@/src/config/api';

// Opciones para los filtros
export const MESES = [
  { label: 'Enero', value: '01' },
  { label: 'Febrero', value: '02' },
  { label: 'Marzo', value: '03' },
  { label: 'Abril', value: '04' },
  { label: 'Mayo', value: '05' },
  { label: 'Junio', value: '06' },
  { label: 'Julio', value: '07' },
  { label: 'Agosto', value: '08' },
  { label: 'Septiembre', value: '09' },
  { label: 'Octubre', value: '10' },
  { label: 'Noviembre', value: '11' },
  { label: 'Diciembre', value: '12' },
];

// Tipo para los datos de lectura en la UI
export interface LecturaData {
  fecha: string;
  pozoNombre: string;
  pozoUbicacion: string;
  bateria: string;
  usuario: string;
  volumen: string | number;
  gasto: string | number;
  lecturaElectrica: string;
  observaciones: string;
  ticketNumero: string;
  ticketId: string | null;
  pozoId?: string;
  lecturaId: string;
  capturadorId?: string;
  estado?: string;
}

export const useRegistroLecturas = () => {
  const dispatch = useDispatch();
  const pozos = useSelector(selectAllPozos);
  const user = useSelector((state: any) => state.auth.user);
  const pendingTickets = useSelector(selectPendingTickets);

  // Estado para lecturas reales del backend
  const [lecturas, setLecturas] = useState<LecturaData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Estados para los filtros
  const [filtroPozo, setFiltroPozo] = useState('');
  const [filtroBateria, setFiltroBateria] = useState('');
  const [filtroDia, setFiltroDia] = useState('');
  const [filtroMes, setFiltroMes] = useState('');
  const [filtroAno, setFiltroAno] = useState('');
  const [filtroFechaInicio, setFiltroFechaInicio] = useState('');
  const [filtroFechaFin, setFiltroFechaFin] = useState('');

  useEffect(() => {
    const fetchLecturas = async () => {
      if (!user || !user.token) return;
      
      setIsLoading(true);
      try {
        const url = `${getApiUrl()}/lectura-pozos?populate[pozo]=true&populate[capturador]=true`;
        const headers = getAuthHeaders(user.token);
        
        console.log('URL de fetchLecturas:', url);
        console.log('Headers de fetchLecturas:', headers);
        
        const res = await fetch(url, { headers });
        
        if (!res.ok) {
          const errorText = await res.text();
          console.error('Error response fetchLecturas:', errorText);
          throw new Error(`HTTP ${res.status}: ${res.statusText}`);
        }
        
        const data = await res.json();
        
        // Mapear cada lectura a un objeto para la UI
        const lecturasMapped = (data.data ?? []).map((l: any) => ({
          fecha: l.fecha ? l.fecha.split('T')[0] : 'No disponible',
          pozoNombre: l.pozo?.numeropozo ?? 'No disponible',
          pozoUbicacion: l.pozo?.predio ?? 'No disponible',
          bateria: l.pozo?.bateria?.nombrebateria ?? 'No disponible',
          volumen: l.lectura_volumetrica ?? 'No disponible',
          gasto: l.gasto ?? 'No disponible',
          lecturaElectrica: l.lectura_electrica ?? 'No disponible',
          observaciones: l.observaciones ?? 'Sin observaciones',
          pozoId: l.pozo?.id,
          lecturaId: l.id,
          capturadorId: l.capturador?.id,
        }));
        
        // Filtrar solo las lecturas del usuario actual
        const lecturasDelUsuario = lecturasMapped.filter((l) => l.capturadorId === user.id);
        setLecturas(lecturasDelUsuario);
      } catch (e) {
        console.error('Error al cargar lecturas:', e);
        setLecturas([]);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchLecturas();
  }, [user]);

  // Obtener baterías únicas para el filtro
  const baterias = Array.from(new Set(pozos.map((pozo) => pozo.bateria)));

  // Obtener años únicos para el filtro
  const anos = Array.from(
    new Set(
      lecturas
        .map((lectura) => {
          const fecha = lectura.fecha.split('-');
          return fecha.length > 0 ? fecha[0] : '';
        })
        .filter(Boolean),
    ),
  ).sort((a, b) => b.localeCompare(a)); // Ordenar descendente

  // Aplicar filtros a las lecturas
  const filteredLecturas = lecturas.filter((lectura) => {
    // Filtro por búsqueda
    const matchesSearch =
      searchQuery === '' ||
      lectura.pozoNombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lectura.pozoUbicacion.toLowerCase().includes(searchQuery.toLowerCase());

    // Filtro por pozo
    const matchesPozo = filtroPozo === '' || lectura.pozoNombre === filtroPozo;

    // Filtro por batería
    const matchesBateria =
      filtroBateria === '' ||
      (lectura.pozoId && pozos.find((p) => p.id === lectura.pozoId)?.bateria === filtroBateria);

    // Filtrar por fecha
    const fechaParts = lectura.fecha.split('-');
    const ano = fechaParts.length > 0 ? fechaParts[0] : '';
    const mes = fechaParts.length > 1 ? fechaParts[1] : '';
    const dia = fechaParts.length > 2 ? fechaParts[2] : '';

    const matchesDia = filtroDia === '' || dia === filtroDia;
    const matchesMes = filtroMes === '' || mes === filtroMes;
    const matchesAno = filtroAno === '' || ano === filtroAno;

    // Filtro por rango de fechas
    let matchesRangoFechas = true;
    if (filtroFechaInicio !== '' && filtroFechaFin !== '') {
      const fechaLectura = new Date(lectura.fecha);
      const fechaInicio = new Date(filtroFechaInicio);
      const fechaFin = new Date(filtroFechaFin);

      matchesRangoFechas = fechaLectura >= fechaInicio && fechaLectura <= fechaFin;
    }

    return (
      matchesSearch &&
      matchesPozo &&
      matchesBateria &&
      matchesDia &&
      matchesMes &&
      matchesAno &&
      matchesRangoFechas
    );
  });

  // Unificar lecturas del backend y pendientes locales
  const lecturasPendientesUI = pendingTickets
    .filter((t) => t.capturadorId === user?.id)
    .map((t) => ({
      fecha: t.fecha,
      pozoNombre: t.pozoNombre,
      pozoUbicacion: t.pozoUbicacion,
      bateria: '',
      usuario: '',
      volumen: t.lecturaVolumen,
      gasto: t.gastoPozo,
      lecturaElectrica: t.lecturaElectrica,
      observaciones: t.observaciones,
      ticketNumero: t.id,
      ticketId: null,
      pozoId: t.pozoId,
      lecturaId: t.id,
      estado: 'pendiente',
      capturadorId: t.capturadorId,
    }));

  // Filtrar lecturas del backend por usuario actual
  const lecturasUsuario = lecturas.filter((l) => {
    if (l.usuario && user?.nombre) {
      return l.usuario === user.nombre;
    }
    return l.capturadorId === user?.id;
  });

  // Combinar lecturas del backend y pendientes
  const allLecturas = [...lecturasPendientesUI, ...lecturasUsuario];

  const handleClearFilters = () => {
    setFiltroPozo('');
    setFiltroBateria('');
    setFiltroDia('');
    setFiltroMes('');
    setFiltroAno('');
    setFiltroFechaInicio('');
    setFiltroFechaFin('');
    setSearchQuery('');
  };

  const handleRefreshLecturas = async () => {
    if (!user || !user.token) return;
    setIsLoading(true);
    try {
      const res = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/lectura-pozos?populate[pozo]=true&populate[capturador]=true`,
        {
          headers: { Authorization: `Bearer ${user.token}` },
        },
      );
      const data = await res.json();
      const lecturasMapped = (data.data ?? []).map((l: any) => ({
        fecha: l.fecha ? l.fecha.split('T')[0] : 'No disponible',
        pozoNombre: l.pozo?.numeropozo ?? 'No disponible',
        pozoUbicacion: l.pozo?.predio ?? 'No disponible',
        bateria: l.pozo?.bateria?.nombrebateria ?? 'No disponible',
        volumen: l.lectura_volumetrica ?? 'No disponible',
        gasto: l.gasto ?? 'No disponible',
        lecturaElectrica: l.lectura_electrica ?? 'No disponible',
        observaciones: l.observaciones ?? 'Sin observaciones',
        pozoId: l.pozo?.id,
        lecturaId: l.id,
        capturadorId: l.capturador?.id,
      }));
      const lecturasDelUsuario = lecturasMapped.filter((l) => l.capturadorId === user.id);
      setLecturas(lecturasDelUsuario);
    } catch (e) {
      console.error('Error al refrescar lecturas:', e);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    lecturas: allLecturas,
    filteredLecturas,
    isLoading,
    showFilters,
    searchQuery,
    filtroPozo,
    filtroBateria,
    filtroDia,
    filtroMes,
    filtroAno,
    filtroFechaInicio,
    filtroFechaFin,
    baterias,
    anos,
    setShowFilters,
    setSearchQuery,
    setFiltroPozo,
    setFiltroBateria,
    setFiltroDia,
    setFiltroMes,
    setFiltroAno,
    setFiltroFechaInicio,
    setFiltroFechaFin,
    handleClearFilters,
    handleRefreshLecturas,
  };
}; 