"use client";
import {
	StyleSheet,
	View,
	Text,
	TouchableOpacity,
	ScrollView,
	StatusBar as RNStatusBar,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { useSelector } from "react-redux";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { showSnackbar } from "../../store/snackbarSlice";
import Constants from "expo-constants";
import { useDispatch, type RootState } from "../../store";

const STATUSBAR_HEIGHT = Constants.statusBarHeight || 0;

export default function ControlPanel() {
	const _user = useSelector((state: RootState) => state.auth.user);
	const router = useRouter();
	const dispatch = useDispatch();

	const handleScanQR = () => {
		router.push("/(tabs)/qr-scanner");
		dispatch(
			showSnackbar({
				message: "Escanea el código QR para verificar tu identidad",
				type: "info",
				duration: 3000,
			}),
		);
	};

	const handlePresentIdentity = () => {
		router.push("/(tabs)/present-identity");
		dispatch(
			showSnackbar({
				message: "Presenta tu identidad digital",
				type: "info",
				duration: 3000,
			}),
		);
	};

	return (
		<View style={styles.container}>
			{/* Configuración del StatusBar nativo */}
			<RNStatusBar
				backgroundColor="#f5f5f5"
				barStyle="dark-content"
				translucent={true}
			/>

			{/* StatusBar de Expo como respaldo */}
			<StatusBar style="dark" />

			{/* Espacio para el StatusBar */}
			<View style={{ height: STATUSBAR_HEIGHT, backgroundColor: "#f5f5f5" }} />

			<View style={styles.header}>
				<Text style={styles.headerTitle}>Verificación de Identidad</Text>
			</View>

			<ScrollView
				style={styles.content}
				contentContainerStyle={styles.contentContainer}
			>
				<TouchableOpacity style={styles.scanQRButton} onPress={handleScanQR}>
					<Text style={{ fontSize: 20 }}>📱</Text>
					<Text style={styles.scanQRText}>Escanear QR</Text>
				</TouchableOpacity>

				<TouchableOpacity
					style={styles.presentIdentityButton}
					onPress={handlePresentIdentity}
				>
					<Text style={{ fontSize: 20 }}>👤</Text>
					<Text style={styles.presentIdentityText}>Presentar Identidad</Text>
				</TouchableOpacity>

				<View style={styles.card}>
					<View style={styles.cardHeader}>
						<Text style={styles.cardTitle}>Estado de Verificación</Text>
						<Text style={{ fontSize: 24 }}>✅</Text>
					</View>
					<Text style={[styles.cardValue, styles.verifiedValue]}>
						Verificado
					</Text>
					<Text style={styles.cardSubtitle}>Tu identidad está verificada</Text>
				</View>

				<View style={styles.card}>
					<View style={styles.cardHeader}>
						<Text style={styles.cardTitle}>Verificaciones Recientes</Text>
						<Text style={{ fontSize: 24 }}>⏰</Text>
					</View>
					<Text style={[styles.cardValue, styles.recentValue]}>0</Text>
					<Text style={styles.cardSubtitle}>Verificaciones este mes</Text>
				</View>
			</ScrollView>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "#f5f5f5",
	},
	header: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		paddingHorizontal: 16,
		paddingVertical: 12,
		backgroundColor: "#f5f5f5",
	},
	headerTitle: {
		fontSize: 20,
		fontWeight: "bold",
	},
	menuButton: {
		padding: 4,
	},
	content: {
		flex: 1,
	},
	contentContainer: {
		padding: 16,
		paddingBottom: 32,
	},
	scanQRButton: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		backgroundColor: "#1E78C6",
		borderRadius: 8,
		paddingVertical: 12,
		paddingHorizontal: 16,
		marginBottom: 16,
	},
	scanQRText: {
		color: "white",
		fontWeight: "bold",
		marginLeft: 8,
	},
	presentIdentityButton: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		backgroundColor: "#007BFF",
		borderRadius: 8,
		paddingVertical: 12,
		paddingHorizontal: 16,
		marginBottom: 16,
	},
	presentIdentityText: {
		color: "white",
		fontWeight: "bold",
		marginLeft: 8,
	},
	card: {
		backgroundColor: "white",
		borderRadius: 12,
		padding: 16,
		marginBottom: 16,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.1,
		shadowRadius: 4,
		elevation: 2,
	},
	cardHeader: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		marginBottom: 8,
	},
	cardTitle: {
		fontSize: 16,
		fontWeight: "bold",
	},
	cardValue: {
		fontSize: 28,
		fontWeight: "bold",
		marginVertical: 4,
	},
	verifiedValue: {
		color: "#1E78C6",
	},
	recentValue: {
		color: "#1E78C6",
	},
	cardSubtitle: {
		color: "#666",
		fontSize: 14,
	},
});
