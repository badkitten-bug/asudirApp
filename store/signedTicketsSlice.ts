import { createSlice, type PayloadAction, createAsyncThunk } from "@reduxjs/toolkit"
import AsyncStorage from "@react-native-async-storage/async-storage"

// Definir la estructura de un ticket firmado
export interface SignedTicket {
  id: string
  ticketId: string
  fecha: string
  photoUri: string
  createdAt: string
}

interface SignedTicketsState {
  tickets: SignedTicket[]
  isLoading: boolean
  error: string | null
}

const initialState: SignedTicketsState = {
  tickets: [],
  isLoading: false,
  error: null,
}

// Clave para almacenar los tickets firmados en AsyncStorage
const SIGNED_TICKETS_STORAGE_KEY = "@signed_tickets_data"

// Thunk para cargar los tickets firmados desde AsyncStorage
export const loadSignedTickets = createAsyncThunk("signedTickets/loadSignedTickets", async () => {
  try {
    const ticketsJson = await AsyncStorage.getItem(SIGNED_TICKETS_STORAGE_KEY)
    if (ticketsJson) {
      const tickets = JSON.parse(ticketsJson)
      console.log("Tickets firmados cargados desde AsyncStorage:", tickets.length)
      return tickets
    }
    console.log("No se encontraron tickets firmados en AsyncStorage")
    return []
  } catch (error) {
    console.error("Error loading signed tickets from storage:", error)
    return []
  }
})

// Thunk para guardar los tickets firmados en AsyncStorage
export const saveSignedTickets = createAsyncThunk(
  "signedTickets/saveSignedTickets",
  async (tickets: SignedTicket[]) => {
    try {
      await AsyncStorage.setItem(SIGNED_TICKETS_STORAGE_KEY, JSON.stringify(tickets))
      console.log("Tickets firmados guardados en AsyncStorage:", tickets.length)
      return tickets
    } catch (error) {
      console.error("Error saving signed tickets to storage:", error)
      throw error
    }
  },
)

// Thunk para agregar un nuevo ticket firmado
export const addSignedTicket = createAsyncThunk(
  "signedTickets/addSignedTicket",
  async (ticket: SignedTicket, { getState, dispatch }) => {
    try {
      const state = getState() as { signedTickets: SignedTicketsState }

      // Verificar si ya existe un ticket con el mismo ID
      const existingTicket = state.signedTickets.tickets.find((t) => t.ticketId === ticket.ticketId)

      if (existingTicket) {
        console.log("Ticket firmado ya existe, actualizando:", existingTicket.id)
        // Si existe, actualizamos la foto y la fecha
        const updatedTicket = {
          ...existingTicket,
          photoUri: ticket.photoUri,
          fecha: ticket.fecha,
          createdAt: ticket.createdAt,
        }

        const updatedTickets = state.signedTickets.tickets.map((t) => (t.id === existingTicket.id ? updatedTicket : t))

        await dispatch(saveSignedTickets(updatedTickets))
        return updatedTicket
      }

      // Si no existe, agregarlo
      const updatedTickets = [...state.signedTickets.tickets, ticket]
      await dispatch(saveSignedTickets(updatedTickets))
      return ticket
    } catch (error) {
      console.error("Error adding signed ticket:", error)
      throw error
    }
  },
)

const signedTicketsSlice = createSlice({
  name: "signedTickets",
  initialState,
  reducers: {
    setSignedTickets: (state, action: PayloadAction<SignedTicket[]>) => {
      state.tickets = action.payload
    },
    clearSignedTickets: (state) => {
      state.tickets = []
      // Eliminar de AsyncStorage
      AsyncStorage.removeItem(SIGNED_TICKETS_STORAGE_KEY).catch((error) =>
        console.error("Error removing signed tickets from storage:", error),
      )
    },
  },
  extraReducers: (builder) => {
    builder
      // loadSignedTickets
      .addCase(loadSignedTickets.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(loadSignedTickets.fulfilled, (state, action) => {
        state.tickets = action.payload
        state.isLoading = false
      })
      .addCase(loadSignedTickets.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.error.message || "Error al cargar tickets firmados"
      })

      // saveSignedTickets
      .addCase(saveSignedTickets.fulfilled, (state, action) => {
        state.tickets = action.payload
      })

      // addSignedTicket
      .addCase(addSignedTicket.fulfilled, (state, action) => {
        // Verificar si el ticket ya existe
        const index = state.tickets.findIndex((t) => t.id === action.payload.id)

        if (index !== -1) {
          // Actualizar el ticket existente
          state.tickets[index] = action.payload
        } else {
          // Agregar el nuevo ticket
          state.tickets.push(action.payload)
        }
      })
  },
})

export const { setSignedTickets, clearSignedTickets } = signedTicketsSlice.actions
export default signedTicketsSlice.reducer

// Selectores para obtener datos específicos
export const selectAllSignedTickets = (state: { signedTickets: SignedTicketsState }) => state.signedTickets.tickets

