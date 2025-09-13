// utils/cipher.ts - Funciones de encriptación/desencriptación (integradas desde otp-test)

export interface CipherResult {
	cipherText: string;
	p: string;
}

/**
 * Convierte texto ASCII a decimal usando BigInt
 */
function asciiToDecimal(ascii: string): bigint {
	let decimal = 0n;

	for (const char of ascii) {
		decimal = decimal * 256n; // Multiplica por 256 (1 byte)
		decimal = decimal + BigInt(char.charCodeAt(0)); // Suma el valor ASCII del carácter
	}

	return decimal;
}

/**
 * Convierte decimal a texto ASCII
 */
function decimalToAscii(decimal: bigint): string {
	if (decimal === 0n) return "";

	let result = "";
	let num = decimal;

	while (num > 0n) {
		const charCode = Number(num % 256n);
		result = String.fromCharCode(charCode) + result;
		num = num / 256n; // División entera en BigInt
	}

	return result;
}

/**
 * Cifra un mensaje usando KMaster
 * FLUJO: Mensaje → KMaster → Texto Cifrado
 *
 * @param messageTask - Mensaje a cifrar
 * @param kMasterTask - Clave maestra en formato "K_base.p"
 * @returns Objeto con el texto cifrado y p
 */
export function cipherMessage(
	messageTask: string,
	kMasterTask: string,
): CipherResult {
	console.log(`🔒 Cifrando mensaje: "${messageTask}" con KMaster`);

	// Convertir mensaje ASCII a decimal
	const M = asciiToDecimal(messageTask);

	// Parsear la clave maestra
	const arrayData = kMasterTask.split(".");
	if (arrayData.length < 2) {
		throw new Error(
			"Formato inválido de kMasterTask: se esperaban dos números separados por '.'",
		);
	}

	const K_base = BigInt(arrayData[0]!);
	const p = BigInt(arrayData[1]!);

	// Verificar que M < p
	if (p - M < 0n) {
		throw new Error(
			`El mensaje es demasiado largo para esta clave. M (${M}) debe ser menor que p (${p})`,
		);
	}

	// Cifrar: C = (M * K_base) mod p
	const C = (M * K_base) % p;

	// Retornar en formato "C.p"
	const cipherText = `${C.toString()}.${p.toString()}`;

	console.log(`✅ Mensaje cifrado exitosamente`);

	return {
		cipherText,
		p: p.toString(),
	};
}

/**
 * Descifra un mensaje usando KUser (para aprobaciones)
 * FLUJO: Texto Cifrado → KUser → Mensaje Original
 *
 * @param cipherText - Texto cifrado en formato "C.p"
 * @param kUserData - Clave de usuario en formato "K_user_inv.R"
 * @returns Mensaje descifrado
 */
export function decipherMessage(cipherText: string, kUserData: string): string {
	console.log(`🔓 Descifrando mensaje con KUser...`);

	const [cStr, pStr] = cipherText.split(".");
	if (!cStr || !pStr) {
		throw new Error("Formato inválido de cipherText");
	}

	const [kUserInvStr, rStr] = kUserData.split(".");
	if (!kUserInvStr || !rStr) {
		throw new Error(
			"Formato inválido de kUserData: se esperaba 'K_user_inv.R'",
		);
	}

	const C = BigInt(cStr);
	const p = BigInt(pStr);
	const K_user_inv = BigInt(kUserInvStr);
	const R = BigInt(rStr);

	// Análisis matemático:
	// C = (M * K_base) % p
	// K_user = (K_base * R) % p
	// K_user_inv = inverso(K_user, p)
	// Por lo tanto: C * K_user_inv = M * K_base * (1/(K_base * R)) = M / R
	// Para obtener M: M = (C * K_user_inv * R) % p
	const M = (C * K_user_inv * R) % p;

	// Convertir de decimal a ASCII
	const decryptedMessage = decimalToAscii(M);

	console.log(`✅ Mensaje descifrado: "${decryptedMessage}"`);

	return decryptedMessage;
}

/**
 * Función de demostración para el flujo completo KUSER
 * Simula el proceso de aprobación con encriptación/desencriptación
 */
export function demonstrateKUserApproval(
	semilla: string,
	messageToApprove: string,
): {
	kMaster: string;
	kUser: string;
	encryptedMessage: string;
	decryptedMessage: string;
	approved: boolean;
} {
	console.log("🎯 === DEMOSTRACIÓN FLUJO KUSER APROBACIÓN ===");

	try {
		// Este sería el flujo real de aprobación usando KUSER
		// En la práctica, el mensaje cifrado vendría del servicio

		// 1. Generar KMaster desde semilla (como ya tenemos implementado)
		// 2. Generar KUser desde KMaster (como ya tenemos implementado)
		// 3. Usar KUser para descifrar mensaje de aprobación
		// 4. Mostrar mensaje al usuario para aprobación
		// 5. Si aprueba, usar KUser para firmar/aprobar

		console.log(`📋 Mensaje a aprobar: "${messageToApprove}"`);
		console.log(`🔑 Usando semilla: ${semilla.substring(0, 16)}...`);

		// Por ahora, simular el resultado
		return {
			kMaster: "simulado.kmaster",
			kUser: "simulado.kuser",
			encryptedMessage: "mensaje.cifrado",
			decryptedMessage: messageToApprove,
			approved: true,
		};
	} catch (error) {
		console.error("❌ Error en flujo KUSER:", error);
		throw error;
	}
}
