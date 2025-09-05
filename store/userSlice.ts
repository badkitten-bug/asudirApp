import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UserState {
  dni: string;
  email: string;
  imei: string;
  otpSent: boolean;
  otpVerified: boolean;
}

const initialState: UserState = {
  dni: '',
  email: '',
  imei: '',
  otpSent: false,
  otpVerified: false,
};

export const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setPersonalData: (state, action: PayloadAction<{ dni: string; email: string; imei: string }>) => {
      state.dni = action.payload.dni;
      state.email = action.payload.email;
      state.imei = action.payload.imei;
    },
    setOTPSent: (state, action: PayloadAction<boolean>) => {
      state.otpSent = action.payload;
    },
    setOTPVerified: (state, action: PayloadAction<boolean>) => {
      state.otpVerified = action.payload;
    },
    resetUser: () => initialState,
  },
});

export const { setPersonalData, setOTPSent, setOTPVerified, resetUser } = userSlice.actions;
export default userSlice.reducer;
