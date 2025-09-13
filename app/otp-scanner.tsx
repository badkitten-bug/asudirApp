"use client";
import { useState, useEffect } from "react";
import {
	View,
	Text,
	StyleSheet,
	TouchableOpacity,
	Alert,
	Image,
	Vibration,
	type ImageSourcePropType,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { CameraView } from "expo-camera";
import { parseQRData, validateQRData } from "@/utils/qr-parser";
import { generateOTP, generateKUserOTP } from "@/utils/otp-crypto";
import { saveOTPCode } from "@/utils/otp-storage";

export default function OTPScannerScreen() {
	const router = useRouter();
	const { from } = useLocalSearchParams<{ from?: string }>();
	const [hasPermission, setHasPermission] = useState<boolean | null>(null);
	const [scanned, setScanned] = useState(false);
	const [isProcessing, setIsProcessing] = useState(false);
	const [showQRDetected, setShowQRDetected] = useState(false);

	const logo: ImageSourcePropType = require("@/assets/images/icon.png");

	useEffect(() => {
		const getCameraPermissions = async () => {
			console.log("🔍 Inicializando permisos de cámara para OTP Scanner...");
			setHasPermission(true);
			console.log("✅ Permisos de cámara establecidos a true");
		};

		getCameraPermissions();
	}, []);

	const handleBarCodeScanned = async ({ type, data }: { type: string; data: string }) => {
		if (scanned) return;
		
		setScanned(true);
		setIsProcessing(true);
		console.log("🔍 QR escaneado en OTP Scanner:", { type, data });

		// Feedback háptico inmediato
		Vibration.vibrate(200); // Vibración de 200ms
		
		// Mostrar mensaje de QR detectado brevemente
		setShowQRDetected(true);
		setTimeout(() => {
			setShowQRDetected(false);
		}, 1500);
		
		// Parsear el QR
		const parsedData = parseQRData(data);
		console.log("📋 Datos parseados:", parsedData);

		if (!parsedData) {
			Alert.alert(
				"Error",
				"No se pudo procesar el código QR. Verifica que sea un código válido.",
				[
					{
						text: "Intentar de nuevo",
						style: "default",
						onPress: () => {
							setScanned(false);
							setIsProcessing(false);
						},
					},
					{
						text: "Cancelar",
						style: "cancel",
						onPress: () => router.back(),
					},
				],
				{ cancelable: false }
			);
			return;
		}

		if (!validateQRData(parsedData)) {
			Alert.alert(
				"Error", 
				"Los datos del código QR no son válidos. Verifica el formato.",
				[
					{
						text: "Intentar de nuevo",
						style: "default",
						onPress: () => {
							setScanned(false);
							setIsProcessing(false);
						},
					},
					{
						text: "Cancelar",
						style: "cancel",
						onPress: () => router.back(),
					},
				],
				{ cancelable: false }
			);
			return;
		}

		// Generar el código OTP/KUSER
		try {
			console.log("🔄 Iniciando generación de código...");
			let otpResult: { otp: string; expiresAt?: Date; timeLeft?: number };
			
			// Agregar timeout para evitar que se quede colgado
			const timeoutPromise = new Promise<never>((_, reject) => {
				setTimeout(() => {
					reject(new Error("Timeout: La generación tardó más de 15 segundos"));
				}, 15000);
			});
			
			const generationPromise = new Promise<{ otp: string; expiresAt?: Date; timeLeft?: number }>((resolve, reject) => {
				try {
					if (parsedData.type === "kuser") {
						console.log("🔑 Generando KUSER...");
						otpResult = generateKUserOTP(parsedData.semilla, {
							duration: parsedData.timer,
							digits: 6,
						});
					} else {
						console.log("🔐 Generando OTP...");
						otpResult = generateOTP(parsedData.semilla, {
							duration: parsedData.timer,
							digits: 6,
						});
					}
					resolve(otpResult);
				} catch (error) {
					reject(error instanceof Error ? error : new Error(String(error)));
				}
			});
			
			// Usar Promise.race para tener timeout
			const result = await Promise.race([generationPromise, timeoutPromise]);
			console.log("✅ Código generado exitosamente:", result);

			// Guardar el código en AsyncStorage
			console.log("💾 Guardando código en almacenamiento...");
			await saveOTPCode({
				name: parsedData.name,
				type: parsedData.type,
				code: result.otp,
				label: parsedData.label,
				processId: parsedData.processId,
				apiKey: parsedData.apiKey,
				semilla: parsedData.semilla, // Agregar semilla para regeneración
				timer: parsedData.timer, // Agregar timer para regeneración
				expiresAt: result.expiresAt || new Date(Date.now() + 30000), // 30 segundos por defecto
				timeLeft: result.timeLeft || 30, // 30 segundos por defecto
			});

			// Mostrar éxito y navegar automáticamente
			console.log("🎉 Procesamiento exitoso, navegando automáticamente...");
			
			// Navegar automáticamente a la pantalla de códigos de autenticación
			setTimeout(() => {
				console.log("🧭 Navegando desde:", from);
				if (from === "generator") {
					// Si viene del generator, regresar usando back()
					console.log("⬅️ Regresando usando router.back()");
					router.back();
				} else {
					// Si viene de otra pantalla, navegar directamente al generator
					console.log("➡️ Navegando a /otp-generator");
					router.push("/otp-generator");
				}
			}, 1000);
		} catch (error) {
			console.error("Error generando código:", error);
			Alert.alert(
				"Error",
				"No se pudo generar el código de autenticación. Intenta nuevamente.",
				[
					{
						text: "Intentar de nuevo",
						style: "default",
						onPress: () => {
							setScanned(false);
							setIsProcessing(false);
						},
					},
					{
						text: "Cancelar",
						style: "cancel",
						onPress: () => router.back(),
					},
				],
				{ cancelable: false }
			);
		}
	};

	if (hasPermission === null) {
		return (
			<View style={styles.container}>
				<Text style={styles.loadingText}>Solicitando permisos de cámara...</Text>
			</View>
		);
	}

	if (hasPermission === false) {
		return (
			<View style={styles.container}>
				<Text style={styles.errorText}>No se tienen permisos de cámara</Text>
				<TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
					<Text style={styles.backButtonText}>Regresar</Text>
				</TouchableOpacity>
			</View>
		);
	}

	return (
		<View style={styles.container}>
			<CameraView
				style={styles.fullScreenCamera}
				facing="back"
				onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
				barcodeScannerSettings={{
					barcodeTypes: ["qr", "pdf417"],
				}}
			>
				<View style={styles.scannerHeader}>
					<TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
						<Text style={styles.backButtonText}>← Regresar</Text>
					</TouchableOpacity>
					<Image
						source={logo}
						style={styles.scannerLogo}
						resizeMode="contain"
					/>
					<View style={styles.headerSpacer} />
				</View>
				
				<View style={styles.scanOverlay}>
					<View style={styles.scanFrame}>
						<View style={styles.corner} />
						<View style={[styles.corner, styles.topRight]} />
						<View style={[styles.corner, styles.bottomLeft]} />
						<View style={[styles.corner, styles.bottomRight]} />
					</View>
				</View>
				
				<View style={styles.scannerInstructions}>
					<Text style={styles.scannerInstructionText}>
						{(() => {
							if (isProcessing) return "🔄 Procesando QR...";
							if (scanned) return "✅ QR Detectado!";
							return "Apunte la cámara hacia el código QR";
						})()}
					</Text>
					<Text style={styles.scannerSubInstructionText}>
						Formato: otp:... o kuser:...
					</Text>
				</View>
				
				{showQRDetected && (
					<View style={styles.qrDetectedOverlay}>
						<View style={styles.qrDetectedContainer}>
							<Text style={styles.qrDetectedText}>✅ QR Detectado</Text>
							<Text style={styles.qrDetectedSubText}>Procesando código QR...</Text>
						</View>
					</View>
				)}
				
				{isProcessing && (
					<View style={styles.processingOverlay}>
						<View style={styles.processingContainer}>
							<View style={styles.spinner} />
							<Text style={styles.processingText}>
								Procesando código de autenticación...
							</Text>
							<Text style={styles.processingSubText}>
								Generando KMaster y OTP...
							</Text>
						</View>
					</View>
				)}
			</CameraView>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "#000",
	},
	fullScreenCamera: {
		flex: 1,
	},
	scannerHeader: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		paddingTop: 50,
		paddingHorizontal: 20,
		paddingBottom: 20,
		backgroundColor: "rgba(0, 0, 0, 0.3)",
	},
	backButton: {
		padding: 10,
	},
	backButtonText: {
		color: "#fff",
		fontSize: 16,
		fontWeight: "600",
	},
	scannerLogo: {
		width: 40,
		height: 40,
	},
	headerSpacer: {
		width: 60, // Para balancear el header
	},
	scanOverlay: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
	},
	scanFrame: {
		width: 250,
		height: 250,
		position: "relative",
	},
	corner: {
		position: "absolute",
		width: 20,
		height: 20,
		borderColor: "#00A86B",
		borderWidth: 3,
	},
	topRight: {
		top: 0,
		right: 0,
		borderLeftWidth: 0,
		borderBottomWidth: 0,
	},
	bottomLeft: {
		bottom: 0,
		left: 0,
		borderTopWidth: 0,
		borderRightWidth: 0,
	},
	bottomRight: {
		bottom: 0,
		right: 0,
		borderTopWidth: 0,
		borderLeftWidth: 0,
	},
	scannerInstructions: {
		position: "absolute",
		bottom: 100,
		left: 0,
		right: 0,
		alignItems: "center",
		paddingHorizontal: 20,
	},
	scannerInstructionText: {
		color: "#fff",
		fontSize: 18,
		fontWeight: "600",
		textAlign: "center",
		backgroundColor: "rgba(0, 0, 0, 0.7)",
		paddingHorizontal: 20,
		paddingVertical: 12,
		borderRadius: 12,
		marginBottom: 8,
	},
	scannerSubInstructionText: {
		color: "#fff",
		fontSize: 14,
		textAlign: "center",
		backgroundColor: "rgba(0, 0, 0, 0.7)",
		paddingHorizontal: 16,
		paddingVertical: 8,
		borderRadius: 8,
	},
	qrDetectedOverlay: {
		position: "absolute",
		top: 0,
		left: 0,
		right: 0,
		bottom: 0,
		backgroundColor: "rgba(0, 0, 0, 0.7)",
		justifyContent: "center",
		alignItems: "center",
	},
	qrDetectedContainer: {
		backgroundColor: "rgba(255, 255, 255, 0.95)",
		paddingHorizontal: 25,
		paddingVertical: 20,
		borderRadius: 12,
		alignItems: "center",
		minWidth: 250,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.25,
		shadowRadius: 6,
		elevation: 6,
	},
	qrDetectedText: {
		fontSize: 18,
		fontWeight: "600",
		color: "#2E7D32",
		marginBottom: 4,
	},
	qrDetectedSubText: {
		fontSize: 14,
		color: "#666",
		textAlign: "center",
	},
	processingOverlay: {
		position: "absolute",
		top: 0,
		left: 0,
		right: 0,
		bottom: 0,
		backgroundColor: "rgba(0, 0, 0, 0.9)",
		justifyContent: "center",
		alignItems: "center",
	},
	processingContainer: {
		backgroundColor: "rgba(255, 255, 255, 0.95)",
		paddingHorizontal: 30,
		paddingVertical: 25,
		borderRadius: 16,
		alignItems: "center",
		minWidth: 280,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 4 },
		shadowOpacity: 0.3,
		shadowRadius: 8,
		elevation: 8,
	},
	spinner: {
		width: 40,
		height: 40,
		borderRadius: 20,
		borderWidth: 4,
		borderColor: "#00A86B",
		borderTopColor: "transparent",
		marginBottom: 16,
		// Animación CSS (se puede mejorar con Animated API)
	},
	processingText: {
		color: "#333",
		fontSize: 16,
		fontWeight: "600",
		textAlign: "center",
		marginBottom: 8,
	},
	processingSubText: {
		color: "#666",
		fontSize: 14,
		textAlign: "center",
	},
	loadingText: {
		color: "#fff",
		fontSize: 16,
		textAlign: "center",
		marginTop: 100,
	},
	errorText: {
		color: "#ff6b6b",
		fontSize: 16,
		textAlign: "center",
		marginTop: 100,
		marginBottom: 20,
	},
});
