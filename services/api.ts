import * as Device from 'expo-device';

const API_BASE_URL = 'https://api.stamping.io/exec/';
const API_KEY = '86e8a39e03fd23ea87a878fcc1a2cc6293899fda6701b26a29c4169d84f';
const SEND_OTP_PROCESS_ID = 'ae8ddee1-f2d9-4ada-ba62-7e37708134a6';

export interface SendOTPParams {
  email: string;
  dni: string;
  imei: string;
}

export interface SendOTPResponse {
  responseEmail: string;
}

export const sendOTP = async (params: SendOTPParams): Promise<SendOTPResponse> => {
  try {
    const response = await fetch(API_BASE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        process: SEND_OTP_PROCESS_ID,
        token: API_KEY,
        scope: 'dev', // Cambiar a 'prd' para producción
        params: [
          {
            name: 'email',
            value: params.email
          },
          {
            name: 'dni',
            value: params.dni
          },
          {
            name: 'imei',
            value: params.imei
          }
        ]
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error sending OTP:', error);
    throw error;
  }
};

// Función para obtener el IMEI del dispositivo
export const getDeviceIMEI = async (): Promise<string> => {
  try {
    // Usar expo-device para obtener información del dispositivo
    const deviceId = Device.osInternalBuildId || Device.modelId || 'unknown-device';
    return deviceId;
  } catch (error) {
    console.error('Error getting device IMEI:', error);
    return 'unknown-device';
  }
};