"use client";
import { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Image, type ImageSourcePropType, Alert } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { sendOTP, getDeviceIMEI } from "@/services/api";
import LoadingButton from "@/components/LoadingButton";
import { useDispatch } from "@/store";
import { setPersonalData, setOTPSent } from "@/store/userSlice";

export default function PersonalDataScreen() {
	const router = useRouter();
	const dispatch = useDispatch();
	const [dni, setDni] = useState("");
	const [email, setEmail] = useState("");
	const [isLoading, setIsLoading] = useState(false);

	const bg: ImageSourcePropType = require("@/assets/images/identify.png");
	const logo: ImageSourcePropType = require("@/assets/images/icon.png");

	const handleVerify = async () => {
		if (!dni.trim() || !email.trim()) {
			Alert.alert("Error", "Por favor complete todos los campos");
			return;
		}

		// Validar formato de email
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		if (!emailRegex.test(email)) {
			Alert.alert("Error", "Por favor ingrese un email válido");
			return;
		}

		// Validar formato de DNI (8 dígitos)
		if (!/^\d{8}$/.test(dni)) {
			Alert.alert("Error", "El DNI debe tener 8 dígitos");
			return;
		}

		setIsLoading(true);

		try {
			// Obtener IMEI del dispositivo
			const imei = await getDeviceIMEI();
			console.log('IMEI obtenido:', imei);
			
			// Guardar datos en Redux
			dispatch(setPersonalData({
				dni: dni.trim(),
				email: email.trim(),
				imei: imei
			}));
			
			console.log('Enviando OTP...', { email: email.trim(), dni: dni.trim(), imei });
			
			// Enviar OTP
			const response = await sendOTP({
				email: email.trim(),
				dni: dni.trim(),
				imei: imei
			});

			console.log('Respuesta del API:', response);

			// Marcar OTP como enviado
			dispatch(setOTPSent(true));

			// Navegar directamente sin alerta para probar
			console.log('Navegando directamente a activation-code...');
			router.push("/activation-code");
			
			// Comentado temporalmente para probar navegación directa
			/*
			Alert.alert(
				"Código enviado", 
				"Se ha enviado un código de verificación a tu email. Por favor revisa tu bandeja de entrada.",
				[
					{
						text: "Continuar",
						onPress: () => {
							console.log('Navegando a activation-code...');
							router.push("/activation-code");
						}
					}
				]
			);
			*/
		} catch (error) {
			console.error('Error sending OTP:', error);
			Alert.alert(
				"Error", 
				"No se pudo enviar el código de verificación. Por favor intenta nuevamente.",
				[{ text: "OK" }]
			);
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<View style={styles.container}>
			<Image source={logo} style={styles.logo} resizeMode="contain" />
			<View style={styles.heroWrap}>
				<Image source={bg} style={styles.hero} resizeMode="contain" />
			</View>

			<View style={styles.modal}>
				<View style={styles.modalHeader}>
					<Text style={styles.modalTitle}>Ingrese sus datos personales</Text>
					<TouchableOpacity onPress={() => router.back()}>
						<Text style={{ fontSize: 24 }}>✕</Text>
					</TouchableOpacity>
				</View>

				<View style={styles.inputContainer}>
					<Text style={styles.inputLabel}>DNI</Text>
					<TextInput
						style={styles.input}
						value={dni}
						onChangeText={setDni}
						placeholder="Ingrese su DNI"
						keyboardType="numeric"
					/>
				</View>

				<View style={styles.inputContainer}>
					<Text style={styles.inputLabel}>Email</Text>
					<TextInput
						style={styles.input}
						value={email}
						onChangeText={setEmail}
						placeholder="Ingrese su email"
						keyboardType="email-address"
						autoCapitalize="none"
					/>
				</View>

				<LoadingButton
					onPress={handleVerify}
					disabled={!dni.trim() || !email.trim()}
					loading={isLoading}
					title="Verificar"
					loadingTitle="Enviando código..."
					style={styles.button}
					textStyle={styles.buttonText}
				/>
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
	modal: { 
		position: "absolute", 
		left: 0, 
		right: 0, 
		bottom: 0, 
		backgroundColor: "#fff", 
		borderTopLeftRadius: 24, 
		borderTopRightRadius: 24, 
		padding: 24,
		minHeight: 300,
	},
	modalHeader: { 
		flexDirection: "row", 
		justifyContent: "space-between", 
		alignItems: "center", 
		marginBottom: 20 
	},
	modalTitle: { 
		fontSize: 18, 
		fontWeight: "600", 
		color: "#333" 
	},
	inputContainer: { 
		marginBottom: 20 
	},
	inputLabel: { 
		fontSize: 16, 
		fontWeight: "500", 
		color: "#333", 
		marginBottom: 8 
	},
	input: { 
		borderWidth: 2, 
		borderColor: "#E3F2FD", 
		borderRadius: 8, 
		paddingHorizontal: 16, 
		paddingVertical: 12, 
		fontSize: 16, 
		color: "#333" 
	},
	button: { 
		backgroundColor: "#1E78C6", 
		paddingVertical: 16, 
		borderRadius: 8, 
		marginTop: 10 
	},
	buttonDisabled: { 
		backgroundColor: "#ccc" 
	},
	buttonText: { 
		color: "#fff", 
		fontSize: 16, 
		fontWeight: "600", 
		textAlign: "center" 
	},
});
