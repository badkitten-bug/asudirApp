import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UserState {
  dni: string;
  email: string;
  imei: string;
  otpSent: boolean;
  otpVerified: boolean;
  address: string;
  f1: string;
}

const initialState: UserState = {
  dni: '',
  email: '',
  imei: '',
  otpSent: false,
  otpVerified: false,
  address: '',
  f1: '',
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
    setAccountData: (state, action: PayloadAction<{ address: string; f1: string }>) => {
      state.address = action.payload.address;
      state.f1 = action.payload.f1;
    },
    resetUser: () => initialState,
  },
});

export const { setPersonalData, setOTPSent, setOTPVerified, setAccountData, resetUser } = userSlice.actions;
export default userSlice.reducer;
