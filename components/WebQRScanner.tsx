import { useEffect, useRef, useState } from "react";
import { View, Text, StyleSheet, Platform } from "react-native";
import { Html5QrcodeScanner } from "html5-qrcode";

interface WebQRScannerProps {
	onScan: (data: string) => void;
	onError?: (error: string) => void;
	isActive: boolean;
}

export default function WebQRScanner({
	onScan,
	onError,
	isActive,
}: WebQRScannerProps) {
	const scannerRef = useRef<Html5QrcodeScanner | null>(null);
	const [isInitialized, setIsInitialized] = useState(false);

	useEffect(() => {
		if (Platform.OS !== "web" || !isActive) return;

		const initScanner = () => {
			try {
				// Limpiar scanner anterior si existe
				if (scannerRef.current) {
					scannerRef.current.clear();
				}

				// Crear nuevo scanner
				scannerRef.current = new Html5QrcodeScanner(
					"qr-reader",
					{
						fps: 10,
						qrbox: { width: 250, height: 250 },
						aspectRatio: 1.0,
						showTorchButtonIfSupported: true,
						showZoomSliderIfSupported: true,
						defaultZoomValueIfSupported: 2,
					},
					/* verbose= */ false,
				);

				// Callback de éxito
				const onScanSuccess = (decodedText: string) => {
					console.log("🔍 QR Web Scanner - Código detectado:", decodedText);
					onScan(decodedText);

					// Pausar scanner después de detección exitosa
					if (scannerRef.current) {
						scannerRef.current.pause(true);
					}
				};

				// Callback de error (no crítico, ocurre constantemente mientras busca)
				const onScanFailure = (error: string) => {
					// Solo log para debugging, no mostrar al usuario
					// console.log('QR scan attempt:', error);
				};

				// Renderizar scanner
				scannerRef.current.render(onScanSuccess, onScanFailure);
				setIsInitialized(true);
			} catch (error) {
				console.error("Error inicializando Web QR Scanner:", error);
				onError?.(`Error inicializando scanner: ${error}`);
			}
		};

		// Pequeño delay para asegurar que el DOM esté listo
		const timer = setTimeout(initScanner, 100);

		return () => {
			clearTimeout(timer);
			if (scannerRef.current) {
				scannerRef.current.clear().catch(console.error);
				scannerRef.current = null;
			}
			setIsInitialized(false);
		};
	}, [isActive, onScan, onError]);

	// Función para reanudar scanning
	const resumeScanning = () => {
		if (scannerRef.current && isInitialized) {
			scannerRef.current.resume();
		}
	};

	if (Platform.OS !== "web") {
		return null;
	}

	return (
		<View style={styles.container}>
			<View style={styles.scannerContainer}>
				{/* El div donde se renderiza el scanner */}
				<div id="qr-reader" style={{ width: "100%" }} />

				{!isInitialized && (
					<View style={styles.loadingContainer}>
						<Text style={styles.loadingText}>Inicializando cámara...</Text>
					</View>
				)}
			</View>

			<View style={styles.instructionsContainer}>
				<Text style={styles.instructionText}>
					📱 Apunta la cámara hacia el código QR
				</Text>
				<Text style={styles.subInstructionText}>
					El escaneo es automático una vez detectado
				</Text>
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "#fff",
	},
	scannerContainer: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		padding: 20,
	},
	loadingContainer: {
		position: "absolute",
		top: "50%",
		left: 0,
		right: 0,
		alignItems: "center",
		backgroundColor: "rgba(255, 255, 255, 0.9)",
		padding: 20,
		borderRadius: 10,
	},
	loadingText: {
		fontSize: 16,
		color: "#666",
		fontWeight: "600",
	},
	instructionsContainer: {
		padding: 20,
		backgroundColor: "#f8f9fa",
		alignItems: "center",
	},
	instructionText: {
		fontSize: 16,
		fontWeight: "600",
		color: "#333",
		textAlign: "center",
		marginBottom: 8,
	},
	subInstructionText: {
		fontSize: 14,
		color: "#666",
		textAlign: "center",
	},
});
