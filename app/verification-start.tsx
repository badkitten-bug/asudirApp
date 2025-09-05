"use client";
import { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image, type ImageSourcePropType } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

export default function VerificationStartScreen() {
	const router = useRouter();
	const [termsAccepted, setTermsAccepted] = useState(false);

	const bg: ImageSourcePropType = require("@/assets/images/identify.png");
	const logo: ImageSourcePropType = require("@/assets/images/icon.png");

	const handleStartVerification = () => {
		if (termsAccepted) {
			router.push("/personal-data");
		}
	};

	return (
		<View style={styles.container}>
			<Image source={logo} style={styles.logo} resizeMode="contain" />
			<View style={styles.heroWrap}>
				<Image source={bg} style={styles.hero} resizeMode="contain" />
			</View>

			<Text style={styles.title}>Por favor, verifique su identidad</Text>

			<TouchableOpacity 
				style={styles.checkboxContainer} 
				onPress={() => setTermsAccepted(!termsAccepted)}
			>
				<View style={[styles.checkbox, termsAccepted && styles.checkboxChecked]}>
					{termsAccepted && <Ionicons name="checkmark" size={16} color="white" />}
				</View>
				<Text style={styles.checkboxText}>Acepto términos y condiciones</Text>
			</TouchableOpacity>

			<TouchableOpacity 
				style={[styles.button, !termsAccepted && styles.buttonDisabled]} 
				onPress={handleStartVerification}
				disabled={!termsAccepted}
			>
				<Text style={styles.buttonText}>Iniciar verificación</Text>
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
	title: {
		fontSize: 18,
		fontWeight: "600",
		color: "#333",
		textAlign: "center",
		marginTop: 18,
		marginBottom: 30,
	},
	checkboxContainer: {
		flexDirection: "row",
		alignItems: "center",
		marginBottom: 30,
	},
	checkbox: {
		width: 20,
		height: 20,
		borderWidth: 2,
		borderColor: "#1E78C6",
		borderRadius: 4,
		marginRight: 12,
		justifyContent: "center",
		alignItems: "center",
	},
	checkboxChecked: {
		backgroundColor: "#1E78C6",
	},
	checkboxText: {
		fontSize: 16,
		color: "#333",
	},
	button: {
		backgroundColor: "#1E78C6",
		paddingVertical: 16,
		paddingHorizontal: 32,
		borderRadius: 8,
		minWidth: 200,
	},
	buttonDisabled: {
		backgroundColor: "#ccc",
	},
	buttonText: {
		color: "white",
		fontSize: 16,
		fontWeight: "600",
		textAlign: "center",
	},
});
