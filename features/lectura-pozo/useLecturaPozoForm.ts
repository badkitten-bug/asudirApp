import { useState } from 'react';
import { showSnackbar } from '../../store/snackbarSlice';
import { useDispatch } from '../../store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React from 'react';

export function useLecturaPozoForm(pozoId: string) {
  const dispatch = useDispatch();

  // Estado inicial para el formulario
  const initialState = {
    lecturaVolumen: '0',
    photoUri: null as string | null,
    showCamera: false,
    showCameraElec: false,
    gasto: '0',
    mostrarAnomaliasVol: false,
    mostrarAnomaliasElec: false,
    anomaliasVol: [] as string[],
    anomaliasElec: [] as string[],
    cambioSerieVol: '',
    cambioSerieElec: '',
    otroVol: '',
    otroElec: '',
    lecturaElectrica: '',
    photoUriElec: null as string | null,
    observaciones: '',
  };

  // Estados para los campos del formulario
  const [lecturaVolumen, setLecturaVolumen] = useState(initialState.lecturaVolumen);
  const [photoUri, setPhotoUri] = useState<string | null>(initialState.photoUri);
  const [showCamera, setShowCamera] = useState(initialState.showCamera);
  const [showCameraElec, setShowCameraElec] = useState(initialState.showCameraElec);
  const [gasto, setGasto] = useState(initialState.gasto);
  const [mostrarAnomaliasVol, setMostrarAnomaliasVol] = useState(initialState.mostrarAnomaliasVol);
  const [mostrarAnomaliasElec, setMostrarAnomaliasElec] = useState(initialState.mostrarAnomaliasElec);
  const [anomaliasVol, setAnomaliasVol] = useState<string[]>(initialState.anomaliasVol);
  const [anomaliasElec, setAnomaliasElec] = useState<string[]>(initialState.anomaliasElec);
  const [cambioSerieVol, setCambioSerieVol] = useState(initialState.cambioSerieVol);
  const [cambioSerieElec, setCambioSerieElec] = useState(initialState.cambioSerieElec);
  const [otroVol, setOtroVol] = useState(initialState.otroVol);
  const [otroElec, setOtroElec] = useState(initialState.otroElec);
  const [lecturaElectrica, setLecturaElectrica] = useState(initialState.lecturaElectrica);
  const [photoUriElec, setPhotoUriElec] = useState<string | null>(initialState.photoUriElec);
  const [observaciones, setObservaciones] = useState(initialState.observaciones);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoFileElec, setPhotoFileElec] = useState<File | null>(null);

  // --- Persistencia temporal por pozo ---
  const STORAGE_KEY = `lecturaPozoForm:${pozoId}`;

  // Cargar estado guardado al iniciar o cambiar pozoId
  React.useEffect(() => {
    let isMounted = true;
    const loadState = async () => {
      try {
        const saved = await AsyncStorage.getItem(STORAGE_KEY);
        if (saved && isMounted) {
          const state = JSON.parse(saved);
          setLecturaVolumen(state.lecturaVolumen ?? initialState.lecturaVolumen);
          setPhotoUri(state.photoUri ?? initialState.photoUri);
          setShowCamera(state.showCamera ?? initialState.showCamera);
          setShowCameraElec(state.showCameraElec ?? initialState.showCameraElec);
          setGasto(state.gasto ?? initialState.gasto);
          setMostrarAnomaliasVol(state.mostrarAnomaliasVol ?? initialState.mostrarAnomaliasVol);
          setMostrarAnomaliasElec(state.mostrarAnomaliasElec ?? initialState.mostrarAnomaliasElec);
          setAnomaliasVol(state.anomaliasVol ?? initialState.anomaliasVol);
          setAnomaliasElec(state.anomaliasElec ?? initialState.anomaliasElec);
          setCambioSerieVol(state.cambioSerieVol ?? initialState.cambioSerieVol);
          setCambioSerieElec(state.cambioSerieElec ?? initialState.cambioSerieElec);
          setOtroVol(state.otroVol ?? initialState.otroVol);
          setOtroElec(state.otroElec ?? initialState.otroElec);
          setLecturaElectrica(state.lecturaElectrica ?? initialState.lecturaElectrica);
          setPhotoUriElec(state.photoUriElec ?? initialState.photoUriElec);
          setObservaciones(state.observaciones ?? initialState.observaciones);
          setPhotoFile(state.photoFile ?? null);
          setPhotoFileElec(state.photoFileElec ?? null);
        }
      } catch (e) {
        // Si hay error, ignorar y usar estado inicial
      }
    };
    loadState();
    return () => { isMounted = false; };
  }, [pozoId]);

  // Guardar estado cada vez que cambie algún campo
  React.useEffect(() => {
    const saveState = async () => {
      const state = {
        lecturaVolumen,
        photoUri,
        showCamera,
        showCameraElec,
        gasto,
        mostrarAnomaliasVol,
        mostrarAnomaliasElec,
        anomaliasVol,
        anomaliasElec,
        cambioSerieVol,
        cambioSerieElec,
        otroVol,
        otroElec,
        lecturaElectrica,
        photoUriElec,
        observaciones,
        photoFile,
        photoFileElec,
      };
      try {
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      } catch (e) {
        // Si hay error, ignorar
      }
    };
    saveState();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lecturaVolumen, photoUri, showCamera, showCameraElec, gasto, mostrarAnomaliasVol, mostrarAnomaliasElec, anomaliasVol, anomaliasElec, cambioSerieVol, cambioSerieElec, otroVol, otroElec, lecturaElectrica, photoUriElec, observaciones, photoFile, photoFileElec, pozoId]);

  // Función para limpiar el estado (en memoria y en storage)
  const resetForm = async () => {
    setLecturaVolumen(initialState.lecturaVolumen);
    setPhotoUri(initialState.photoUri);
    setShowCamera(initialState.showCamera);
    setShowCameraElec(initialState.showCameraElec);
    setGasto(initialState.gasto);
    setMostrarAnomaliasVol(initialState.mostrarAnomaliasVol);
    setMostrarAnomaliasElec(initialState.mostrarAnomaliasElec);
    setAnomaliasVol(initialState.anomaliasVol);
    setAnomaliasElec(initialState.anomaliasElec);
    setCambioSerieVol(initialState.cambioSerieVol);
    setCambioSerieElec(initialState.cambioSerieElec);
    setOtroVol(initialState.otroVol);
    setOtroElec(initialState.otroElec);
    setLecturaElectrica(initialState.lecturaElectrica);
    setPhotoUriElec(initialState.photoUriElec);
    setObservaciones(initialState.observaciones);
    setPhotoFile(null);
    setPhotoFileElec(null);
    try {
      await AsyncStorage.removeItem(STORAGE_KEY);
    } catch (e) {}
  };

  // Helpers
  const handleLecturaVolumenChange = (text: string) => {
    const numericValue = text.replace(/\D/g, '');
    setLecturaVolumen(numericValue);
  };

  const handleGastoChange = (text: string) => {
    const numericValue = text.replace(/\D/g, '');
    const value = parseInt(numericValue) || 0;
    if (value <= 200) {
      setGasto(numericValue);
    } else {
      dispatch(showSnackbar({
        message: 'El gasto no puede ser mayor a 200 l/s',
        type: 'error',
        duration: 3000,
      }));
    }
  };

  const handleLecturaElectricaChange = (text: string) => {
    const numericValue = text.replace(/\D/g, '');
    setLecturaElectrica(numericValue);
  };

  const handleCheck = (arr: string[], setArr: (v: string[]) => void, value: string) => {
    if (arr.includes(value)) {
      setArr(arr.filter(a => a !== value));
    } else {
      setArr([...arr, value]);
    }
  };

  return {
    lecturaVolumen, setLecturaVolumen,
    photoUri, setPhotoUri,
    showCamera, setShowCamera,
    showCameraElec, setShowCameraElec,
    gasto, setGasto,
    mostrarAnomaliasVol, setMostrarAnomaliasVol,
    mostrarAnomaliasElec, setMostrarAnomaliasElec,
    anomaliasVol, setAnomaliasVol,
    anomaliasElec, setAnomaliasElec,
    cambioSerieVol, setCambioSerieVol,
    cambioSerieElec, setCambioSerieElec,
    otroVol, setOtroVol,
    otroElec, setOtroElec,
    lecturaElectrica, setLecturaElectrica,
    photoUriElec, setPhotoUriElec,
    observaciones, setObservaciones,
    handleLecturaVolumenChange,
    handleGastoChange,
    handleLecturaElectricaChange,
    handleCheck,
    resetForm,
    photoFile, setPhotoFile,
    photoFileElec, setPhotoFileElec,
  };
}
