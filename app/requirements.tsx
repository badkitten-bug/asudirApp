"use client";
import { View, Text, StyleSheet, TouchableOpacity, Image, Platform, type ImageSourcePropType } from "react-native";
import { useRouter } from "expo-router";

export default function RequirementsScreen() {
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
					<TouchableOpacity onPress={() => router.back()}>
						<Text style={{ fontSize: 20 }}>✕</Text>
					</TouchableOpacity>
				</View>
				<Text style={styles.subtitle}>Está solicitando que le presentes esta información:</Text>

				<View style={styles.itemRow}>
					<Text style={{ fontSize: 18 }}>⏳</Text>
					<Text style={styles.itemText}>Verificación biométrica</Text>
				</View>
				<View style={styles.itemRow}>
					<Text style={{ fontSize: 18 }}>✅</Text>
					<Text style={styles.itemText}>Número de documento de identidad</Text>
				</View>
				<View style={styles.itemRow}>
					<Text style={{ fontSize: 18 }}>✅</Text>
					<Text style={styles.itemText}>Email</Text>
				</View>

				<TouchableOpacity style={styles.button} onPress={() => router.push("/biometric")}> 
					<Text style={styles.buttonText}>Aceptar</Text>
				</TouchableOpacity>
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	container: { 
		flex: 1, 
		backgroundColor: "#fff", 
		alignItems: "center",
		paddingHorizontal: 24
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
		...(Platform.OS === 'web' ? { boxShadow: "0px 8px 24px rgba(0,0,0,0.15)" } : { shadowColor: "#000", shadowOpacity: 0.15, shadowRadius: 12, shadowOffset: { width: 0, height: 6 }, elevation: 6 })
	},
	modalHeader: { 
		flexDirection: "row", 
		justifyContent: "space-between", 
		alignItems: "center", 
		marginBottom: 10 
	},
	entity: { 
		fontSize: 16, 
		fontWeight: "700", 
		color: "#111827" 
	},
	subtitle: { 
		color: "#334155", 
		marginBottom: 12 
	},
	itemRow: { 
		flexDirection: "row", 
		alignItems: "center", 
		gap: 8, 
		marginBottom: 10 
	},
	itemText: { 
		color: "#111827" 
	},
	button: { 
		marginTop: 10, 
		backgroundColor: "#1E78C6", 
		paddingVertical: 14, 
		borderRadius: 10, 
		alignItems: "center",
		...(Platform.OS === 'web' ? { boxShadow: "0px 6px 12px rgba(2,17,42,0.25)" } : { elevation: 4 }) 
	},
	buttonText: { 
		color: "#fff", 
		fontWeight: "700", 
		fontSize: 16 
	},
});
