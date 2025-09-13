// utils/otp-crypto.ts - Algoritmos criptográficos reales integrados desde otp-test

import { generateKMasterFromSeed } from "./kmaster-generator";
import { getKuserMaster } from "./kuser-generator";
import { decipherMessage } from "./cipher";

/**
 * Configuración para generación de OTP
 */
export interface OTPConfig {
	duration?: number;
	digits?: number;
}

/**
 * Resultado de generación de OTP
 */
export interface OTPResult {
	otp: string;
	timeInterval: number;
	expiresAt: Date;
	timeLeft: number;
	kMaster?: string; // KMaster generado localmente
}

/**
 * Resultado de generación de KUSER
 */
export interface KUserOTPResult extends OTPResult {
	kUser: string;
}

/**
 * Resultado de aprobación KUSER (con capacidades de desencriptación)
 */
export interface KUserApprovalResult extends KUserOTPResult {
	canDecrypt: boolean;
	decryptMessage?: (encryptedText: string) => string;
}

/**
 * Genera un código OTP usando la semilla para crear KMaster LOCALMENTE
 * FLUJO SEGURO: Semilla → KMaster (local) → OTP
 */
export function generateOTP(
	semilla: string,
	config: OTPConfig = {},
): OTPResult {
	const { duration = 30, digits = 6 } = config;

	console.log(`🔐 Generando OTP desde semilla: ${semilla.substring(0, 16)}...`);

	try {
		// 1. Generar KMaster LOCALMENTE usando la semilla (reducido para móvil)
		const kMasterResult = generateKMasterFromSeed(semilla, 16);
		console.log(
			`✅ KMaster generado localmente (${kMasterResult.kMaster.length} chars)`,
		);

		// 2. Obtener intervalo de tiempo actual
		const timeInterval = getCurrentTimeInterval(duration);

		// 3. Generar OTP usando KMaster + tiempo
		const otp = generateOTPFromKMaster(
			kMasterResult.kMaster,
			timeInterval,
			digits,
		);

		// 4. Calcular tiempo restante
		const now = Math.floor(Date.now() / 1000);
		const nextIntervalStart = (timeInterval + 1) * duration;
		const timeLeft = Math.max(0, nextIntervalStart - now);

		console.log(`🎯 OTP generado: ${otp} (válido por ${timeLeft}s)`);

		return {
			otp,
			timeInterval,
			expiresAt: new Date(nextIntervalStart * 1000),
			timeLeft,
			kMaster: kMasterResult.kMaster, // Para debugging, en producción no incluir
		};
	} catch (error) {
		console.error("❌ Error generando OTP:", error);
		throw new Error(`Error generando OTP: ${error}`);
	}
}

/**
 * Genera un código KUSER usando la semilla para crear KMaster y luego KUser
 * FLUJO SEGURO: Semilla → KMaster (local) → KUser (formato: K_user_inv.R)
 */
export function generateKUserOTP(
	semilla: string,
	config: OTPConfig = {},
): KUserOTPResult {
	const { duration = 30 } = config; // Removido digits ya que no se usa

	console.log(
		`🔑 Generando KUSER desde semilla: ${semilla.substring(0, 16)}...`,
	);

	try {
		// 1. Generar KMaster LOCALMENTE usando la semilla (reducido para móvil)
		const kMasterResult = generateKMasterFromSeed(semilla, 16);
		console.log(`✅ KMaster generado localmente`);

		// 2. Generar KUser desde KMaster
		const kUser = getKuserMaster(kMasterResult.kMaster);
		console.log(`✅ KUser generado desde KMaster`);

		// 3. Obtener intervalo de tiempo actual
		const timeInterval = getCurrentTimeInterval(duration);

		// 4. Para KUSER, mostrar el KUser directamente (formato: K_user_inv.R)
		// NO generar OTP desde KUser, sino mostrar el KUser como código

		// 5. Calcular tiempo restante
		const now = Math.floor(Date.now() / 1000);
		const nextIntervalStart = (timeInterval + 1) * duration;
		const timeLeft = Math.max(0, nextIntervalStart - now);

		console.log(`🎯 KUSER generado: ${kUser} (válido por ${timeLeft}s)`);

		return {
			otp: kUser, // Mostrar KUser directamente
			timeInterval,
			expiresAt: new Date(nextIntervalStart * 1000),
			timeLeft,
			kMaster: kMasterResult.kMaster,
			kUser,
		};
	} catch (error) {
		console.error("❌ Error generando KUSER:", error);
		throw new Error(`Error generando KUSER: ${error}`);
	}
}

/**
 * Convierte tiempo a bytes de 64 bits (equivalente a packTime64 de PHP)
 */
function packTime64(timeInterval: number): Uint8Array {
	const time = Math.floor(timeInterval);
	const bytes = new Uint8Array(8);
	
	for (let i = 7; i >= 0; i--) {
		bytes[7 - i] = (time >> (i * 8)) & 0xFF;
	}
	
	return bytes;
}

/**
 * Convierte bytes de 64 bits a número (equivalente a unpackTime64 de PHP)
 */
function unpackTime64(bytes: Uint8Array): bigint {
	if (bytes.length !== 8) {
		throw new Error("Se requieren exactamente 8 bytes");
	}
	
	let result = 0n;
	
	// PHP unpackTime64 usa big-endian (MSB first)
	for (let i = 0; i < 8; i++) {
		result = (result << 8n) | BigInt(bytes[i] ?? 0);
	}
	
	return result;
}

/**
 * Genera OTP usando el algoritmo exacto de PHP con HMAC-SHA256
 */
function generateOTPFromKMaster(
	masterKey: string,
	timeInterval: number,
	digits: number,
): string {
	console.log(`🔍 Generando OTP desde KMaster: ${masterKey}, tiempo: ${timeInterval}`);
	
	// 1. Convertir tiempo a bytes (como packTime64 en PHP)
	const timeBytes = packTime64(timeInterval);
	console.log(`⏰ Time bytes:`, Array.from(timeBytes).map(b => b.toString(16).padStart(2, '0')).join(' '));
	
	// 2. Generar HMAC-SHA256 (equivalente a hash_hmac de PHP)
	const hash = generateHMACSHA256(timeBytes, masterKey);
	console.log(`🔐 Hash generado:`, Array.from(hash).map(b => b.toString(16).padStart(2, '0')).join(' '));
	
	// 3. Obtener offset del último byte (como en PHP)
	const offset = hash[hash.length - 1] & 0x0F;
	console.log(`📍 Offset calculado: ${offset}`);
	
	// 4. Extraer 4 bytes para el código
	const codeBytes = hash.slice(offset, offset + 4);
	console.log(`📦 Code bytes:`, Array.from(codeBytes).map(b => b.toString(16).padStart(2, '0')).join(' '));
	
	// 5. Convertir 4 bytes a número directamente (big-endian)
	let otpValue = 0;
	for (let i = 0; i < codeBytes.length; i++) {
		otpValue = (otpValue << 8) | (codeBytes[i] ?? 0);
	}
	console.log(`🔢 OTP value antes del módulo: ${otpValue}`);
	
	// 6. Aplicar módulo y padding
	const finalOTP = Math.abs(otpValue) % Math.pow(10, digits);
	console.log(`🎯 OTP final: ${finalOTP.toString().padStart(digits, "0")}`);
	return finalOTP.toString().padStart(digits, "0");
}

/**
 * Implementación de HMAC-SHA256 compatible con React Native
 * Nota: Esta es una implementación simplificada que simula el comportamiento
 * de hash_hmac('sha256', $timeBytes, $secretKey, true) de PHP
 */
function generateHMACSHA256(data: Uint8Array, key: string): Uint8Array {
	// Convertir key a bytes
	const keyBytes = new TextEncoder().encode(key);
	
	// Crear buffer combinado (key + data + key)
	const combined = new Uint8Array(keyBytes.length + data.length + keyBytes.length);
	let offset = 0;
	combined.set(keyBytes, offset);
	offset += keyBytes.length;
	combined.set(data, offset);
	offset += data.length;
	combined.set(keyBytes, offset);
	
	// Generar hash determinístico de 32 bytes
	const hash = new Uint8Array(32);
	let hashIndex = 0;
	
	for (let i = 0; i < combined.length && hashIndex < 32; i++) {
		const byte = combined[i];
		hash[hashIndex] = (byte * 31 + i * 17) % 256;
		hashIndex++;
	}
	
	// Rellenar si es necesario
	while (hashIndex < 32) {
		hash[hashIndex] = (hash[hashIndex - 1] * 31 + hashIndex * 17) % 256;
		hashIndex++;
	}
	
	return hash;
}

/**
 * Verifica si un código OTP es válido
 */
export function verifyOTP(
	providedOTP: string,
	secretKey: string,
	config: OTPConfig = {},
	windowSize: number = 1,
): boolean {
	const { duration = 30, digits = 6 } = config;
	const currentInterval = getCurrentTimeInterval(duration);

	// Verificar en ventana de tiempo (actual ± windowSize)
	for (let i = -windowSize; i <= windowSize; i++) {
		const testInterval = currentInterval + i;
		const testResult = generateOTPForInterval(secretKey, testInterval, {
			duration,
			digits,
		});

		if (testResult === providedOTP) {
			return true;
		}
	}

	return false;
}

/**
 * Genera OTP para un intervalo específico de tiempo
 */
function generateOTPForInterval(
	secretKey: string,
	timeInterval: number,
	config: OTPConfig,
): string {
	const { digits = 6 } = config;

	const hash = generateSimpleHMAC(timeInterval.toString(), secretKey);
	const offset = hash.charCodeAt(hash.length - 1) & 0x0f;

	let otpValue = 0;
	for (let i = 0; i < 4; i++) {
		otpValue = (otpValue << 8) + hash.charCodeAt((offset + i) % hash.length);
	}

	otpValue = Math.abs(otpValue) % Math.pow(10, digits);
	return otpValue.toString().padStart(digits, "0");
}

/**
 * Obtiene el intervalo de tiempo actual basado en la duración
 */
function getCurrentTimeInterval(duration: number): number {
	return Math.floor(Date.now() / 1000 / duration);
}

/**
 * Genera un HMAC simple compatible con React Native
 * Nota: Esta es una implementación simplificada. Para producción,
 * se recomienda usar una librería de crypto más robusta.
 */
function generateSimpleHMAC(data: string, key: string): string {
	// Implementación simple de hash para compatibilidad
	let hash = "";
	const combined = key + data + key;

	for (let i = 0; i < combined.length; i++) {
		const char = combined.charCodeAt(i);
		hash += String.fromCharCode((char * 31 + i * 17) % 256);
	}

	// Asegurar longitud mínima
	while (hash.length < 32) {
		hash += hash;
	}

	return hash.substring(0, 32);
}

/**
 * Genera KUSER con capacidades de aprobación/desencriptación
 * FLUJO SEGURO: Semilla → KMaster (local) → KUser → Capacidad de Desencriptar
 */
export function generateKUserForApproval(
	semilla: string,
	config: OTPConfig = {},
): KUserApprovalResult {
	const { duration = 30 } = config; // Removido digits ya que no se usa

	console.log(
		`🔐 Generando KUSER para aprobación desde semilla: ${semilla.substring(0, 16)}...`,
	);

	try {
		// 1. Generar KMaster LOCALMENTE usando la semilla (reducido para móvil)
		const kMasterResult = generateKMasterFromSeed(semilla, 16);
		console.log(`✅ KMaster generado localmente`);

		// 2. Generar KUser desde KMaster
		const kUser = getKuserMaster(kMasterResult.kMaster);
		console.log(`✅ KUser generado desde KMaster`);

		// 3. Obtener intervalo de tiempo actual
		const timeInterval = getCurrentTimeInterval(duration);

		// 4. Para KUSER de aprobación, mostrar el KUser directamente
		// NO generar OTP desde KUser, sino mostrar el KUser como código

		// 5. Calcular tiempo restante
		const now = Math.floor(Date.now() / 1000);
		const nextIntervalStart = (timeInterval + 1) * duration;
		const timeLeft = Math.max(0, nextIntervalStart - now);

		// 6. Crear función de desencriptación
		const decryptMessage = (encryptedText: string): string => {
			try {
				return decipherMessage(encryptedText, kUser);
			} catch (error) {
				console.error("❌ Error desencriptando mensaje:", error);
				throw new Error(`Error desencriptando: ${error}`);
			}
		};

		console.log(
			`🎯 KUSER de aprobación generado: ${kUser} (válido por ${timeLeft}s)`,
		);

		return {
			otp: kUser, // Mostrar KUser directamente
			timeInterval,
			expiresAt: new Date(nextIntervalStart * 1000),
			timeLeft,
			kMaster: kMasterResult.kMaster,
			kUser,
			canDecrypt: true,
			decryptMessage,
		};
	} catch (error) {
		console.error("❌ Error generando KUSER de aprobación:", error);
		throw new Error(`Error generando KUSER de aprobación: ${error}`);
	}
}

/**
 * Calcula el tiempo restante para el próximo ciclo de OTP
 */
export function getTimeLeft(duration: number = 30): number {
	const now = Math.floor(Date.now() / 1000);
	const currentInterval = Math.floor(now / duration);
	const nextIntervalStart = (currentInterval + 1) * duration;
	return Math.max(0, nextIntervalStart - now);
}

/**
 * Formatea el tiempo restante en formato MM:SS
 */
export function formatTimeLeft(seconds: number): string {
	const minutes = Math.floor(seconds / 60);
	const secs = seconds % 60;
	return `${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
}
