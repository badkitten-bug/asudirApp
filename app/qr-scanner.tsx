"use client";
import { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image, Platform, type ImageSourcePropType } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

export default function QRScannerScreen() {
	const router = useRouter();
	const [scanned, setScanned] = useState(false);

	const simulateScan = () => {
		setScanned(true);
		setTimeout(() => router.push("/requirements"), 600);
	};

	const bg: ImageSourcePropType = require("@/assets/images/bg.png");
	const logo: ImageSourcePropType = require("@/assets/images/icon.png");
	const qrImg: ImageSourcePropType = require("@/assets/images/qr-image.png");

	return (
		<View style={styles.container}>
			<View style={styles.header}>
				<View style={styles.logoContainer}>
					<View style={styles.logoBox}>
						<Text style={styles.logoText}>AM</Text>
					</View>
					<Text style={styles.companyText}>3xADDRESS.com</Text>
				</View>
			</View>

			<View style={styles.cameraView}>
				<View style={styles.scanFrame}>
					<View style={styles.corner} />
					<View style={[styles.corner, styles.topRight]} />
					<View style={[styles.corner, styles.bottomLeft]} />
					<View style={[styles.corner, styles.bottomRight]} />
				</View>
			</View>

			<TouchableOpacity style={styles.button} onPress={simulateScan}>
				<Text style={styles.buttonText}>{scanned ? "Procesando..." : "Escanear QR"}</Text>
			</TouchableOpacity>
		</View>
	);
}

const styles = StyleSheet.create({
	container: { 
		flex: 1, 
		backgroundColor: "white" 
	},
	header: {
		paddingTop: 60,
		paddingHorizontal: 20,
		alignItems: "center",
	},
	logoContainer: {
		alignItems: "center",
	},
	logoBox: {
		width: 80,
		height: 50,
		backgroundColor: "#1E78C6",
		borderRadius: 6,
		justifyContent: "center",
		alignItems: "center",
		marginBottom: 8,
	},
	logoText: {
		fontSize: 20,
		fontWeight: "bold",
		color: "white",
	},
	companyText: {
		fontSize: 14,
		color: "#1E78C6",
		fontWeight: "500",
	},
	cameraView: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		backgroundColor: "#f0f0f0",
		margin: 20,
		borderRadius: 12,
	},
	scanFrame: {
		width: 200,
		height: 200,
		position: "relative",
	},
	corner: {
		position: "absolute",
		width: 30,
		height: 30,
		borderColor: "#1E78C6",
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
	button: { 
		margin: 20, 
		backgroundColor: "#1E78C6", 
		paddingVertical: 16, 
		paddingHorizontal: 32, 
		borderRadius: 8,
		...(Platform.OS === 'web' ? { boxShadow: "0px 6px 12px rgba(2,17,42,0.25)" } : { elevation: 4 }) 
	},
	buttonText: { 
		color: "#fff", 
		fontWeight: "600",
		fontSize: 16,
		textAlign: "center"
	},
});
