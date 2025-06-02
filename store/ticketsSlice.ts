import { createSlice, type PayloadAction, createAsyncThunk } from "@reduxjs/toolkit"
import { createSelector } from "@reduxjs/toolkit"
import AsyncStorage from "@react-native-async-storage/async-storage"

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
  photoVolumen?: string
  photoElectrica?: string
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
  try {
    const state = getState() as { tickets: TicketsState }
    // Simulamos que todos los tickets pendientes se sincronizan
    const updatedTickets = state.tickets.tickets.map((ticket) => ({
      ...ticket,
      estado: "sincronizado" as const,
    }))
    await dispatch(saveTickets(updatedTickets))
    return updatedTickets
  } catch (error) {
    console.error("Error syncing tickets:", error)
    throw error
  }
})

const ticketsSlice = createSlice({
  name: "tickets",
  initialState,
  reducers: {
    setTickets: (state, action: PayloadAction<Ticket[]>) => {
      state.tickets = action.payload
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

export const { setTickets, clearTickets } = ticketsSlice.actions
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

