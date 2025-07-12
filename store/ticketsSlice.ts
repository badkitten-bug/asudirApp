import { createSlice, type PayloadAction, createAsyncThunk } from "@reduxjs/toolkit"
import { createSelector } from "@reduxjs/toolkit"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { crearLecturaPozo, uploadFoto } from "../features/lectura-pozo/lecturaPozoApi"

// Definir la estructura de un ticket
export interface Ticket {
  id: string
  pozoId: string
  pozoNombre: string
  pozoUbicacion: string
  lecturaVolumen: string
  lecturaElectrica: string
  cargaMotor: string
  gastoPozo: string
  observaciones: string
  fecha: string
  hora: string
  estado: "pendiente" | "sincronizado"
  photoVolumenUri?: string // URI local
  photoElectricaUri?: string // URI local
  idRemoto?: string // ID en Strapi
  fotoVolumenSubida?: boolean
  fotoElectricaSubida?: boolean
  token?: string // Token para autenticación
  capturadorId?: string // ID del capturador
}

interface TicketsState {
  tickets: Ticket[]
  isLoading: boolean
  error: string | null
}

const initialState: TicketsState = {
  tickets: [],
  isLoading: false,
  error: null,
}

// Clave para almacenar los tickets en AsyncStorage
const TICKETS_STORAGE_KEY = "@tickets_data"

// Thunk para cargar los tickets desde AsyncStorage
export const loadTickets = createAsyncThunk("tickets/loadTickets", async () => {
  try {
    const ticketsJson = await AsyncStorage.getItem(TICKETS_STORAGE_KEY)
    if (ticketsJson) {
      const tickets = JSON.parse(ticketsJson)
      console.log("Tickets cargados desde AsyncStorage:", tickets.length)
      return tickets
    }
    console.log("No se encontraron tickets en AsyncStorage")
    return []
  } catch (error) {
    console.error("Error loading tickets from storage:", error)
    return []
  }
})

// Thunk para guardar los tickets en AsyncStorage
export const saveTickets = createAsyncThunk("tickets/saveTickets", async (tickets: Ticket[]) => {
  try {
    await AsyncStorage.setItem(TICKETS_STORAGE_KEY, JSON.stringify(tickets))
    console.log("Tickets guardados en AsyncStorage:", tickets.length)
    return tickets
  } catch (error) {
    console.error("Error saving tickets to storage:", error)
    throw error
  }
})

// Thunk para agregar un nuevo ticket
export const addTicket = createAsyncThunk("tickets/addTicket", async (ticket: Ticket, { getState, dispatch }) => {
  try {
    const state = getState() as { tickets: TicketsState }

    // Verificar si ya existe un ticket con los mismos datos clave
    const existingTicket = state.tickets.tickets.find(
      (t) =>
        t.pozoId === ticket.pozoId &&
        t.lecturaVolumen === ticket.lecturaVolumen &&
        t.lecturaElectrica === ticket.lecturaElectrica &&
        t.fecha === ticket.fecha,
    )

    if (existingTicket) {
      console.log("Ticket ya existe, no se agregará duplicado:", existingTicket.id)
      return existingTicket
    }

    // Si no existe, agregarlo
    const updatedTickets = [...state.tickets.tickets, ticket]
    await dispatch(saveTickets(updatedTickets))
    return ticket
  } catch (error) {
    console.error("Error adding ticket:", error)
    throw error
  }
})

// Thunk para sincronizar tickets (simulado)
export const syncTickets = createAsyncThunk("tickets/syncTickets", async (_, { getState, dispatch }) => {
  // Esta función está comentada temporalmente porque useSyncPendingLecturas maneja la sincronización
  console.log('syncTickets called - using useSyncPendingLecturas instead');
  return [];
  
  /*
  const state = getState() as { tickets: TicketsState }
  const updatedTickets: Ticket[] = []
  for (const ticket of state.tickets.tickets) {
    if (ticket.estado === "sincronizado") {
      updatedTickets.push(ticket)
      continue
    }
    let idRemoto = ticket.idRemoto
    // 1. Subir la lectura si no tiene idRemoto
    if (!idRemoto) {
      try {
        // Verificar que tengamos los datos necesarios
        if (!ticket.token || !ticket.capturadorId) {
          console.log('Ticket sin token o capturadorId, manteniendo como pendiente');
          updatedTickets.push(ticket);
          continue;
        }

        // Aquí debes llamar a tu función crearLecturaPozo y obtener el id remoto
        const lecturaData = await crearLecturaPozo({
          apiUrl: process.env.EXPO_PUBLIC_API_URL,
          token: ticket.token as string,
          data: {
            fecha: ticket.fecha,
            lectura_volumetrica: ticket.lecturaVolumen,
            gasto: ticket.gastoPozo,
            lectura_electrica: ticket.lecturaElectrica,
            observaciones: ticket.observaciones,
            pozo: ticket.pozoId,
            capturador: ticket.capturadorId as string,
            estado: "pendiente"
          }
        })
        idRemoto = lecturaData.data?.id
        if (!idRemoto) throw new Error('No se obtuvo el ID remoto de la lectura')
        ticket.idRemoto = idRemoto
      } catch (err) {
        // Si falla, mantener como pendiente
        updatedTickets.push(ticket)
        continue
      }
    }
    // 2. Subir foto volumétrica si no está subida
    if (ticket.photoVolumenUri && !ticket.fotoVolumenSubida && ticket.token && idRemoto) {
      try {
        await uploadFoto({
          apiUrl: process.env.EXPO_PUBLIC_API_URL,
          token: ticket.token as string,
          uri: ticket.photoVolumenUri,
          field: 'foto_volumetrico',
          lecturaId: idRemoto as string,
          filename: 'foto_volumetrico.jpg'
        })
        ticket.fotoVolumenSubida = true
      } catch (err) {
        updatedTickets.push(ticket)
        continue
      }
    }
    // 3. Subir foto eléctrica si no está subida
    if (ticket.photoElectricaUri && !ticket.fotoElectricaSubida && ticket.token && idRemoto) {
      try {
        await uploadFoto({
          apiUrl: process.env.EXPO_PUBLIC_API_URL,
          token: ticket.token as string,
          uri: ticket.photoElectricaUri,
          field: 'foto_electrico',
          lecturaId: idRemoto as string,
          filename: 'foto_electrico.jpg'
        })
        ticket.fotoElectricaSubida = true
      } catch (err) {
        updatedTickets.push(ticket)
        continue
      }
    }
    // 4. Validar con un GET que las fotos estén asociadas
    if (ticket.token && idRemoto) {
      try {
        const url = `${process.env.EXPO_PUBLIC_API_URL}/lectura-pozos/${idRemoto}?populate=*`
        const res = await fetch(url, {
          headers: { 'Authorization': `Bearer ${ticket.token}` }
        })
        const data = await res.json()
        const tieneFotoVol = !!data?.data?.attributes?.foto_volumetrico?.data?.id
        const tieneFotoElec = !!data?.data?.attributes?.foto_electrico?.data?.id
        if (tieneFotoVol && tieneFotoElec) {
          ticket.estado = "sincronizado"
        } else {
          updatedTickets.push(ticket)
          continue
        }
      } catch (err) {
        updatedTickets.push(ticket)
        continue
      }
    }
    updatedTickets.push(ticket)
  }
  await dispatch(saveTickets(updatedTickets))
  return updatedTickets
  */
})

const ticketsSlice = createSlice({
  name: "tickets",
  initialState,
  reducers: {
    setTickets: (state, action: PayloadAction<Ticket[]>) => {
      state.tickets = action.payload
    },
    removeTicket: (state, action: PayloadAction<string>) => {
      state.tickets = state.tickets.filter(ticket => ticket.id !== action.payload)
    },
    clearTickets: (state) => {
      state.tickets = []
      // Eliminar de AsyncStorage
      AsyncStorage.removeItem(TICKETS_STORAGE_KEY).catch((error) =>
        console.error("Error removing tickets from storage:", error),
      )
    },
  },
  extraReducers: (builder) => {
    builder
      // loadTickets
      .addCase(loadTickets.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(loadTickets.fulfilled, (state, action) => {
        state.tickets = action.payload
        state.isLoading = false
      })
      .addCase(loadTickets.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.error.message || "Error al cargar tickets"
      })

      // saveTickets
      .addCase(saveTickets.fulfilled, (state, action) => {
        state.tickets = action.payload
      })

      // addTicket
      .addCase(addTicket.fulfilled, (state, action) => {
        // Solo agregar el ticket si no existe ya en el estado
        const exists = state.tickets.some((t) => t.id === action.payload.id)
        if (!exists) {
          state.tickets.push(action.payload)
        }
      })

      // syncTickets
      .addCase(syncTickets.fulfilled, (state, action) => {
        state.tickets = action.payload
      })
  },
})

export const { setTickets, removeTicket, clearTickets } = ticketsSlice.actions
export default ticketsSlice.reducer

// Selectores base
const selectTicketsState = (state: { tickets: TicketsState }) => state.tickets

// Selector memoizado para todos los tickets
export const selectAllTickets = createSelector(
  selectTicketsState,
  (ticketsState) => ticketsState.tickets
)

// Selector memoizado para tickets pendientes
export const selectPendingTickets = createSelector(
  selectAllTickets,
  (tickets) => tickets.filter((ticket) => ticket.estado === "pendiente")
)

// Selector memoizado para tickets sincronizados
export const selectSyncedTickets = createSelector(
  selectAllTickets,
  (tickets) => tickets.filter((ticket) => ticket.estado === "sincronizado")
)

// Selector memoizado para tickets de hoy
export const selectTodayTickets = createSelector(
  selectAllTickets,
  (tickets) => {
    const today = new Date().toISOString().split("T")[0]
    return tickets.filter((ticket) => ticket.fecha === today)
  }
)

