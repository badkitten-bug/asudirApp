import { createSlice, type PayloadAction, createAsyncThunk } from "@reduxjs/toolkit"
import AsyncStorage from "@react-native-async-storage/async-storage"

// Definir la estructura de un pozo
export interface Pozo {
  id: string
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
const POZOS_INICIALES: Pozo[] = [
  { id: "1001", nombre: "Pozo 1001", bateria: "Batería#1", predio: "La Esperanza" },
  { id: "1002", nombre: "Pozo 1002", bateria: "Batería#1", predio: "La Esperanza" },
  { id: "1003", nombre: "Pozo 1003", bateria: "Batería#1", predio: "La Esperanza" },
  { id: "2001", nombre: "Pozo 2001", bateria: "Batería#2", predio: "El Mirador" },
  { id: "3001", nombre: "Pozo 3001", bateria: "Batería#3", predio: "Las Cumbres" },
]

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
    
    console.log("No se encontraron pozos en AsyncStorage, usando datos iniciales")
    // Si no hay datos en AsyncStorage, usar los datos iniciales
    await AsyncStorage.setItem(POZOS_STORAGE_KEY, JSON.stringify(POZOS_INICIALES))
    return { pozos: POZOS_INICIALES, lastSyncDate: null }
  } catch (error) {
    console.error("Error loading pozos from storage:", error)
    return { pozos: POZOS_INICIALES, lastSyncDate: null }
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

// Thunk para sincronizar pozos con el servidor (simulado)
export const syncPozos = createAsyncThunk("pozos/syncPozos", async (_, { getState }) => {
  try {
    // Aquí iría la lógica para sincronizar con el servidor
    // Por ahora, simulamos una sincronización exitosa
    
    // Simulamos una demora de red
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    // Obtenemos los pozos actuales
    const state = getState() as { pozos: PozosState }
    const currentPozos = state.pozos.pozos
    
    // Simulamos que el servidor nos devuelve los mismos pozos más algunos nuevos
    const newPozos: Pozo[] = [
      ...currentPozos,
      // Estos solo se añadirán si no existen ya (ver la lógica en el reducer)
      { id: "4001", nombre: "Pozo 4001", bateria: "Batería#4", predio: "Valle Verde" },
      { id: "4002", nombre: "Pozo 4002", bateria: "Batería#4", predio: "Valle Verde" },
      { id: "5001", nombre: "Pozo 5001", bateria: "Batería#5", predio: "Los Altos" },
    ]
    
    // Eliminamos duplicados basados en el ID
    const uniquePozos = Array.from(new Map(newPozos.map(pozo => [pozo.id, pozo])).values())
    
    // Guardamos la fecha de sincronización
    const syncDate = new Date().toISOString()
    await AsyncStorage.setItem(POZOS_SYNC_DATE_KEY, syncDate)
    
    // Guardamos los pozos actualizados
    await AsyncStorage.setItem(POZOS_STORAGE_KEY, JSON.stringify(uniquePozos))
    
    return { pozos: uniquePozos, syncDate }
  } catch (error) {
    console.error("Error syncing pozos with server:", error)
    throw error
  }
})

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
