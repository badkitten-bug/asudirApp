import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface PendingLectura {
  id: string; // UUID local
  data: any; // Datos de la lectura
  fotos: { field: string; file: string | File | Blob }[]; // Fotos asociadas
  createdAt: string;
}

interface PendingLecturasState {
  items: PendingLectura[];
}

const initialState: PendingLecturasState = {
  items: [],
};

const pendingLecturasSlice = createSlice({
  name: 'pendingLecturas',
  initialState,
  reducers: {
    addPendingLectura(state, action: PayloadAction<PendingLectura>) {
      state.items.push(action.payload);
    },
    removePendingLectura(state, action: PayloadAction<string>) {
      state.items = state.items.filter(l => l.id !== action.payload);
    },
    setPendingLecturas(state, action: PayloadAction<PendingLectura[]>) {
      state.items = action.payload;
    },
  },
});

export const { addPendingLectura, removePendingLectura, setPendingLecturas } = pendingLecturasSlice.actions;
export default pendingLecturasSlice.reducer; 