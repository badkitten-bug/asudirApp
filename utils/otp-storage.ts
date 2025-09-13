// utils/otp-storage.ts - Almacenamiento de códigos OTP/KUSER generados

import AsyncStorage from '@react-native-async-storage/async-storage';

export interface StoredOTPCode {
	id: string;
	name: string;
	type: 'otp' | 'kuser';
	code: string;
	label: string;
	processId: string;
	apiKey: string;
	semilla: string; // Agregar semilla para regeneración
	timer: number; // Agregar timer para regeneración
	createdAt: Date;
	expiresAt: Date;
	timeLeft: number;
	isActive: boolean;
}

const STORAGE_KEY = 'generated_otp_codes';

/**
 * Guarda un código OTP/KUSER generado
 */
export async function saveOTPCode(codeData: {
	name: string;
	type: 'otp' | 'kuser';
	code: string;
	label: string;
	processId: string;
	apiKey: string;
	semilla: string; // Agregar semilla
	timer: number; // Agregar timer
	expiresAt: Date;
	timeLeft: number;
}): Promise<StoredOTPCode> {
	try {
		// Obtener códigos existentes
		const existingCodes = await getStoredOTPCodes();
		
		// Crear nuevo código
		const newCode: StoredOTPCode = {
			id: `${codeData.type}_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
			name: codeData.name,
			type: codeData.type,
			code: codeData.code,
			label: codeData.label,
			processId: codeData.processId,
			apiKey: codeData.apiKey,
			semilla: codeData.semilla, // Guardar semilla
			timer: codeData.timer, // Guardar timer
			createdAt: new Date(),
			expiresAt: new Date(codeData.expiresAt), // Asegurar que es un objeto Date
			timeLeft: codeData.timeLeft,
			isActive: true,
		};
		
		// Agregar a la lista
		const updatedCodes = [...existingCodes, newCode];
		
		// Guardar en AsyncStorage
		await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedCodes));
		
		console.log(`✅ Código ${codeData.type.toUpperCase()} guardado:`, newCode.id);
		
		return newCode;
	} catch (error) {
		console.error('❌ Error guardando código OTP:', error);
		throw new Error(`Error guardando código: ${error}`);
	}
}

/**
 * Obtiene todos los códigos OTP/KUSER almacenados
 */
export async function getStoredOTPCodes(): Promise<StoredOTPCode[]> {
	try {
		const stored = await AsyncStorage.getItem(STORAGE_KEY);
		if (!stored) return [];
		
		const codes = JSON.parse(stored);
		
		// Actualizar tiempo restante para cada código
		const now = new Date();
		return codes.map((code: StoredOTPCode & { createdAt: string; expiresAt: string }) => ({
			...code,
			createdAt: new Date(code.createdAt),
			expiresAt: new Date(code.expiresAt), // Asegurar que es un objeto Date
			timeLeft: Math.max(0, Math.floor((new Date(code.expiresAt).getTime() - now.getTime()) / 1000)),
			isActive: new Date(code.expiresAt) > now,
		}));
	} catch (error) {
		console.error('❌ Error obteniendo códigos OTP:', error);
		return [];
	}
}

/**
 * Regenera un código OTP/KUSER usando su semilla guardada
 */
export async function regenerateOTPCode(codeId: string): Promise<StoredOTPCode | null> {
	try {
		const codes = await getStoredOTPCodes();
		const codeIndex = codes.findIndex(code => code.id === codeId);
		
		if (codeIndex === -1) {
			console.error('❌ Código no encontrado para regeneración:', codeId);
			return null;
		}
		
		const oldCode = codes[codeIndex];
		
		// Importar funciones de generación
		const { generateOTP, generateKUserOTP } = require('./otp-crypto');
		
		// Regenerar código usando la semilla guardada
		let newResult: { otp: string; expiresAt: Date; timeLeft: number };
		if (oldCode.type === 'otp') {
			newResult = generateOTP(oldCode.semilla, { duration: oldCode.timer });
		} else {
			newResult = generateKUserOTP(oldCode.semilla, { duration: oldCode.timer });
		}
		
		// Actualizar el código existente
		const updatedCode: StoredOTPCode = {
			...oldCode,
			code: newResult.otp,
			expiresAt: newResult.expiresAt,
			timeLeft: newResult.timeLeft,
			isActive: true,
		};
		
		// Actualizar en la lista
		codes[codeIndex] = updatedCode;
		
		// Guardar en AsyncStorage
		await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(codes));
		
		console.log(`🔄 Código ${oldCode.type.toUpperCase()} regenerado:`, updatedCode.id);
		
		return updatedCode;
	} catch (error) {
		console.error('❌ Error regenerando código OTP:', error);
		throw new Error(`Error regenerando código: ${error}`);
	}
}

/**
 * Elimina un código OTP/KUSER por ID
 */
export async function deleteOTPCode(id: string): Promise<void> {
	try {
		const codes = await getStoredOTPCodes();
		const filteredCodes = codes.filter(code => code.id !== id);
		
		await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(filteredCodes));
		
		console.log(`✅ Código eliminado:`, id);
	} catch (error) {
		console.error('❌ Error eliminando código OTP:', error);
		throw new Error(`Error eliminando código: ${error}`);
	}
}

/**
 * Actualiza el estado de un código (activar/desactivar)
 */
export async function updateOTPCodeStatus(id: string, isActive: boolean): Promise<void> {
	try {
		const codes = await getStoredOTPCodes();
		const updatedCodes = codes.map(code => 
			code.id === id ? { ...code, isActive } : code
		);
		
		await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedCodes));
		
		console.log(`✅ Estado del código ${id} actualizado:`, isActive ? 'Activo' : 'Inactivo');
	} catch (error) {
		console.error('❌ Error actualizando estado del código:', error);
		throw new Error(`Error actualizando estado: ${error}`);
	}
}

/**
 * Limpia códigos expirados
 */
export async function cleanupExpiredCodes(): Promise<void> {
	try {
		const codes = await getStoredOTPCodes();
		const activeCodes = codes.filter(code => code.isActive);
		
		if (activeCodes.length !== codes.length) {
			await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(activeCodes));
			console.log(`🧹 Códigos expirados eliminados: ${codes.length - activeCodes.length}`);
		}
	} catch (error) {
		console.error('❌ Error limpiando códigos expirados:', error);
	}
}
