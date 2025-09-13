"use client";
import { useState, useEffect } from "react";
import {
	View,
	Text,
	StyleSheet,
	TouchableOpacity,
	Platform,
	Alert,
	Image,
	type ImageSourcePropType,
} from "react-native";
import { useRouter } from "expo-router";
import { CameraView } from "expo-camera";
import { useSelector, useDispatch } from "@/store";
import { logout } from "@/store/authSlice";
import WebQRScanner from "@/components/WebQRScanner";

export default function QRScannerScreen() {
	const router = useRouter();
	const dispatch = useDispatch();
	const { email } = useSelector((state) => state.user);
	const { user } = useSelector((state) => state.auth);
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

	const handleBarCodeScanned = async ({
		type,
		data,
	}: {
		type: string;
		data: string;
	}) => {
		if (scanned) return;

		setScanned(true);
		console.log("🔍 QR Service Code scanned:", { type, data });

		// Procesar QR de servicio (banco, institución, etc.)
		await handleServiceQR(data);
	};

	const handleServiceQR = async (qrData: string) => {
		try {
			console.log("📋 Procesando QR de servicio:", qrData);

			// Mostrar QR detectado
			Alert.alert(
				"🏦 QR de Servicio Detectado",
				`Datos: ${qrData.substring(0, 100)}...`,
				[
					{
						text: "Procesar",
						onPress: async () => {
							await processServiceRequest(qrData);
						},
					},
					{
						text: "Cancelar",
						onPress: () => setScanned(false),
					},
				],
			);
		} catch (error) {
			console.error("Error processing service QR:", error);
			Alert.alert(
				"Error",
				"No se pudo procesar el QR del servicio. Intenta nuevamente.",
				[{ text: "OK", onPress: () => setScanned(false) }],
			);
		}
	};

	const processServiceRequest = async (qrData: string) => {
		try {
			// Simular llamada al API con datos del QR
			console.log("📡 Enviando QR al API:", qrData);

			// TODO: Reemplazar con llamada real al API
			const apiResponse = await simulateServiceAPI(qrData);

			console.log("📨 Respuesta del API:", apiResponse);

			// Procesar respuesta del API
			if (apiResponse.success) {
				await handleServiceRequirements(apiResponse.requirements);
			} else {
				Alert.alert(
					"❌ Error",
					apiResponse.message || "El servicio no está disponible",
				);
				setScanned(false);
			}
		} catch (error) {
			console.error("Error in service request:", error);
			Alert.alert("Error", "No se pudo procesar la solicitud del servicio");
			setScanned(false);
		}
	};

	const simulateServiceAPI = async (qrData: string) => {
		// Simular delay de red
		await new Promise((resolve) => setTimeout(resolve, 1500));

		// Simular respuesta del API basada en QR
		return {
			success: true,
			serviceId: "BANK001",
			serviceName: "Banco Nacional",
			requirements: {
				needsDNI: true,
				needsEmail: true,
				needsBiometric: true,
				needsAddress: false,
				credits: 150,
				description: "Verificación de identidad para apertura de cuenta",
			},
			processId: "proc-123456",
			sessionId: "sess-789012",
		};
	};

	const handleServiceRequirements = async (requirements: any) => {
		const {
			needsDNI,
			needsEmail,
			needsBiometric,
			credits,
			serviceName,
			description,
		} = requirements;

		let requirementsText = `Servicio: ${serviceName}\n${description}\n\nCréditos disponibles: ${credits}\n\nRequisitos:\n`;

		if (needsDNI) requirementsText += "✅ DNI requerido\n";
		if (needsEmail) requirementsText += "✅ Email requerido\n";
		if (needsBiometric) requirementsText += "✅ Foto biométrica requerida\n";

		Alert.alert("📋 Requisitos del Servicio", requirementsText, [
			{
				text: "Continuar",
				onPress: () => {
					// Si necesita biometría, ir a captura biométrica
					if (needsBiometric) {
						router.push("/biometric");
					} else {
						router.push("/requirements");
					}
				},
			},
			{
				text: "Cancelar",
				onPress: () => setScanned(false),
			},
		]);
	};

	const activateCamera = () => {
		setCameraActive(true);
	};

	const handleLogout = () => {
		Alert.alert(
			"🚪 Cerrar Sesión",
			"¿Estás seguro que deseas cerrar sesión? Podrás volver a iniciar sesión con tus datos.",
			[
				{
					text: "Cancelar",
					style: "cancel",
				},
				{
					text: "Cerrar Sesión",
					style: "destructive",
					onPress: () => {
						dispatch(logout());
						// Ir a login específicamente
						router.replace("/(auth)/login");
					},
				},
			],
		);
	};

	// Función web removida - solo usamos handleBarCodeScanned nativo

	if (hasPermission === null) {
		return (
			<View style={styles.container}>
				<Text style={styles.permissionText}>
					Solicitando permisos de cámara...
				</Text>
			</View>
		);
	}

	if (hasPermission === false) {
		return (
			<View style={styles.container}>
				<Text style={styles.permissionText}>
					No se tienen permisos para acceder a la cámara
				</Text>
				<TouchableOpacity
					style={styles.button}
					onPress={() => setHasPermission(true)}
				>
					<Text style={styles.buttonText}>Solicitar Permisos</Text>
				</TouchableOpacity>
			</View>
		);
	}

	return (
		<View style={styles.container}>
			{cameraActive ? (
				// Vista de scanner activo - Web o Nativo según plataforma
				Platform.OS === "web" ? (
					<WebQRScanner
						onScan={(data) => handleBarCodeScanned({ type: "qr", data })}
						onError={(error) => {
							console.error("Web QR Scanner Error:", error);
							Alert.alert("Error de Cámara", error);
							setCameraActive(false);
						}}
						isActive={cameraActive}
					/>
				) : (
					<CameraView
						style={styles.fullScreenCamera}
						facing="back"
						onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
						barcodeScannerSettings={{
							barcodeTypes: ["qr", "pdf417", "code128", "code39"],
						}}
					>
						<View style={styles.scannerHeader}>
							<Image
								source={logo}
								style={styles.scannerLogo}
								resizeMode="contain"
							/>
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
								{scanned
									? "QR Detectado!"
									: "Apunte la cámara hacia el código QR"}
							</Text>
						</View>
					</CameraView>
				)
			) : (
				// Vista normal con botones
				<View style={styles.normalView}>
					<View style={styles.header}>
						<Image source={logo} style={styles.logo} resizeMode="contain" />
						<TouchableOpacity
							style={styles.profileButton}
							onPress={handleLogout}
						>
							<View style={styles.profileIcon}>
								<Text style={styles.profileInitial}>
									{user?.name?.charAt(0).toUpperCase() ||
										email?.charAt(0).toUpperCase() ||
										"U"}
								</Text>
							</View>
							<Text style={styles.profileText}>Perfil</Text>
						</TouchableOpacity>
					</View>

					{/* Hero Section con imagen QR */}
					<View style={styles.heroWrap}>
						<Image
							source={require("@/assets/images/bg.png")}
							style={styles.hero}
							resizeMode="contain"
						/>
						<Image
							source={require("@/assets/images/qr-image.png")}
							style={styles.qr}
							resizeMode="contain"
						/>
					</View>

					<View style={styles.instructions}>
						<Text style={styles.instructionText}>
							🏦 Escanea el código QR del servicio (banco, institución) para
							iniciar la verificación de identidad
						</Text>
						<Text style={styles.instructionSubtext}>
							El sistema consultará los requisitos y créditos disponibles
						</Text>
					</View>

					<View style={styles.buttonContainer}>
						<TouchableOpacity style={styles.button} onPress={activateCamera}>
							<Text style={styles.buttonText}>
								{Platform.OS === "web" ? "📱 Escanear QR" : "📷 Escanear QR"}
							</Text>
						</TouchableOpacity>

						<TouchableOpacity
							style={styles.otpButton}
							onPress={() => router.push("/otp-generator")}
						>
							<Text style={styles.otpButtonText}>
								🔐 Código de Autenticación
							</Text>
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
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		paddingHorizontal: 20,
	},
	logo: {
		width: 160,
		height: 80,
		marginTop: 10,
	},
	heroWrap: {
		width: "86%",
		height: 280,
		marginTop: 12,
		position: "relative",
		alignSelf: "center",
	},
	hero: {
		width: "100%",
		height: "100%",
	},
	qr: {
		position: "absolute",
		left: 0,
		right: 0,
		top: 0,
		bottom: 0,
		width: "100%",
		height: "100%",
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
		alignItems: "center",
	},
	instructionText: {
		fontSize: 16,
		color: "#666",
		textAlign: "center",
		fontWeight: "500",
	},
	instructionSubtext: {
		fontSize: 14,
		color: "#888",
		textAlign: "center",
		marginTop: 8,
		fontStyle: "italic",
	},
	permissionText: {
		fontSize: 18,
		color: "#333",
		textAlign: "center",
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
		borderRadius: 25,
		...(Platform.OS === "web"
			? { boxShadow: "0px 8px 20px rgba(30,120,198,0.3)" }
			: { elevation: 6 }),
	},
	cameraButton: {
		margin: 20,
		backgroundColor: "#28a745",
		paddingVertical: 16,
		paddingHorizontal: 32,
		borderRadius: 25,
		...(Platform.OS === "web"
			? { boxShadow: "0px 8px 20px rgba(40,167,69,0.3)" }
			: { elevation: 6 }),
	},
	cameraButtonText: {
		color: "#fff",
		fontWeight: "600",
		fontSize: 16,
		textAlign: "center",
	},
	buttonText: {
		color: "#fff",
		fontWeight: "600",
		fontSize: 16,
		textAlign: "center",
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
		borderRadius: 25,
		marginBottom: 8,
		...(Platform.OS === "web"
			? { boxShadow: "0px 8px 20px rgba(111,66,193,0.3)" }
			: { elevation: 6 }),
	},
	otpButtonText: {
		color: "#fff",
		fontWeight: "600",
		fontSize: 16,
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
	// Estilos para botón de perfil
	profileButton: {
		alignItems: "center",
		justifyContent: "center",
		paddingVertical: 8,
		paddingHorizontal: 12,
		borderRadius: 12,
		backgroundColor: "rgba(255,255,255,0.1)",
		borderWidth: 1,
		borderColor: "rgba(255,255,255,0.2)",
	},
	profileIcon: {
		width: 32,
		height: 32,
		borderRadius: 16,
		backgroundColor: "#1E78C6",
		justifyContent: "center",
		alignItems: "center",
		marginBottom: 4,
	},
	profileInitial: {
		color: "#fff",
		fontSize: 14,
		fontWeight: "600",
	},
	profileText: {
		color: "#333",
		fontSize: 11,
		fontWeight: "500",
	},
	// Estilos web removidos - solo CameraView nativo
});
