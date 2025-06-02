import { createSlice, type PayloadAction, createAsyncThunk } from "@reduxjs/toolkit"
import AsyncStorage from "@react-native-async-storage/async-storage"

// Definir la estructura de un pozo
export interface Pozo {
  id: string
  documentId: string
  nombre: string
  bateria: string
  predio: string
  coordenadas?: {
    latitud: number
    longitud: number
  }
  ultimaSincronizacion?: string
}

interface PozosState {
  pozos: Pozo[]
  isLoading: boolean
  error: string | null
  lastSyncDate: string | null
}

// Datos iniciales para tener algo que mostrar la primera vez
// const POZOS_INICIALES: Pozo[] = [ ... ] // ELIMINADO

const initialState: PozosState = {
  pozos: [],
  isLoading: false,
  error: null,
  lastSyncDate: null,
}

// Clave para almacenar los pozos en AsyncStorage
const POZOS_STORAGE_KEY = "@pozos_data"
const POZOS_SYNC_DATE_KEY = "@pozos_sync_date"

// Thunk para cargar los pozos desde AsyncStorage
export const loadPozos = createAsyncThunk("pozos/loadPozos", async () => {
  try {
    const pozosJson = await AsyncStorage.getItem(POZOS_STORAGE_KEY)
    const lastSyncDate = await AsyncStorage.getItem(POZOS_SYNC_DATE_KEY)
    if (pozosJson) {
      const pozos = JSON.parse(pozosJson)
      console.log("Pozos cargados desde AsyncStorage:", pozos.length)
      return { pozos, lastSyncDate }
    }
    // Si no hay datos en AsyncStorage, dejar el array vacío
    return { pozos: [], lastSyncDate: null }
  } catch (error) {
    console.error("Error loading pozos from storage:", error)
    return { pozos: [], lastSyncDate: null }
  }
})

// Thunk para guardar los pozos en AsyncStorage
export const savePozos = createAsyncThunk("pozos/savePozos", async (pozos: Pozo[]) => {
  try {
    await AsyncStorage.setItem(POZOS_STORAGE_KEY, JSON.stringify(pozos))
    console.log("Pozos guardados en AsyncStorage:", pozos.length)
    return pozos
  } catch (error) {
    console.error("Error saving pozos to storage:", error)
    throw error
  }
})

// Thunk para sincronizar pozos con el servidor real
export const syncPozos = createAsyncThunk("pozos/syncPozos", async (_, { getState }) => {
  try {
    // Obtener userId y token del estado de autenticación
    const state = getState() as any;
    const userId = state.auth.user?.id;
    const token = state.auth.user?.token;

    if (!userId || !token) {
      throw new Error("Usuario no autenticado");
    }

    // Usar la variable de entorno para la URL del backend
    const API_URL = process.env.EXPO_PUBLIC_API_URL;

    const response = await fetch(`${API_URL}/api/pozos-capturador/${userId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    if (!response.ok) throw new Error('Error al obtener pozos');
    const data = await response.json();

    // Mapea los pozos al formato que espera tu UI
    const pozos = data.pozos.map((pozo: any) => ({
      id: pozo.id.toString(),
      documentId: pozo.documentId,
      nombre: pozo.numeropozo,
      bateria: pozo.bateria,
      predio: pozo.predio,
    }));

    // Guardar en AsyncStorage
    await AsyncStorage.setItem(POZOS_STORAGE_KEY, JSON.stringify(pozos));
    const syncDate = new Date().toISOString();
    await AsyncStorage.setItem(POZOS_SYNC_DATE_KEY, syncDate);

    return { pozos, syncDate };
  } catch (error) {
    console.error("Error syncing pozos with server:", error);
    throw error;
  }
});

// Thunk para agregar un nuevo pozo
export const addPozo = createAsyncThunk("pozos/addPozo", async (pozo: Pozo, { getState, dispatch }) => {
  try {
    const state = getState() as { pozos: PozosState }
    
    // Verificar si ya existe un pozo con el mismo ID
    const existingPozo = state.pozos.pozos.find(p => p.id === pozo.id)
    
    if (existingPozo) {
      console.log("Pozo ya existe, no se agregará duplicado:", existingPozo.id)
      return state.pozos.pozos
    }
    
    // Si no existe, agregarlo
    const updatedPozos = [...state.pozos.pozos, pozo]
    await dispatch(savePozos(updatedPozos))
    return updatedPozos
  } catch (error) {
    console.error("Error adding pozo:", error)
    throw error
  }
})

const pozosSlice = createSlice({
  name: "pozos",
  initialState,
  reducers: {
    setPozos: (state, action: PayloadAction<Pozo[]>) => {
      state.pozos = action.payload
    },
    clearPozos: (state) => {
      state.pozos = []
      // Eliminar de AsyncStorage
      AsyncStorage.removeItem(POZOS_STORAGE_KEY).catch((error) =>
        console.error("Error removing pozos from storage:", error)
      )
    },
  },
  extraReducers: (builder) => {
    builder
      // loadPozos
      .addCase(loadPozos.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(loadPozos.fulfilled, (state, action) => {
        state.pozos = action.payload.pozos
        state.lastSyncDate = action.payload.lastSyncDate
        state.isLoading = false
      })
      .addCase(loadPozos.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.error.message || "Error al cargar pozos"
      })

      // savePozos
      .addCase(savePozos.fulfilled, (state, action) => {
        state.pozos = action.payload
      })

      // syncPozos
      .addCase(syncPozos.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(syncPozos.fulfilled, (state, action) => {
        state.pozos = action.payload.pozos
        state.lastSyncDate = action.payload.syncDate
        state.isLoading = false
      })
      .addCase(syncPozos.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.error.message || "Error al sincronizar pozos"
      })

      // addPozo
      .addCase(addPozo.fulfilled, (state, action) => {
        state.pozos = action.payload
      })
  },
})

export const { setPozos, clearPozos } = pozosSlice.actions
export default pozosSlice.reducer

// Selectores para obtener datos específicos
export const selectAllPozos = (state: { pozos: PozosState }) => state.pozos.pozos
export const selectPozoById = (id: string) => (state: { pozos: PozosState }) => 
  state.pozos.pozos.find(pozo => pozo.id === id)
export const selectPozosByBateria = (bateria: string) => (state: { pozos: PozosState }) => 
  state.pozos.pozos.filter(pozo => pozo.bateria === bateria)
export const selectPozosByPredio = (predio: string) => (state: { pozos: PozosState }) => 
  state.pozos.pozos.filter(pozo => pozo.predio === predio)
export const selectLastSyncDate = (state: { pozos: PozosState }) => state.pozos.lastSyncDate
export const selectIsLoadingPozos = (state: { pozos: PozosState }) => state.pozos.isLoading
