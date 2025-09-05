"use client";
import { useState, useRef } from "react";
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Image, type ImageSourcePropType, Alert } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { createAccount } from "@/services/api";
import { useDispatch, useSelector } from "@/store";
import { setOTPVerified, setAccountData } from "@/store/userSlice";
import LoadingButton from "@/components/LoadingButton";

export default function ActivationCodeScreen() {
	const router = useRouter();
	const dispatch = useDispatch();
	const { email, imei } = useSelector((state) => state.user);
	const [code, setCode] = useState(["", "", "", "", "", ""]);
	const [isLoading, setIsLoading] = useState(false);
	const inputRefs = useRef<(TextInput | null)[]>([]);

	const bg: ImageSourcePropType = require("@/assets/images/identify.png");
	const logo: ImageSourcePropType = require("@/assets/images/icon.png");

	const handleCodeChange = (value: string, index: number) => {
		// Solo permitir números
		const numericValue = value.replace(/[^0-9]/g, '');
		
		const newCode = [...code];
		newCode[index] = numericValue;
		setCode(newCode);

		// Auto-focus next input si se ingresó un dígito
		if (numericValue && index < 5) {
			inputRefs.current[index + 1]?.focus();
		}
	};

	const handleKeyPress = (key: string, index: number) => {
		// Si se presiona backspace y el campo está vacío, ir al anterior
		if (key === 'Backspace' && code[index] === '' && index > 0) {
			inputRefs.current[index - 1]?.focus();
		}
	};

	const handleVerify = async () => {
		if (!code.every(digit => digit !== "")) {
			Alert.alert("Error", "Por favor complete todos los dígitos del código");
			return;
		}

		if (!email || !imei) {
			Alert.alert("Error", "Datos de usuario no encontrados. Por favor regrese a la pantalla anterior.");
			return;
		}

		setIsLoading(true);

		try {
			const otpCode = code.join('');
			console.log('=== INICIANDO VERIFICACIÓN ===');
			console.log('Verificando OTP:', { email, otp: otpCode, imei });

			const response = await createAccount({
				email,
				otp: otpCode,
				imei
			});

			console.log('=== RESPUESTA RECIBIDA ===');
			console.log('Respuesta completa:', response);
			console.log('response.response:', response.response);
			console.log('isValid value:', response.response?.isValid);
			console.log('isValid type:', typeof response.response?.isValid);

			// Verificar si el OTP es válido
			console.log('=== VERIFICANDO VALIDEZ ===');
			const isValid = response.response?.isValid === 'true' || response.response?.isValid === true;
			console.log('isValid result:', isValid);
			
			if (isValid) {
				console.log('=== OTP VÁLIDO - PROCESANDO ÉXITO ===');
				
				// Guardar datos de la cuenta
				console.log('Guardando datos de cuenta...');
				dispatch(setAccountData({
					address: response.response.address,
					f1: response.response.f1
				}));
				console.log('Datos guardados:', { address: response.response.address, f1: response.response.f1 });

				// Marcar OTP como verificado
				console.log('Marcando OTP como verificado...');
				dispatch(setOTPVerified(true));
				console.log('OTP marcado como verificado');

				// Navegar directamente sin alerta para probar
				console.log('Navegando directamente a qr-display...');
				router.push("/qr-display");
				
				// Comentado temporalmente para probar navegación directa
				/*
				Alert.alert(
					"¡Cuenta creada exitosamente!",
					"Tu identidad digital está lista. Ahora puedes continuar con el proceso de verificación.",
					[
						{
							text: "Continuar",
							onPress: () => router.push("/qr-display")
						}
					]
				);
				*/
			} else {
				console.log('=== OTP INVÁLIDO ===');
				console.log('Mostrando alerta de código inválido');
				Alert.alert(
					"Código inválido",
					"El código OTP ingresado no es válido. Por favor verifica el código y intenta nuevamente.",
					[{ text: "OK" }]
				);
			}
		} catch (error) {
			console.log('=== ERROR EN VERIFICACIÓN ===');
			console.error('Error verifying OTP:', error);
			Alert.alert(
				"Error",
				"No se pudo verificar el código. Por favor intenta nuevamente.",
				[{ text: "OK" }]
			);
		} finally {
			console.log('=== FINALIZANDO VERIFICACIÓN ===');
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
					<Text style={styles.modalTitle}>Ingrese el código de 6 dígitos que se le ha enviado a su correo electrónico</Text>
					<TouchableOpacity onPress={() => router.back()}>
						<Ionicons name="close" size={24} color="#333" />
					</TouchableOpacity>
				</View>

				<View style={styles.codeContainer}>
					{code.map((digit, index) => (
						<TextInput
							key={`code-input-${index}`}
							ref={(ref) => (inputRefs.current[index] = ref)}
							style={styles.codeInput}
							value={digit}
							onChangeText={(value) => handleCodeChange(value, index)}
							onKeyPress={({ nativeEvent }) => handleKeyPress(nativeEvent.key, index)}
							keyboardType="numeric"
							maxLength={1}
							textAlign="center"
							autoFocus={index === 0}
							selectTextOnFocus
						/>
					))}
				</View>

				<LoadingButton
					onPress={handleVerify}
					disabled={!code.every(digit => digit !== "")}
					loading={isLoading}
					title="Verificar"
					loadingTitle="Verificando código..."
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
		fontSize: 16, 
		fontWeight: "600", 
		color: "#333", 
		flex: 1, 
		marginRight: 16 
	},
	codeContainer: { 
		flexDirection: "row", 
		justifyContent: "space-between", 
		marginBottom: 30,
		flexWrap: "wrap",
		gap: 8,
	},
	codeInput: { 
		width: 50, 
		height: 60, 
		borderWidth: 2, 
		borderColor: "#E3F2FD", 
		borderRadius: 8, 
		fontSize: 20, 
		fontWeight: "600", 
		color: "#333",
		backgroundColor: "#fff",
		shadowColor: "#000",
		shadowOffset: {
			width: 0,
			height: 2,
		},
		shadowOpacity: 0.1,
		shadowRadius: 3.84,
		elevation: 5,
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
