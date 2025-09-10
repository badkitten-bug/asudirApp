"use client";
import { View, Text, StyleSheet, TouchableOpacity, Image, type ImageSourcePropType } from "react-native";
import { useRouter } from "expo-router";

export default function SuccessScreen() {
	const router = useRouter();
	
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
				</View>
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	container: { 
		flex: 1, 
		backgroundColor: "#fff", 
		alignItems: "center" 
	},
	logo: { 
		width: 160, 
		height: 80, 
		marginTop: 50 
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
	},
});
