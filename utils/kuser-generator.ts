// utils/kuser-generator.ts - Generador de KUser (integrado desde otp-test)

import { generateRandomCoprime, modInverse } from "./bigint-helpers";

export interface KUserResult {
	kUserInverse: string;
	r: string;
}

/**
 * Genera una clave de usuario a partir de un KMaster
 *
 * @param kMasterTask - String en formato "K_base.p"
 * @returns String en formato "K_user_inv.R"
 */
export function getKuserMaster(kMasterTask: string): string {
	const arrayData = kMasterTask.split(".");

	if (arrayData.length < 2) {
		throw new Error(
			"Formato inválido de kMasterTask: se esperaban dos números separados por '.'",
		);
	}

	const K_base = BigInt(arrayData[0]!);
	const p = BigInt(arrayData[1]!);

	if (p === 0n) throw new Error("p must be greater than zero");

	const R = generateRandomCoprime(p);
	if (R === 0n) throw new Error("R must be greater than zero");

	// Implementación exacta del algoritmo original
	const K_user = (K_base * R) % p; // Clave para el usuario
	const K_user_inv = modInverse(K_user, p); // Inversa de la clave del usuario

	return `${K_user_inv.toString()}.${R.toString()}`;
}

/**
 * Versión alternativa que retorna un objeto estructurado
 */
export function generateKUser(kMasterTask: string): KUserResult {
	const result = getKuserMaster(kMasterTask);
	const [kUserInverse, r] = result.split(".");

	return {
		kUserInverse: kUserInverse!,
		r: r!,
	};
}
