"use client";
import { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Platform, Alert, Image, type ImageSourcePropType } from "react-native";
import { useRouter } from "expo-router";
import { CameraView } from 'expo-camera';
import { useSelector } from "@/store";
import { validateQRCode } from "@/services/api";

export default function QRScannerScreen() {
	const router = useRouter();
	const { email, f1, address } = useSelector((state) => state.user);
	const [scanned, setScanned] = useState(false);
	const [hasPermission, setHasPermission] = useState<boolean | null>(null);
	const [cameraActive, setCameraActive] = useState(false);

	const logo: ImageSourcePropType = require("@/assets/images/icon.png");

	useEffect(() => {
		const getCameraPermissions = async () => {
			// Para CameraView, los permisos se manejan automáticamente
			setHasPermission(true);
		};

		getCameraPermissions();
	}, []);

	const handleBarCodeScanned = async ({ type, data }: { type: string; data: string }) => {
		if (scanned) return;
		
		setScanned(true);
		console.log('🔍 QR Code scanned:', { type, data });
		console.log('📱 Device info:', navigator.userAgent);
		
		// Mostrar alerta inmediata para debugging
		Alert.alert(
			"🔍 QR Detectado",
			`Tipo: ${type}\nDatos: ${data.substring(0, 50)}...`,
			[
				{
					text: "Validar",
					onPress: async () => {
						try {
							// Validar QR con el API real
							const result = await validateQRCode({
								email,
								f1,
								address,
								qr: data
							});

							console.log('QR Validation result:', result);

							if (result.isValid) {
								Alert.alert(
									"✅ QR Válido",
									`Código QR validado exitosamente.\n\nKey de autorización: ${result.key}`,
									[
										{
											text: "Continuar",
											onPress: () => router.push("/requirements")
										}
									]
								);
							} else {
								Alert.alert(
									"❌ QR Inválido",
									"El código QR no es válido. Por favor verifica e intenta nuevamente.",
									[
										{
											text: "OK",
											onPress: () => setScanned(false)
										}
									]
								);
							}
						} catch (error) {
							console.error('Error validating QR:', error);
							Alert.alert(
								"Error",
								"No se pudo validar el código QR. Por favor intenta nuevamente.",
								[
									{
										text: "OK",
										onPress: () => setScanned(false)
									}
								]
							);
						}
					}
				},
				{
					text: "Cancelar",
					onPress: () => setScanned(false)
				}
			]
		);
	};

	const activateCamera = () => {
		setCameraActive(true);
	};

	const simulateScan = () => {
		setScanned(true);
		setTimeout(() => router.back(), 600);
	};

	if (hasPermission === null) {
		return (
			<View style={styles.container}>
				<Text style={styles.permissionText}>Solicitando permisos de cámara...</Text>
			</View>
		);
	}

	if (hasPermission === false) {
		return (
			<View style={styles.container}>
				<Text style={styles.permissionText}>No se tienen permisos para acceder a la cámara</Text>
				<TouchableOpacity style={styles.button} onPress={() => setHasPermission(true)}>
					<Text style={styles.buttonText}>Solicitar Permisos</Text>
				</TouchableOpacity>
			</View>
		);
	}

	return (
		<View style={styles.container}>
			{cameraActive ? (
				// Vista de scanner activo - pantalla completa
				<CameraView
					style={styles.fullScreenCamera}
					facing="back"
					onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
					barcodeScannerSettings={{
						barcodeTypes: ["qr", "pdf417", "code128", "code39"],
					}}
				>
					<View style={styles.scannerHeader}>
						<Image source={logo} style={styles.scannerLogo} resizeMode="contain" />
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
							{scanned ? "QR Detectado!" : "Apunte la cámara hacia el código QR"}
						</Text>
					</View>
					<TouchableOpacity style={styles.scannerButton} onPress={simulateScan}>
						<Text style={styles.scannerButtonText}>📸 Simular Escaneo</Text>
					</TouchableOpacity>
				</CameraView>
			) : (
				// Vista normal con botones
				<View style={styles.normalView}>
					<View style={styles.header}>
						<Image source={logo} style={styles.logo} resizeMode="contain" />
					</View>

					<View style={styles.cameraContainer}>
						<View style={styles.cameraPlaceholder}>
							<Text style={styles.cameraPlaceholderText}>📷</Text>
							<Text style={styles.cameraPlaceholderSubtext}>
								Presiona el botón para activar la cámara
							</Text>
						</View>
					</View>

					<View style={styles.instructions}>
						<Text style={styles.instructionText}>
							Activa la cámara para escanear el código QR
						</Text>
					</View>

					<View style={styles.buttonContainer}>
						<TouchableOpacity style={styles.button} onPress={activateCamera}>
							<Text style={styles.buttonText}>📷 Activar Cámara</Text>
						</TouchableOpacity>
						
						<TouchableOpacity style={styles.otpButton} onPress={() => router.push("/otp-generator")}>
							<Text style={styles.otpButtonText}>🔐 Código Autenticación</Text>
						</TouchableOpacity>
						
						<TouchableOpacity style={styles.testButton} onPress={() => {
							// Simular detección de QR de prueba
							handleBarCodeScanned({ 
								type: "qr", 
								data: "https://test-qr-code-123456789.com" 
							});
						}}>
							<Text style={styles.testButtonText}>🧪 Simular Escaneo QR</Text>
						</TouchableOpacity>
					</View>
				</View>
			)}
		</View>
	);
}

const styles = StyleSheet.create({
	container: { 
		flex: 1, 
		backgroundColor: "white",
	},
	normalView: {
		flex: 1,
		paddingHorizontal: 24,
	},
	header: {
		paddingTop: 80,
		alignItems: "center",
	},
	logo: { 
		width: 160, 
		height: 80, 
		marginTop: 10 
	},
	cameraContainer: {
		flex: 1,
		margin: 20,
		borderRadius: 20,
		overflow: 'hidden',
		backgroundColor: "#f0f0f0",
	},
	camera: {
		flex: 1,
	},
	cameraPlaceholder: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		backgroundColor: "#f8f9fa",
	},
	cameraPlaceholderText: {
		fontSize: 64,
		marginBottom: 16,
	},
	cameraPlaceholderSubtext: {
		fontSize: 16,
		color: "#666",
		textAlign: "center",
		paddingHorizontal: 20,
	},
	debugInfo: {
		position: "absolute",
		top: 20,
		left: 20,
		right: 20,
		backgroundColor: "rgba(0,0,0,0.7)",
		padding: 10,
		borderRadius: 8,
	},
	debugText: {
		color: "white",
		fontSize: 14,
		textAlign: "center",
		fontWeight: "600",
	},
	instructions: {
		padding: 20,
		alignItems: 'center',
	},
	instructionText: {
		fontSize: 16,
		color: '#666',
		textAlign: 'center',
	},
	permissionText: {
		fontSize: 18,
		color: '#333',
		textAlign: 'center',
		margin: 20,
	},
	scanOverlay: {
		position: "absolute",
		top: 0,
		left: 0,
		right: 0,
		bottom: 0,
		justifyContent: "center",
		alignItems: "center",
	},
	scanFrame: {
		width: 250,
		height: 250,
		position: "relative",
		justifyContent: "center",
		alignItems: "center",
	},
	corner: {
		position: "absolute",
		width: 40,
		height: 40,
		borderColor: "#007AFF",
		borderWidth: 4,
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
	button: { 
		margin: 20, 
		backgroundColor: "#1E78C6", 
		paddingVertical: 16, 
		paddingHorizontal: 32, 
		borderRadius: 8,
		...(Platform.OS === 'web' ? { boxShadow: "0px 6px 12px rgba(2,17,42,0.25)" } : { elevation: 4 }) 
	},
	cameraButton: { 
		margin: 20, 
		backgroundColor: "#28a745", 
		paddingVertical: 16, 
		paddingHorizontal: 32, 
		borderRadius: 8,
		...(Platform.OS === 'web' ? { boxShadow: "0px 6px 12px rgba(40,167,69,0.25)" } : { elevation: 4 }) 
	},
	cameraButtonText: { 
		color: "#fff", 
		fontWeight: "600",
		fontSize: 16,
		textAlign: "center"
	},
	buttonText: { 
		color: "#fff", 
		fontWeight: "600",
		fontSize: 16,
		textAlign: "center"
	},
	buttonContainer: {
		flexDirection: "column",
		marginBottom: 40,
		marginTop: 20,
		gap: 12,
	},
	otpButton: {
		backgroundColor: "#6f42c1",
		paddingVertical: 16,
		paddingHorizontal: 32,
		borderRadius: 8,
		marginBottom: 8,
	},
	otpButtonText: {
		color: "#fff",
		fontWeight: "600",
		fontSize: 16,
		textAlign: "center",
	},
	testButton: {
		backgroundColor: "#28a745",
		paddingVertical: 12,
		paddingHorizontal: 20,
		borderRadius: 8,
	},
	testButtonText: {
		color: "#fff",
		fontWeight: "600",
		fontSize: 14,
		textAlign: "center",
	},
	// Estilos para vista de scanner pantalla completa
	fullScreenCamera: {
		flex: 1,
	},
	scannerHeader: {
		position: "absolute",
		top: 50,
		left: 0,
		right: 0,
		alignItems: "center",
		zIndex: 10,
	},
	scannerLogo: {
		width: 120,
		height: 60,
	},
	scannerInstructions: {
		position: "absolute",
		bottom: 120,
		left: 20,
		right: 20,
		backgroundColor: "rgba(0,0,0,0.7)",
		padding: 15,
		borderRadius: 8,
		zIndex: 10,
	},
	scannerInstructionText: {
		color: "#fff",
		fontSize: 16,
		fontWeight: "600",
		textAlign: "center",
	},
	scannerButton: {
		position: "absolute",
		bottom: 50,
		left: 20,
		right: 20,
		backgroundColor: "#007AFF",
		paddingVertical: 16,
		paddingHorizontal: 32,
		borderRadius: 8,
		zIndex: 10,
	},
	scannerButtonText: {
		color: "#fff",
		fontWeight: "600",
		fontSize: 16,
		textAlign: "center",
	},
});
