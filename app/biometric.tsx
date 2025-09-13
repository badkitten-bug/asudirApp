"use client";
import {
	View,
	StyleSheet,
	Image,
	TouchableOpacity,
	Text,
	Alert,
	Platform,
} from "react-native";
import { useState } from "react";
import { useRouter } from "expo-router";
import { CameraView } from "expo-camera";
import { useSelector } from "@/store";
import { validateFace } from "@/services/api";

const logo = require("@/assets/images/icon.png");

export default function BiometricScreen() {
	const router = useRouter();
	const { email, dni, address, f1 } = useSelector((state) => state.user);
	const [cameraActive, setCameraActive] = useState(false);
	const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
	const [isValidating, setIsValidating] = useState(false);

	const activateCamera = () => {
		setCameraActive(true);
	};

	const takePicture = async () => {
		if (!cameraActive) return;

		// Simular captura de foto (en una implementación real usarías cameraRef.current?.takePictureAsync())
		// Por ahora usamos una imagen base64 de ejemplo
		const sampleBase64 =
			"data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=";
		setCapturedPhoto(sampleBase64);
		setCameraActive(false);
	};

	const handleValidate = async () => {
		if (!capturedPhoto) {
			Alert.alert("Error", "Primero debes tomar una foto");
			return;
		}

		setIsValidating(true);

		const result = await validateFace({
			photoBase64: capturedPhoto,
			email,
			dni,
			f1,
			address,
			key: "test-key-123", // Key del QR validado
		});

		if (result.isValid) {
			router.replace("/success");
		} else {
			Alert.alert("Validación", "No fue posible validar el rostro.");
		}

		setIsValidating(false);
	};

	return (
		<View style={styles.container}>
			{cameraActive ? (
				// Vista de cámara activa (pantalla completa)
				<CameraView
					style={styles.fullScreenCamera}
					facing="front"
					{...(Platform.OS === "web"
						? {
								// Configuraciones específicas para web
								videoQuality: "high",
								pictureSize: "1920x1080",
							}
						: {})}
				>
					<View style={styles.cameraHeader}>
						<Image
							source={logo}
							style={styles.cameraLogo}
							resizeMode="contain"
						/>
						<Text style={styles.cameraTitle}>Verificación Biométrica</Text>
					</View>

					{/* Marco de captura centrado */}
					<View style={styles.faceFrame}>
						<View style={styles.frameCorner} />
						<View style={[styles.frameCorner, styles.frameCornerTopRight]} />
						<View style={[styles.frameCorner, styles.frameCornerBottomLeft]} />
						<View style={[styles.frameCorner, styles.frameCornerBottomRight]} />
					</View>

					{/* Instrucciones */}
					<View style={styles.cameraInstructions}>
						<Text style={styles.instructionText}>
							📱 Coloca tu rostro dentro del marco
						</Text>
						<Text style={styles.instructionSubtext}>
							Asegúrate de tener buena iluminación
						</Text>
					</View>

					{/* Botón de captura */}
					<TouchableOpacity style={styles.captureButton} onPress={takePicture}>
						<View style={styles.captureButtonInner}>
							<Text style={styles.captureButtonText}>📸</Text>
						</View>
					</TouchableOpacity>

					{/* Botón de cerrar */}
					<TouchableOpacity
						style={styles.closeButton}
						onPress={() => setCameraActive(false)}
					>
						<Text style={styles.closeButtonText}>✕</Text>
					</TouchableOpacity>
				</CameraView>
			) : (
				// Vista normal con botones
				<View style={styles.normalView}>
					<View style={styles.header}>
						<Image source={logo} style={styles.logo} resizeMode="contain" />
					</View>

					<View style={styles.cameraContainer}>
						{capturedPhoto ? (
							<View style={styles.previewContainer}>
								<Image source={{ uri: capturedPhoto }} style={styles.preview} />
								<View style={styles.previewOverlay}>
									<Text style={styles.previewText}>✅ Foto capturada</Text>
								</View>
							</View>
						) : (
							<View style={styles.cameraPlaceholder}>
								<Text style={styles.placeholderIcon}>👤</Text>
								<Text style={styles.placeholderTitle}>Verificación Facial</Text>
								<Text style={styles.placeholderSubtext}>
									Activa la cámara para capturar tu rostro y completar la
									verificación biométrica
								</Text>
							</View>
						)}
					</View>

					<View style={styles.instructions}>
						<Text style={styles.instructionText}>
							{capturedPhoto
								? "Revisa tu foto y valida tu identidad"
								: "Activa la cámara para tomar tu foto"}
						</Text>
					</View>

					<View style={styles.buttonContainer}>
						{capturedPhoto ? (
							<>
								<TouchableOpacity
									style={styles.retakeButton}
									onPress={() => {
										setCapturedPhoto(null);
										setCameraActive(true);
									}}
								>
									<Text style={styles.retakeButtonText}>🔄 Tomar Otra</Text>
								</TouchableOpacity>

								<TouchableOpacity
									style={[
										styles.validateButton,
										isValidating && styles.validateButtonDisabled,
									]}
									onPress={handleValidate}
									disabled={isValidating}
								>
									<Text style={styles.validateButtonText}>
										{isValidating ? "⏳ Validando..." : "✅ Validar Biometría"}
									</Text>
								</TouchableOpacity>
							</>
						) : (
							<TouchableOpacity
								style={styles.activateButton}
								onPress={activateCamera}
							>
								<Text style={styles.activateButtonText}>📷 Activar Cámara</Text>
							</TouchableOpacity>
						)}
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

	// Estilos para vista normal
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
		marginTop: 10,
	},

	// Contenedor de cámara mejorado
	cameraContainer: {
		flex: 1,
		marginTop: 20,
		marginBottom: 20,
		borderRadius: 20,
		overflow: "hidden",
		backgroundColor: "#f8f9fa",
		...(Platform.OS === "web"
			? { boxShadow: "0px 8px 24px rgba(0,0,0,0.1)" }
			: { elevation: 8 }),
	},

	// Placeholder mejorado
	cameraPlaceholder: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		paddingHorizontal: 40,
		backgroundColor: "#f8f9fa",
	},
	placeholderIcon: {
		fontSize: 80,
		marginBottom: 20,
	},
	placeholderTitle: {
		fontSize: 24,
		fontWeight: "700",
		color: "#333",
		marginBottom: 12,
		textAlign: "center",
	},
	placeholderSubtext: {
		fontSize: 16,
		color: "#666",
		textAlign: "center",
		lineHeight: 24,
	},

	// Preview mejorado
	previewContainer: {
		flex: 1,
		position: "relative",
	},
	preview: {
		width: "100%",
		height: "100%",
		resizeMode: "cover",
	},
	previewOverlay: {
		position: "absolute",
		top: 20,
		left: 20,
		right: 20,
		backgroundColor: "rgba(0,0,0,0.7)",
		paddingVertical: 12,
		paddingHorizontal: 16,
		borderRadius: 12,
	},
	previewText: {
		color: "#fff",
		fontSize: 16,
		fontWeight: "600",
		textAlign: "center",
	},

	// Instrucciones
	instructions: {
		marginBottom: 20,
		paddingHorizontal: 20,
	},
	instructionText: {
		fontSize: 16,
		color: "#333",
		textAlign: "center",
		fontWeight: "500",
	},

	// Botones mejorados
	buttonContainer: {
		flexDirection: "row",
		gap: 12,
		marginBottom: 40,
	},
	activateButton: {
		flex: 1,
		backgroundColor: "#1E78C6",
		paddingVertical: 16,
		paddingHorizontal: 32,
		borderRadius: 25,
		alignItems: "center",
		...(Platform.OS === "web"
			? { boxShadow: "0px 8px 20px rgba(30,120,198,0.3)" }
			: { elevation: 6 }),
	},
	activateButtonText: {
		color: "#fff",
		fontSize: 16,
		fontWeight: "600",
	},
	retakeButton: {
		flex: 1,
		backgroundColor: "#6c757d",
		paddingVertical: 16,
		paddingHorizontal: 20,
		borderRadius: 25,
		alignItems: "center",
		...(Platform.OS === "web"
			? { boxShadow: "0px 6px 16px rgba(108,117,125,0.3)" }
			: { elevation: 4 }),
	},
	retakeButtonText: {
		color: "#fff",
		fontSize: 14,
		fontWeight: "600",
	},
	validateButton: {
		flex: 1,
		backgroundColor: "#28a745",
		paddingVertical: 16,
		paddingHorizontal: 20,
		borderRadius: 25,
		alignItems: "center",
		...(Platform.OS === "web"
			? { boxShadow: "0px 6px 16px rgba(40,167,69,0.3)" }
			: { elevation: 4 }),
	},
	validateButtonText: {
		color: "#fff",
		fontSize: 14,
		fontWeight: "600",
	},
	validateButtonDisabled: {
		backgroundColor: "#ccc",
	},

	// Estilos para cámara activa (pantalla completa)
	fullScreenCamera: {
		flex: 1,
	},
	cameraHeader: {
		position: "absolute",
		top: 50,
		left: 0,
		right: 0,
		alignItems: "center",
		zIndex: 10,
	},
	cameraLogo: {
		width: 120,
		height: 60,
		marginBottom: 8,
	},
	cameraTitle: {
		fontSize: 18,
		fontWeight: "600",
		color: "#fff",
		textAlign: "center",
		backgroundColor: "rgba(0,0,0,0.5)",
		paddingHorizontal: 16,
		paddingVertical: 8,
		borderRadius: 20,
	},

	// Marco facial mejorado
	faceFrame: {
		position: "absolute",
		top: "50%",
		left: "50%",
		width: 280,
		height: 280,
		marginTop: -140,
		marginLeft: -140,
		justifyContent: "center",
		alignItems: "center",
	},
	frameCorner: {
		position: "absolute",
		width: 40,
		height: 40,
		borderColor: "#1E78C6",
		borderWidth: 4,
		top: 0,
		left: 0,
		borderTopWidth: 4,
		borderLeftWidth: 4,
		borderRightWidth: 0,
		borderBottomWidth: 0,
	},
	frameCornerTopRight: {
		top: 0,
		right: 0,
		left: "auto",
		borderTopWidth: 4,
		borderRightWidth: 4,
		borderLeftWidth: 0,
		borderBottomWidth: 0,
	},
	frameCornerBottomLeft: {
		bottom: 0,
		left: 0,
		top: "auto",
		borderBottomWidth: 4,
		borderLeftWidth: 4,
		borderTopWidth: 0,
		borderRightWidth: 0,
	},
	frameCornerBottomRight: {
		bottom: 0,
		right: 0,
		top: "auto",
		left: "auto",
		borderBottomWidth: 4,
		borderRightWidth: 4,
		borderTopWidth: 0,
		borderLeftWidth: 0,
	},

	// Instrucciones de cámara
	cameraInstructions: {
		position: "absolute",
		bottom: 120,
		left: 20,
		right: 20,
		backgroundColor: "rgba(0,0,0,0.7)",
		padding: 16,
		borderRadius: 16,
		zIndex: 10,
	},
	instructionSubtext: {
		color: "#fff",
		fontSize: 14,
		textAlign: "center",
		marginTop: 4,
		opacity: 0.8,
	},

	// Botón de captura circular
	captureButton: {
		position: "absolute",
		bottom: 50,
		left: "50%",
		marginLeft: -35,
		width: 70,
		height: 70,
		borderRadius: 35,
		backgroundColor: "#fff",
		justifyContent: "center",
		alignItems: "center",
		zIndex: 10,
		...(Platform.OS === "web"
			? { boxShadow: "0px 8px 20px rgba(0,0,0,0.3)" }
			: { elevation: 8 }),
	},
	captureButtonInner: {
		width: 60,
		height: 60,
		borderRadius: 30,
		backgroundColor: "#1E78C6",
		justifyContent: "center",
		alignItems: "center",
	},
	captureButtonText: {
		fontSize: 24,
	},

	// Botón de cerrar
	closeButton: {
		position: "absolute",
		top: 50,
		right: 20,
		width: 40,
		height: 40,
		borderRadius: 20,
		backgroundColor: "rgba(0,0,0,0.5)",
		justifyContent: "center",
		alignItems: "center",
		zIndex: 10,
	},
	closeButtonText: {
		color: "#fff",
		fontSize: 20,
		fontWeight: "600",
	},
});
