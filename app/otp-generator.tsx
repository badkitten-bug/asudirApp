"use client";
import { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Alert, Image, type ImageSourcePropType, ScrollView } from "react-native";
import { useRouter } from "expo-router";

interface OTPServer {
	id: string;
	name: string;
	secretKey: string;
	otpCode: string;
	timeLeft: number;
}

export default function OTPGeneratorScreen() {
	const router = useRouter();
	
	const [servers, setServers] = useState<OTPServer[]>([
		{
			id: "1",
			name: "Servidor XYZ",
			secretKey: "ACSD-23556-38494",
			otpCode: "",
			timeLeft: 30
		}
	]);
	const [searchQuery, setSearchQuery] = useState("");
	const [showAddModal, setShowAddModal] = useState(false);
	const [newServerName, setNewServerName] = useState("");
	const [newSecretKey, setNewSecretKey] = useState("");

	const logo: ImageSourcePropType = require("@/assets/images/icon.png");

	// Función para generar código OTP basado en TOTP (Time-based One-Time Password)
	const generateOTP = (secret: string, timeStep: number): string => {
		if (!secret) return "";
		
		// Convertir el tiempo actual a steps de 30 segundos
		const time = Math.floor(Date.now() / 1000 / timeStep);
		
		// Crear un hash simple basado en el secret y el tiempo
		// En una implementación real usarías HMAC-SHA1
		const hash = btoa(secret + time.toString()).replace(/\D/g, '');
		
		// Tomar los últimos 6 dígitos
		const otp = hash.slice(-6).padStart(6, '0');
		return otp;
	};

	// Timer que se ejecuta cada segundo para todos los servidores
	useEffect(() => {
		const updateServers = () => {
			setServers(prevServers => 
				prevServers.map(server => {
					const newTimeLeft = server.timeLeft <= 1 ? 30 : server.timeLeft - 1;
					const newOtpCode = server.timeLeft <= 1 ? generateOTP(server.secretKey, 30) : server.otpCode;
					
					return {
						...server,
						timeLeft: newTimeLeft,
						otpCode: newOtpCode
					};
				})
			);
		};

		const interval = setInterval(updateServers, 1000);
		return () => clearInterval(interval);
	}, []);

	// Generar OTP inicial para todos los servidores
	useEffect(() => {
		setServers(prevServers => 
			prevServers.map(server => ({
				...server,
				otpCode: generateOTP(server.secretKey, 30)
			}))
		);
	}, []);

	const handleAddServer = () => {
		if (!newServerName.trim()) {
			Alert.alert("Error", "Por favor ingrese un nombre para el servidor");
			return;
		}
		if (!newSecretKey.trim()) {
			Alert.alert("Error", "Por favor ingrese una semilla");
			return;
		}
		
		const newServer: OTPServer = {
			id: Date.now().toString(),
			name: newServerName.trim(),
			secretKey: newSecretKey.trim(),
			otpCode: generateOTP(newSecretKey.trim(), 30),
			timeLeft: 30
		};
		
		setServers(prevServers => [...prevServers, newServer]);
		setNewServerName("");
		setNewSecretKey("");
		setShowAddModal(false);
	};

	const copyToClipboard = (otpCode: string, serverName: string) => {
		Alert.alert("Copiado", `Código OTP de ${serverName}: ${otpCode}`);
	};

	const filteredServers = servers.filter(server => 
		server.name.toLowerCase().includes(searchQuery.toLowerCase())
	);

	return (
		<View style={styles.container}>
			<View style={styles.header}>
				<Image source={logo} style={styles.logo} resizeMode="contain" />
			</View>

			<View style={styles.content}>
				<View style={styles.headerActions}>
					<Text style={styles.title}>Códigos de Autenticación</Text>
					<TouchableOpacity 
						style={styles.addButton} 
						onPress={() => setShowAddModal(true)}
					>
						<Text style={styles.addButtonText}>➕ Agregar</Text>
					</TouchableOpacity>
				</View>

				<View style={styles.searchContainer}>
					<TextInput
						style={styles.searchInput}
						value={searchQuery}
						onChangeText={setSearchQuery}
						placeholder="Buscar servidores..."
						placeholderTextColor="#999"
					/>
				</View>

				<ScrollView style={styles.serversList}>
					{filteredServers.map((server) => (
						<View key={server.id} style={styles.serverCard}>
							<View style={styles.serverHeader}>
								<Text style={styles.serverName}>{server.name}</Text>
								<View style={styles.otpTag}>
									<Text style={styles.otpTagText}>OTP</Text>
								</View>
							</View>
							<View style={styles.serverContent}>
								<Text style={styles.otpCode}>{server.otpCode}</Text>
								<TouchableOpacity 
									style={styles.copyButton} 
									onPress={() => copyToClipboard(server.otpCode, server.name)}
								>
									<Text style={styles.copyIcon}>📋</Text>
								</TouchableOpacity>
							</View>
							<Text style={styles.timer}>Tiempo restante: {server.timeLeft}s</Text>
						</View>
					))}
				</ScrollView>

				<TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
					<Text style={styles.backButtonText}>← Volver</Text>
				</TouchableOpacity>
			</View>

			{/* Modal para agregar servidor */}
			{showAddModal && (
				<View style={styles.modalOverlay}>
					<View style={styles.modal}>
						<View style={styles.modalHeader}>
							<Text style={styles.modalTitle}>Agregar Servidor</Text>
							<TouchableOpacity onPress={() => setShowAddModal(false)}>
								<Text style={styles.closeButton}>✕</Text>
							</TouchableOpacity>
						</View>
						
						<View style={styles.inputContainer}>
							<Text style={styles.inputLabel}>Nombre del Servidor</Text>
							<TextInput
								style={styles.input}
								value={newServerName}
								onChangeText={setNewServerName}
								placeholder="Ej: Servidor ABC"
							/>
						</View>

						<View style={styles.inputContainer}>
							<Text style={styles.inputLabel}>Semilla (Secret Key)</Text>
							<TextInput
								style={styles.input}
								value={newSecretKey}
								onChangeText={setNewSecretKey}
								placeholder="Ej: ACSD-23556-38494"
							/>
						</View>

						<TouchableOpacity style={styles.addServerButton} onPress={handleAddServer}>
							<Text style={styles.addServerButtonText}>Agregar Servidor</Text>
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
		paddingHorizontal: 24
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
	addButton: {
		backgroundColor: "#1E78C6",
		paddingVertical: 8,
		paddingHorizontal: 16,
		borderRadius: 6,
	},
	addButtonText: {
		color: "#fff",
		fontSize: 14,
		fontWeight: "600",
	},
	searchContainer: {
		marginBottom: 20,
	},
	searchInput: {
		borderWidth: 1,
		borderColor: "#ddd",
		borderRadius: 8,
		paddingHorizontal: 16,
		paddingVertical: 12,
		fontSize: 16,
		backgroundColor: "#f8f9fa",
	},
	serversList: {
		flex: 1,
		marginBottom: 20,
	},
	serverCard: {
		backgroundColor: "#fff",
		borderRadius: 12,
		padding: 16,
		marginBottom: 12,
		borderWidth: 1,
		borderColor: "#e9ecef",
		shadowColor: "#000",
		shadowOffset: {
			width: 0,
			height: 2,
		},
		shadowOpacity: 0.1,
		shadowRadius: 3.84,
		elevation: 5,
	},
	serverHeader: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		marginBottom: 12,
	},
	serverName: {
		fontSize: 16,
		fontWeight: "600",
		color: "#333",
		flex: 1,
	},
	otpTag: {
		backgroundColor: "#28a745",
		paddingHorizontal: 8,
		paddingVertical: 4,
		borderRadius: 4,
	},
	otpTagText: {
		color: "#fff",
		fontSize: 12,
		fontWeight: "600",
	},
	serverContent: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		marginBottom: 8,
	},
	otpCode: {
		fontSize: 28,
		fontWeight: "bold",
		color: "#1E78C6",
		letterSpacing: 2,
		flex: 1,
	},
	copyButton: {
		padding: 8,
	},
	copyIcon: {
		fontSize: 20,
	},
	timer: {
		fontSize: 14,
		color: "#666",
	},
	backButton: {
		backgroundColor: "#6c757d",
		paddingVertical: 12,
		paddingHorizontal: 32,
		borderRadius: 8,
		alignItems: "center",
	},
	backButtonText: {
		color: "#fff",
		fontSize: 16,
		fontWeight: "600",
	},
	// Estilos del modal
	modalOverlay: {
		position: "absolute",
		top: 0,
		left: 0,
		right: 0,
		bottom: 0,
		backgroundColor: "rgba(0,0,0,0.5)",
		justifyContent: "center",
		alignItems: "center",
	},
	modal: {
		backgroundColor: "#fff",
		borderRadius: 12,
		padding: 20,
		width: "90%",
		maxWidth: 400,
	},
	modalHeader: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		marginBottom: 20,
	},
	modalTitle: {
		fontSize: 18,
		fontWeight: "bold",
		color: "#333",
	},
	closeButton: {
		fontSize: 24,
		color: "#666",
	},
	inputContainer: {
		marginBottom: 16,
	},
	inputLabel: {
		fontSize: 14,
		fontWeight: "600",
		color: "#333",
		marginBottom: 8,
	},
	input: {
		borderWidth: 1,
		borderColor: "#ddd",
		borderRadius: 8,
		paddingHorizontal: 12,
		paddingVertical: 10,
		fontSize: 16,
		color: "#333",
		backgroundColor: "#fff",
	},
	addServerButton: {
		backgroundColor: "#1E78C6",
		paddingVertical: 12,
		paddingHorizontal: 24,
		borderRadius: 8,
		alignItems: "center",
		marginTop: 8,
	},
	addServerButtonText: {
		color: "#fff",
		fontSize: 16,
		fontWeight: "600",
	},
});
