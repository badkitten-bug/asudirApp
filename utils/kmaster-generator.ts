// utils/kmaster-generator.ts - Generador de KMaster (integrado desde otp-test)

import { randomBigInt, gcd, nextPrime } from "./bigint-helpers";

export interface KMasterResult {
	kMaster: string;
	kBase: string;
	p: string;
}

/**
 * Genera un KMaster a partir de una semilla
 * IMPORTANTE: El KMaster se genera LOCALMENTE y NUNCA sale del dispositivo
 *
 * @param semilla - Semilla hexadecimal del QR escaneado
 * @param bytesTask - Número de bytes para generar el rango (por defecto 64)
 * @returns Objeto con kMaster, kBase y p como strings
 */
export function generateKMasterFromSeed(
	semilla: string,
	bytesTask: number = 16,
): KMasterResult {
	// Limitar el tamaño para evitar problemas de rendimiento en móvil
	if (bytesTask > 32) {
		console.warn("⚠️  Tamaño reducido a 32 bits por rendimiento en móvil");
		bytesTask = 32;
	}

	console.log(
		`🔑 Generando KMaster desde semilla: ${semilla.substring(0, 16)}...`,
	);

	// Validar que la semilla sea un string hexadecimal válido
	if (!semilla || typeof semilla !== 'string') {
		throw new Error('Semilla debe ser un string válido');
	}
	
	// Limpiar la semilla (remover espacios, convertir a minúsculas)
	const cleanSeed = semilla.replace(/\s/g, '').toLowerCase();
	
	// Validar que sea hexadecimal
	if (!/^[0-9a-f]+$/i.test(cleanSeed)) {
		throw new Error('Semilla debe ser un string hexadecimal válido');
	}

	// Usar la semilla como base para generar números determinísticos pero seguros
	const seedBigInt = BigInt("0x" + cleanSeed);
	console.log("🔢 Semilla convertida a BigInt:", seedBigInt.toString().substring(0, 20) + "...");

	// Calcular el rango: min = 2^(bytesTask-1), max = 2^bytesTask - 1
	const min = 2n ** BigInt(bytesTask - 1);
	const max = 2n ** BigInt(bytesTask) - 1n;
	console.log("📊 Rango calculado:", { min: min.toString().substring(0, 10) + "...", max: max.toString().substring(0, 10) + "..." });

	// Generar un número primo basado en la semilla pero con algo de aleatoriedad
	const seedBasedRandom = (seedBigInt % (max - min)) + min;
	console.log("🎲 Número base generado:", seedBasedRandom.toString().substring(0, 20) + "...");
	
	console.log("🔍 Buscando número primo...");
	const p = nextPrime(seedBasedRandom);
	console.log("✅ Número primo encontrado:", p.toString().substring(0, 20) + "...");

	// Generar k_base que sea coprimo con p, también basado en la semilla
	let kBase: bigint;
	let attempts = 0;
	console.log("🔍 Buscando kBase coprimo...");
	do {
		const offset = BigInt(attempts + 1);
		kBase = ((seedBigInt + offset) % (p - 2n)) + 2n; // entre 2 y p-2
		attempts++;
		if (attempts % 100 === 0) {
			console.log(`🔄 Intento ${attempts} de búsqueda de kBase...`);
		}
	} while (gcd(kBase, p) !== 1n && attempts < 1000); // Límite de seguridad

	if (attempts >= 1000) {
		throw new Error(
			"No se pudo generar kBase coprimo después de 1000 intentos",
		);
	}
	console.log(`✅ kBase encontrado después de ${attempts} intentos:`, kBase.toString().substring(0, 20) + "...");

	// Crear el KMaster en formato "k_base.p"
	const kMaster = `${kBase.toString()}.${p.toString()}`;

	console.log(
		`✅ KMaster generado exitosamente (${kMaster.length} caracteres)`,
	);

	return {
		kMaster,
		kBase: kBase.toString(),
		p: p.toString(),
	};
}

/**
 * Genera un KMaster completamente aleatorio (para testing)
 */
export function generateRandomKMaster(bytesTask: number = 64): KMasterResult {
	if (bytesTask > 128) {
		console.warn("⚠️  Tamaño reducido a 128 bits por rendimiento");
		bytesTask = 128;
	}

	const min = 2n ** BigInt(bytesTask - 1);
	const max = 2n ** BigInt(bytesTask) - 1n;

	const randomInRange = randomBigInt(min, max);
	const p = nextPrime(randomInRange);

	let kBase: bigint;
	do {
		kBase = randomBigInt(2n, p - 2n);
	} while (gcd(kBase, p) !== 1n);

	const kMaster = `${kBase.toString()}.${p.toString()}`;

	return {
		kMaster,
		kBase: kBase.toString(),
		p: p.toString(),
	};
}

/**
 * Valida el formato de un KMaster
 */
export function validateKMaster(kMaster: string): boolean {
	const parts = kMaster.split(".");
	if (parts.length !== 2) return false;

	try {
		const kBase = BigInt(parts[0]);
		const p = BigInt(parts[1]);

		return kBase > 0n && p > 0n && kBase < p;
	} catch {
		return false;
	}
}
