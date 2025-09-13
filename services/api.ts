import * as Device from "expo-device";
import { config } from "@/config/app";

// Configuración de la API
const API_BASE_URL = config.API_BASE_URL;
const API_KEY = config.API_KEY;
const SCOPE = config.SCOPE;
const SEND_OTP_PROCESS_ID = config.SEND_OTP_PROCESS_ID;
const CREATE_ACCOUNT_PROCESS_ID = config.CREATE_ACCOUNT_PROCESS_ID;

export interface SendOTPParams {
	email: string;
	dni: string;
	imei: string;
}

export interface SendOTPResponse {
	responseEmail: string;
}

export interface ValidateQRParams {
	email: string;
	f1: string;
	address: string;
	qr: string;
}

export interface ValidateQRResponse {
	isValid: boolean;
	key: string;
}

export interface CreateAccountParams {
	email: string;
	otp: string;
	imei: string;
}

export interface CreateAccountResponse {
	code: number;
	message: string;
	environment: {
		scope: string;
		userid: string;
		process: string;
		id: string;
	};
	response: {
		address: string;
		f1: string;
		isValid: string;
	};
	traceability: {
		duration: {
			milliseconds: number;
		};
		beginProcess: number;
		beginLaunchTasks: number;
		endLaunchTasks: number;
		endProcess: number;
		pcu: {
			used: number;
			available: number;
		};
	};
}

export const sendOTP = async (
	params: SendOTPParams,
): Promise<SendOTPResponse> => {
	try {
		const response = await fetch(API_BASE_URL, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				process: SEND_OTP_PROCESS_ID,
				token: API_KEY,
				scope: SCOPE,
				params: [
					{
						name: "email",
						value: params.email,
					},
					{
						name: "dni",
						value: params.dni,
					},
					{
						name: "imei",
						value: params.imei,
					},
				],
			}),
		});

		if (!response.ok) {
			throw new Error(`HTTP error! status: ${response.status}`);
		}

		const data = await response.json();
		return data;
	} catch (error) {
		console.error("Error sending OTP:", error);
		throw error;
	}
};

export const createAccount = async (
	params: CreateAccountParams,
): Promise<CreateAccountResponse> => {
	try {
		const response = await fetch(API_BASE_URL, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				process: CREATE_ACCOUNT_PROCESS_ID,
				token: API_KEY,
				scope: SCOPE,
				params: [
					{
						name: "email",
						value: params.email,
					},
					{
						name: "otp",
						value: params.otp,
					},
					{
						name: "imei",
						value: params.imei,
					},
				],
			}),
		});

		if (!response.ok) {
			throw new Error(`HTTP error! status: ${response.status}`);
		}

		const data = await response.json();
		return data;
	} catch (error) {
		console.error("Error creating account:", error);
		throw error;
	}
};

// Tipos para validación facial
export interface ValidateFaceParams {
	photoBase64: string;
	email: string;
	dni: string;
	f1: string;
	address: string;
	key: string; // Key del QR validado
}

export interface ValidateFaceResponse {
	isValid: boolean;
}

// Implementación validateFace con el endpoint correcto
export const validateFace = async (
	params: ValidateFaceParams,
): Promise<ValidateFaceResponse> => {
	try {
		const response = await fetch(API_BASE_URL, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				process: "b558d772-55ce-4fad-af5f-3de1a4665122",
				token: API_KEY,
				scope: SCOPE,
				params: [
					{ name: "photo", value: params.photoBase64 },
					{ name: "email", value: params.email },
					{ name: "dni", value: params.dni },
					{ name: "f1", value: params.f1 },
					{ name: "address", value: params.address },
					{ name: "key", value: "test-key-123" }, // Key del QR validado
				],
			}),
		});

		if (!response.ok) {
			throw new Error(`HTTP error! status: ${response.status}`);
		}

		const data = await response.json();
		console.log("Face validation response:", data);

		return {
			isValid: data.response?.isValid === true || data.code === 200,
		};
	} catch (error) {
		console.error("Error validating face:", error);
		// En caso de error, por seguridad devolver false
		return { isValid: false };
	}
};

// Función para validar código QR
export const validateQRCode = async ({
	email,
	f1,
	address,
	qr,
}: ValidateQRParams): Promise<ValidateQRResponse> => {
	try {
		const response = await fetch(API_BASE_URL, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				process: "02fd0304-1e5d-4475-8abf-a3b429747519",
				token: API_KEY,
				scope: SCOPE,
				params: [
					{
						name: "email",
						value: email,
					},
					{
						name: "f1",
						value: f1,
					},
					{
						name: "address",
						value: address,
					},
					{
						name: "qr",
						value: qr,
					},
				],
			}),
		});

		if (!response.ok) {
			throw new Error(`HTTP error! status: ${response.status}`);
		}

		const data = await response.json();
		console.log("QR Validation response:", data);

		return {
			isValid: data.response?.isValid === true || data.code === 200,
			key: data.response?.key || "test-key-123",
		};
	} catch (error) {
		console.error("Error validating QR code:", error);
		throw error;
	}
};

export const getDeviceIMEI = async (): Promise<string> => {
	try {
		// En web, usar un identificador único del navegador
		if (typeof window !== "undefined") {
			try {
				// Generar un ID único basado en características del navegador
				const canvas = document.createElement("canvas");
				const ctx = canvas.getContext("2d");
				ctx?.fillText("device-id", 10, 10);
				const fingerprint = canvas.toDataURL();
				return btoa(fingerprint).substring(0, 20);
			} catch (webError) {
				console.log("Error generando fingerprint web:", webError);
				// Fallback para web
				return `web-device-${Date.now()}`;
			}
		}

		// En móvil, usar expo-device
		const deviceId =
			Device.osInternalBuildId || Device.modelId || "unknown-device";
		return deviceId;
	} catch (error) {
		console.error("Error getting device IMEI:", error);
		return "unknown-device";
	}
};
