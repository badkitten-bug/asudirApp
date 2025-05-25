import { createSlice, type PayloadAction } from "@reduxjs/toolkit"

interface SnackbarState {
  visible: boolean
  message: string
  type: "info" | "success" | "error" | "warning"
  duration: number
}

const initialState: SnackbarState = {
  visible: false,
  message: "",
  type: "info",
  duration: 3000, // 3 segundos por defecto
}

const snackbarSlice = createSlice({
  name: "snackbar",
  initialState,
  reducers: {
    showSnackbar: (state, action: PayloadAction<Omit<SnackbarState, "visible">>) => {
      state.visible = true
      state.message = action.payload.message
      state.type = action.payload.type
      state.duration = action.payload.duration || 3000
    },
    hideSnackbar: (state) => {
      state.visible = false
    },
  },
})

export const { showSnackbar, hideSnackbar } = snackbarSlice.actions
export default snackbarSlice.reducer

