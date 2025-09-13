"use client";
import {
	View,
	Text,
	StyleSheet,
	TouchableOpacity,
	Image,
	type ImageSourcePropType,
	Alert,
} from "react-native";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

const QUICK_ACCESS_PIN_KEY = "@quick_access_pin";

export default function SuccessScreen() {
	const router = useRouter();

	const handleSetupQuickAccess = () => {
		Alert.alert(
			"🔐 Configurar Acceso Rápido",
			"¿Te gustaría configurar un PIN de 6 dígitos para acceder más rápidamente la próxima vez?\n\nEsto te evitará tener que ingresar DNI, email y OTP cada vez.",
			[
				{
					text: "Ahora no",
					style: "cancel",
					onPress: () => router.replace("/qr-scanner"),
				},
				{
					text: "Configurar PIN",
					onPress: () => router.replace("/quick-access"),
				},
			],
		);
	};

	const handleContinue = async () => {
		// Verificar si ya tiene PIN configurado
		const hasPin = await AsyncStorage.getItem(QUICK_ACCESS_PIN_KEY);

		if (hasPin) {
			// Ya tiene PIN, ir directo al scanner
			router.replace("/qr-scanner");
		} else {
			// Ofrecer configurar PIN
			handleSetupQuickAccess();
		}
	};

	const bg: ImageSourcePropType = require("@/assets/images/bg.png");
	const logo: ImageSourcePropType = require("@/assets/images/icon.png");
	const qrImg: ImageSourcePropType = require("@/assets/images/qr-image.png");
	return (
		<View style={styles.container}>
			<Image source={logo} style={styles.logo} resizeMode="contain" />
			<View style={styles.heroWrap}>
				<Image source={bg} style={styles.hero} resizeMode="contain" />
				<Image source={qrImg} style={styles.qr} resizeMode="contain" />
			</View>

			<View style={styles.modal}>
				<View style={styles.modalHeader}>
					<Text style={styles.entity}>Banco Tu Dinero SAC</Text>
					<TouchableOpacity onPress={() => router.replace("/splash")}>
						<Text style={{ fontSize: 20 }}>✕</Text>
					</TouchableOpacity>
				</View>

				<View style={styles.successContainer}>
					<View style={styles.successIcon}>
						<Text style={{ fontSize: 32 }}>✅</Text>
					</View>
					<Text style={styles.title}>Datos presentados correctamente</Text>

					<TouchableOpacity
						style={styles.continueButton}
						onPress={handleContinue}
					>
						<Text style={styles.continueButtonText}>Continuar</Text>
					</TouchableOpacity>
				</View>
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "#fff",
		alignItems: "center",
	},
	logo: {
		width: 160,
		height: 80,
		marginTop: 50,
	},
	heroWrap: {
		width: "86%",
		height: 280,
		marginTop: 12,
		position: "relative",
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
	modal: {
		position: "absolute",
		left: 0,
		right: 0,
		bottom: 0,
		backgroundColor: "#fff",
		borderTopLeftRadius: 24,
		borderTopRightRadius: 24,
		padding: 24,
		paddingBottom: 40,
		minHeight: 200,
	},
	modalHeader: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		marginBottom: 20,
	},
	entity: {
		fontSize: 16,
		fontWeight: "700",
		color: "#111827",
	},
	successContainer: {
		alignItems: "center",
	},
	successIcon: {
		width: 60,
		height: 60,
		backgroundColor: "#1E78C6",
		borderRadius: 30,
		justifyContent: "center",
		alignItems: "center",
		marginBottom: 16,
	},
	title: {
		fontSize: 18,
		fontWeight: "700",
		textAlign: "center",
		color: "#1E78C6",
		marginBottom: 20,
	},
	continueButton: {
		backgroundColor: "#1E78C6",
		paddingVertical: 14,
		paddingHorizontal: 32,
		borderRadius: 25,
		marginTop: 10,
	},
	continueButtonText: {
		color: "#fff",
		fontSize: 16,
		fontWeight: "600",
		textAlign: "center",
	},
});
