"use client";
import { View, Text, StyleSheet, TouchableOpacity, Image, type ImageSourcePropType } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

export default function QRDisplayScreen() {
	const router = useRouter();

	const bg: ImageSourcePropType = require("@/assets/images/bg.png");
	const logo: ImageSourcePropType = require("@/assets/images/icon.png");
	const qrImg: ImageSourcePropType = require("@/assets/images/qr-image.png");

	const handleScanQR = () => {
		router.push("/qr-scanner");
	};

	return (
		<View style={styles.container}>
			<Image source={logo} style={styles.logo} resizeMode="contain" />
			<View style={styles.heroWrap}>
				<Image source={bg} style={styles.hero} resizeMode="contain" />
				<Image source={qrImg} style={styles.qr} resizeMode="contain" />
			</View>

			<Text style={styles.instruction}>
				Por favor, escanee el código QR para iniciar el proceso de verificación de identidad
			</Text>

			<TouchableOpacity style={styles.button} onPress={handleScanQR}>
				<Text style={styles.buttonText}>Escanear QR</Text>
			</TouchableOpacity>
		</View>
	);
}

const styles = StyleSheet.create({
	container: { 
		flex: 1, 
		justifyContent: "flex-start", 
		alignItems: "center", 
		backgroundColor: "#fff", 
		paddingHorizontal: 24 
	},
	logo: { 
		width: 160, 
		height: 80, 
		marginTop: 24 
	},
	heroWrap: { 
		width: "86%", 
		height: 280, 
		marginTop: 12, 
		position: "relative" 
	},
	hero: { 
		width: "100%", 
		height: "100%" 
	},
	qr: { 
		position: "absolute", 
		left: 0, 
		right: 0, 
		top: 0, 
		bottom: 0, 
		width: "100%", 
		height: "100%" 
	},
	instruction: {
		fontSize: 16,
		color: "#333",
		textAlign: "center",
		marginTop: 18,
		marginBottom: 30,
		lineHeight: 24,
	},
	button: {
		backgroundColor: "#1E78C6",
		paddingVertical: 16,
		paddingHorizontal: 32,
		borderRadius: 8,
		minWidth: 200,
	},
	buttonText: {
		color: "white",
		fontSize: 16,
		fontWeight: "600",
		textAlign: "center",
	},
});
