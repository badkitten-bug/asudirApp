// utils/bigint-helpers.ts - Funciones auxiliares para BigInt (integradas desde otp-test)

/**
 * Calcula el máximo común divisor usando el algoritmo de Euclides
 */
export function gcd(a: bigint, b: bigint): bigint {
	while (b !== 0n) {
		const t = b;
		b = a % b;
		a = t;
	}
	return a;
}

/**
 * Calcula el inverso modular usando el algoritmo extendido de Euclides
 */
export function modInverse(a: bigint, m: bigint): bigint {
	let m0 = m,
		x0 = 0n,
		x1 = 1n;

	if (m === 1n) return 0n;

	while (a > 1n) {
		const q = a / m;
		let t = m;
		m = a % m;
		a = t;
		t = x0;
		x0 = x1 - q * x0;
		x1 = t;
	}

	if (x1 < 0n) x1 += m0;

	return x1;
}

/**
 * Genera un número BigInt aleatorio en un rango específico
 * Compatible con React Native usando crypto.getRandomValues
 */
export function randomBigInt(min: bigint, max: bigint): bigint {
	const range = max - min + 1n;
	const bytes = Math.ceil(range.toString(2).length / 8);
	let rnd: bigint;

	do {
		const buf = new Uint8Array(bytes);

		// Para React Native, usar crypto.getRandomValues si está disponible
		if (typeof crypto !== "undefined" && crypto.getRandomValues) {
			crypto.getRandomValues(buf);
		} else {
			// Fallback para entornos que no tienen crypto
			for (let i = 0; i < bytes; i++) {
				buf[i] = Math.floor(Math.random() * 256);
			}
		}

		rnd = BigInt(
			"0x" +
				Array.from(buf)
					.map((b) => b.toString(16).padStart(2, "0"))
					.join(""),
		);
	} while (rnd >= range);

	return min + rnd;
}

/**
 * Genera un número aleatorio coprimo con p
 */
export function generateRandomCoprime(p: bigint): bigint {
	let r: bigint;
	do {
		r = randomBigInt(2n, p - 1n);
	} while (gcd(r, p) !== 1n);
	return r;
}

/**
 * Encuentra el siguiente número primo mayor que n
 */
export function nextPrime(n: bigint): bigint {
	if (n < 2n) return 2n;
	if (n === 2n) return 3n;
	if (n % 2n === 0n) n++;

	while (!isPrime(n)) {
		n += 2n;
	}
	return n;
}

/**
 * Verifica si un número es primo (optimizado para móvil)
 */
export function isPrime(n: bigint): boolean {
	if (n < 2n) return false;
	if (n === 2n) return true;
	if (n % 2n === 0n) return false;

	// Para números muy grandes, usar test probabilístico más rápido
	if (n > 1000000n) {
		return isPrimeProbabilistic(n);
	}

	// Para números pequeños, usar test determinístico
	const sqrt = BigInt(Math.floor(Math.sqrt(Number(n))));
	for (let i = 3n; i <= sqrt; i += 2n) {
		if (n % i === 0n) return false;
	}
	return true;
}

/**
 * Test probabilístico de primalidad (más rápido para números grandes)
 */
function isPrimeProbabilistic(n: bigint): boolean {
	// Test de Fermat con bases pequeñas
	const bases = [2n, 3n, 5n, 7n, 11n];
	
	for (const base of bases) {
		if (base >= n) continue;
		if (modPow(base, n - 1n, n) !== 1n) {
			return false;
		}
	}
	return true;
}

/**
 * Calcula (base^exp) % mod de forma eficiente
 */
function modPow(base: bigint, exp: bigint, mod: bigint): bigint {
	let result = 1n;
	base = base % mod;
	
	while (exp > 0n) {
		if (exp % 2n === 1n) {
			result = (result * base) % mod;
		}
		exp = exp >> 1n;
		base = (base * base) % mod;
	}
	
	return result;
}
