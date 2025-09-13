// Configuración de la aplicación
export const config = {
	// API Configuration
	API_BASE_URL:
		process.env.EXPO_PUBLIC_API_BASE_URL || "https://api.stamping.io/exec/",
	API_KEY:
		process.env.EXPO_PUBLIC_API_KEY ||
		"86e8a39e03fd23ea87a878fcc1a2cc6293899fda6701b26a29c4169d84f",
	SCOPE: process.env.EXPO_PUBLIC_SCOPE || "dev",

	// Process IDs
	SEND_OTP_PROCESS_ID:
		process.env.EXPO_PUBLIC_SEND_OTP_PROCESS_ID ||
		"ae8ddee1-f2d9-4ada-ba62-7e37708134a6",
	CREATE_ACCOUNT_PROCESS_ID:
		process.env.EXPO_PUBLIC_CREATE_ACCOUNT_PROCESS_ID ||
		"32eab051-6e18-42f9-95af-095004cc47d5",

	// App Configuration
	APP_NAME: process.env.EXPO_PUBLIC_APP_NAME || "0xadresscom",
	APP_VERSION: process.env.EXPO_PUBLIC_APP_VERSION || "1.0.0",
} as const;
