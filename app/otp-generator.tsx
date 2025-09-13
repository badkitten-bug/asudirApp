"use client";
import { useState, useEffect, useCallback } from "react";

import {
	View,
	Text,
	StyleSheet,
	TouchableOpacity,
	Alert,
	Image,
	type ImageSourcePropType,
	ScrollView,
	Platform,
} from "react-native";
import { useRouter, useFocusEffect } from "expo-router";
import { getStoredOTPCodes, deleteOTPCode, updateOTPCodeStatus, regenerateOTPCode, type StoredOTPCode } from "@/utils/otp-storage";


export default function OTPGeneratorScreen() {
	const router = useRouter();
	const [storedCodes, setStoredCodes] = useState<StoredOTPCode[]>([]);
	const [isLoading, setIsLoading] = useState(true);

	const loadStoredCodes = useCallback(async () => {
		try {
			setIsLoading(true);
			const codes = await getStoredOTPCodes();
			setStoredCodes(codes);
			console.log(`📱 Códigos cargados: ${codes.length}`);
		} catch (error) {
			console.error('❌ Error cargando códigos:', error);
		} finally {
			setIsLoading(false);
		}
	}, []);

	// Cargar códigos almacenados al montar el componente
	useEffect(() => {
		void loadStoredCodes();
	}, [loadStoredCodes]);

	// Recargar códigos cuando se regresa del scanner
	useFocusEffect(
		useCallback(() => {
			void loadStoredCodes();
		}, [loadStoredCodes])
	);

	// Actualizar tiempo restante cada segundo y regenerar cuando expire
	useEffect(() => {
		const interval = setInterval(async () => {
			const codes = await getStoredOTPCodes();
			const updatedCodes = [];
			let needsRegeneration = false;
			
			for (const code of codes) {
				const now = new Date();
				const expiresAt = new Date(code.expiresAt);
				const timeLeft = Math.max(0, Math.floor((expiresAt.getTime() - now.getTime()) / 1000));
				
				// Si el tiempo llegó a 0, regenerar el código
				if (timeLeft === 0 && code.isActive) {
					try {
						console.log(`🔄 Regenerando código ${code.type.toUpperCase()} expirado:`, code.id);
						const regeneratedCode = await regenerateOTPCode(code.id);
						if (regeneratedCode) {
							updatedCodes.push(regeneratedCode);
							needsRegeneration = true;
							continue;
						}
					} catch (error) {
						console.error('❌ Error regenerando código:', error);
					}
				}
				
				updatedCodes.push({
					...code,
					timeLeft,
					isActive: expiresAt > now,
				});
			}
			
			// Solo actualizar el estado si hubo cambios
			if (needsRegeneration) {
				setStoredCodes(updatedCodes);
			} else {
				// Actualizar solo el tiempo restante
				setStoredCodes(prevCodes => 
					prevCodes.map(code => {
						const now = new Date();
						const expiresAt = new Date(code.expiresAt);
						const timeLeft = Math.max(0, Math.floor((expiresAt.getTime() - now.getTime()) / 1000));
						
						return {
							...code,
							timeLeft,
							isActive: expiresAt > now,
						};
					})
				);
			}
		}, 1000);

		return () => clearInterval(interval);
	}, []);

	const logo: ImageSourcePropType = require("@/assets/images/icon.png");

	// Funciones para manejar códigos almacenados
	const handleActivateCode = async (codeId: string) => {
		try {
			await updateOTPCodeStatus(codeId, true);
			await loadStoredCodes();
			Alert.alert("✅ Éxito", "Código activado correctamente");
		} catch {
			Alert.alert("❌ Error", "No se pudo activar el código");
		}
	};

	const handleApproveCode = async (codeId: string) => {
		try {
			await updateOTPCodeStatus(codeId, true);
			await loadStoredCodes();
			Alert.alert("✅ Éxito", "Código aprobado correctamente");
		} catch {
			Alert.alert("❌ Error", "No se pudo aprobar el código");
		}
	};

	const handleDeleteCode = async (codeId: string) => {
		Alert.alert(
			"🗑️ Eliminar Código",
			"¿Estás seguro de que quieres eliminar este código?",
			[
				{ text: "Cancelar", style: "cancel" },
				{
					text: "Eliminar",
					style: "destructive",
					onPress: () => {
						void (async () => {
							try {
								await deleteOTPCode(codeId);
								await loadStoredCodes();
								Alert.alert("✅ Éxito", "Código eliminado correctamente");
							} catch {
								Alert.alert("❌ Error", "No se pudo eliminar el código");
							}
						})();
					},
				},
			]
		);
	};

	const handleCopyCode = (code: string) => {
		// En React Native necesitarías usar una librería como @react-native-clipboard/clipboard
		Alert.alert("📋 Copiado", `Código copiado: ${code}`);
	};


	return (
		<View style={styles.container}>
			<View style={styles.header}>
				<Image source={logo} style={styles.logo} resizeMode="contain" />
			</View>

			<View style={styles.content}>
				<View style={styles.headerActions}>
					<Text style={styles.title}>Códigos de Autenticación</Text>
					<TouchableOpacity
						style={styles.scanButton}
						onPress={() => {
							console.log("🔍 Navegando a pantalla de scanner...");
							router.push("/otp-scanner?from=generator");
						}}
					>
						<Text style={styles.scanButtonText}>📷 Escanear QR</Text>
					</TouchableOpacity>
				</View>

				{/* Lista de códigos almacenados */}
				{isLoading ? (
					<View style={styles.loadingContainer}>
						<Text style={styles.loadingText}>Cargando códigos...</Text>
					</View>
				) : storedCodes.length > 0 ? (
					<ScrollView style={styles.codesList} showsVerticalScrollIndicator={false}>
						{storedCodes.map((code) => (
							<View key={code.id} style={styles.codeCard}>
								<View style={styles.codeHeader}>
									<Text style={styles.serverName}>{code.name}</Text>
									<View style={[
										styles.typeTag,
										code.type === 'otp' ? styles.otpTag : styles.kuserTag
									]}>
										<Text style={styles.typeTagText}>{code.type.toUpperCase()}</Text>
									</View>
				</View>

								<View style={styles.codeContent}>
									<Text style={styles.codeValue}>{code.code}</Text>
									<TouchableOpacity 
										style={styles.copyButton}
										onPress={() => handleCopyCode(code.code)}
									>
										<Text style={styles.copyButtonText}>📋</Text>
									</TouchableOpacity>
								</View>
								
								<View style={styles.codeActions}>
									{code.type === 'otp' && (
										<TouchableOpacity 
											style={[styles.actionButton, styles.activateButton]}
											onPress={() => handleActivateCode(code.id)}
										>
											<Text style={styles.actionButtonText}>Activar</Text>
										</TouchableOpacity>
									)}
									{code.type === 'kuser' && (
										<TouchableOpacity 
											style={[styles.actionButton, styles.approveButton]}
											onPress={() => handleApproveCode(code.id)}
										>
											<Text style={styles.actionButtonText}>Aprobar</Text>
										</TouchableOpacity>
									)}
									
								<TouchableOpacity
										style={[styles.actionButton, styles.deleteButton]}
										onPress={() => handleDeleteCode(code.id)}
								>
										<Text style={styles.actionButtonText}>🗑️</Text>
								</TouchableOpacity>
							</View>
								
								<Text style={styles.codeInfo}>
									{code.label} • {code.timeLeft}s restantes
							</Text>
						</View>
					))}
				</ScrollView>
				) : (
					<View style={styles.emptyContainer}>
						<Text style={styles.emptyText}>No hay códigos generados</Text>
						<Text style={styles.emptySubtext}>Escanea un QR para generar tu primer código</Text>
					</View>
				)}


				<TouchableOpacity
					style={styles.backButton}
					onPress={() => router.back()}
				>
					<Text style={styles.backButtonText}>← Volver</Text>
				</TouchableOpacity>
			</View>


		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "white",
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
	content: {
		flex: 1,
		paddingTop: 20,
	},
	headerActions: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		marginBottom: 20,
	},
	title: {
		fontSize: 24,
		fontWeight: "bold",
		color: "#333",
		flex: 1,
	},
	scanButton: {
		backgroundColor: "#28a745",
		paddingVertical: 8,
		paddingHorizontal: 16,
		borderRadius: 20,
		...(Platform.OS === "web"
			? { boxShadow: "0px 4px 12px rgba(40,167,69,0.3)" }
			: { elevation: 4 }),
	},
	scanButtonText: {
		color: "#fff",
		fontSize: 14,
		fontWeight: "600",
	},
	backButton: {
		backgroundColor: "#6c757d",
		paddingVertical: 12,
		paddingHorizontal: 32,
		borderRadius: 20,
		alignItems: "center",
		...(Platform.OS === "web"
			? { boxShadow: "0px 6px 16px rgba(108,117,125,0.3)" }
			: { elevation: 4 }),
	},
	backButtonText: {
		color: "#fff",
		fontSize: 16,
		fontWeight: "600",
	},
	
	// Estilos para códigos almacenados
	loadingContainer: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		paddingVertical: 40,
	},
	loadingText: {
		fontSize: 16,
		color: "#666",
	},
	codesList: {
		flex: 1,
		marginTop: 20,
	},
	codeCard: {
		backgroundColor: "#fff",
		borderRadius: 12,
		padding: 16,
		marginBottom: 12,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.1,
		shadowRadius: 4,
		elevation: 3,
		borderWidth: 1,
		borderColor: "#f0f0f0",
	},
	codeHeader: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		marginBottom: 12,
	},
	serverName: {
		fontSize: 18,
		fontWeight: "600",
		color: "#333",
		flex: 1,
	},
	typeTag: {
		paddingHorizontal: 8,
		paddingVertical: 4,
		borderRadius: 6,
	},
	otpTag: {
		backgroundColor: "#e8f5e8",
	},
	kuserTag: {
		backgroundColor: "#e8f0ff",
	},
	typeTagText: {
		fontSize: 12,
		fontWeight: "600",
		color: "#00A86B",
	},
	codeContent: {
		flexDirection: "row",
		alignItems: "center",
		marginBottom: 12,
	},
	codeValue: {
		fontSize: 24,
		fontWeight: "700",
		color: "#333",
		flex: 1,
		fontFamily: "monospace",
	},
	copyButton: {
		padding: 8,
		marginLeft: 12,
	},
	copyButtonText: {
		fontSize: 18,
	},
	codeActions: {
		flexDirection: "row",
		gap: 8,
		marginBottom: 8,
	},
	actionButton: {
		paddingHorizontal: 16,
		paddingVertical: 8,
		borderRadius: 8,
		flex: 1,
		alignItems: "center",
	},
	activateButton: {
		backgroundColor: "#ff4444",
	},
	approveButton: {
		backgroundColor: "#333",
	},
	deleteButton: {
		backgroundColor: "#666",
		flex: 0,
		paddingHorizontal: 12,
	},
	actionButtonText: {
		color: "#fff",
		fontWeight: "600",
		fontSize: 14,
	},
	codeInfo: {
		fontSize: 12,
		color: "#666",
		textAlign: "center",
	},
	emptyContainer: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		paddingVertical: 60,
	},
	emptyText: {
		fontSize: 18,
		fontWeight: "600",
		color: "#666",
		marginBottom: 8,
	},
	emptySubtext: {
		fontSize: 14,
		color: "#999",
		textAlign: "center",
	},
});
