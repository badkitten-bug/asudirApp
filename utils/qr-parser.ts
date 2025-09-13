// utils/qr-parser.ts - Parser para datos de QR codes

export interface OTPQRData {
	type: "otp";
	semilla: string;
	timer: number;
	name: string;
	label: string;
	processId: string;
	apiKey: string;
	hasEmail: boolean;
	hasDNI: boolean;
}

export interface KUserQRData {
	type: "kuser";
	semilla: string;
	timer: number;
	name: string;
	bytes: number;
	label: string;
	processId: string;
	apiKey: string;
	hasEmail: boolean;
	hasDNI: boolean;
}

export type QRData = OTPQRData | KUserQRData;

/**
 * Parsea datos de QR code según el formato especificado
 *
 * Formatos soportados:
 * - otp:{semilla}:{timer}:{name}:{label}:{processId}:{API_KEY}:{1|0 if email}:{1|0 if DNI}
 * - kuser:{semilla}:{timer}:{name}:{bytes}:{label}:{processId}:{API_KEY}:{1|0 if email}:{1|0 if DNI}
 */
export function parseQRData(qrString: string): QRData | null {
	try {
		const parts = qrString.split(":");

		if (parts.length < 8) {
			console.error("QR data format invalid: insufficient parts");
			return null;
		}

		const type = parts[0]?.toLowerCase();

		if (type === "otp") {
			return parseOTPQR(parts);
		} else if (type === "kuser") {
			return parseKUserQR(parts);
		} else {
			console.error("QR type not supported:", type);
			return null;
		}
	} catch (error) {
		console.error("Error parsing QR data:", error);
		return null;
	}
}

function parseOTPQR(parts: string[]): OTPQRData | null {
	try {
		// El último campo (parts[7]) contiene flags combinados: "11" = email y DNI habilitados
		const flags = parts[7] || "00";
		const hasEmail = flags.charAt(0) === "1";
		const hasDNI = flags.charAt(1) === "1";

		return {
			type: "otp",
			semilla: parts[1] || "",
			timer: parseInt(parts[2] || "30", 10),
			name: parts[3] || "",
			label: parts[4] || "",
			processId: parts[5] || "",
			apiKey: parts[6] || "",
			hasEmail,
			hasDNI,
		};
	} catch (error) {
		console.error("Error parsing OTP QR:", error);
		return null;
	}
}

function parseKUserQR(parts: string[]): KUserQRData | null {
	try {
		// El último campo (parts[8]) contiene flags combinados: "11" = email y DNI habilitados
		const flags = parts[8] || "00";
		const hasEmail = flags.charAt(0) === "1";
		const hasDNI = flags.charAt(1) === "1";

		return {
			type: "kuser",
			semilla: parts[1] || "",
			timer: parseInt(parts[2] || "30", 10),
			name: parts[3] || "",
			bytes: parseInt(parts[4] || "512", 10),
			label: parts[5] || "",
			processId: parts[6] || "",
			apiKey: parts[7] || "",
			hasEmail,
			hasDNI,
		};
	} catch (error) {
		console.error("Error parsing KUser QR:", error);
		return null;
	}
}

/**
 * Valida si los datos del QR son válidos
 */
export function validateQRData(data: QRData): boolean {
	if (!data.semilla || !data.name || !data.processId || !data.apiKey) {
		return false;
	}

	if (data.timer <= 0 || data.timer > 300) {
		// Timer entre 1 y 300 segundos
		return false;
	}

	if (data.type === "kuser" && (data.bytes <= 0 || data.bytes > 2048)) {
		return false;
	}

	return true;
}

/**
 * Convierte QRData a un formato legible para mostrar al usuario
 */
export function formatQRDataForDisplay(data: QRData): string {
	const baseInfo = `Tipo: ${data.type.toUpperCase()}\nNombre: ${data.name}\nLabel: ${data.label}\nTimer: ${data.timer}s`;

	if (data.type === "kuser") {
		return `${baseInfo}\nBytes: ${data.bytes}`;
	}

	return baseInfo;
}
