"use client";
import { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image, type ImageSourcePropType, Alert } from "react-native";
import { useRouter } from "expo-router";
import { createAccount } from "@/services/api";
import { useDispatch, useSelector } from "@/store";
import { setOTPVerified, setAccountData } from "@/store/userSlice";
import LoadingButton from "@/components/LoadingButton";
import { CodeField, Cursor, useClearByFocusCell } from "react-native-confirmation-code-field";

export default function ActivationCodeScreen() {
	const router = useRouter();
	const dispatch = useDispatch();
	const { email, imei } = useSelector((state) => state.user);
	const [otpCode, setOtpCode] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const [props, getCellOnLayoutHandler] = useClearByFocusCell({ value: otpCode, setValue: setOtpCode });

	const bg: ImageSourcePropType = require("@/assets/images/identify.png");
	const logo: ImageSourcePropType = require("@/assets/images/icon.png");

	const handleVerify = async () => {
		if (otpCode.length !== 6) {
			Alert.alert("Error", "Por favor complete todos los dígitos del código");
			return;
		}

		if (!email || !imei) {
			Alert.alert("Error", "Datos de usuario no encontrados. Por favor regrese a la pantalla anterior.");
			return;
		}

		setIsLoading(true);

		try {
			console.log('=== INICIANDO VERIFICACIÓN ===');
			console.log('Verificando OTP:', { email, otp: otpCode, imei });

			const response = await createAccount({
				email,
				otp: otpCode,
				imei
			});

			console.log('=== RESPUESTA RECIBIDA ===');
			console.log('Respuesta completa:', response);
			console.log('response.isValid:', response.isValid);
			console.log('response.code:', response.code);
			console.log('response.message:', response.message);

			// Verificar si el OTP es válido
			console.log('=== VERIFICANDO VALIDEZ ===');
			// Verificar si el código es válido - múltiples formas de validar
			const isValid = response.code === 200 && (
				response.isValid === 'true' || 
				response.isValid === true ||
				response.message === 'ok' ||
				response.address // Si tiene address, es válido
			);
			console.log('isValid result:', isValid);
			console.log('Response code check:', response.code === 200);
			console.log('isValid check:', response.isValid === 'true');
			console.log('hasAddress check:', !!response.address);
			
			if (isValid) {
				console.log('=== OTP VÁLIDO - PROCESANDO ÉXITO ===');
				
				// Guardar datos de la cuenta
				console.log('Guardando datos de cuenta...');
				dispatch(setAccountData({
					address: response.address,
					f1: response.f1
				}));
				console.log('Datos guardados:', { address: response.address, f1: response.f1 });

				// Marcar OTP como verificado
				console.log('Marcando OTP como verificado...');
				dispatch(setOTPVerified(true));
				console.log('OTP marcado como verificado');

				// Navegar directamente sin alerta para probar
				console.log('Navegando directamente a qr-display...');
				router.push("/qr-display");
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
						<Text style={{ fontSize: 24 }}>✕</Text>
					</TouchableOpacity>
				</View>

				<View style={styles.codeContainer}>
					<CodeField
						{...props}
						value={otpCode}
						onChangeText={setOtpCode}
						cellCount={6}
						keyboardType="number-pad"
						textContentType="oneTimeCode"
						renderCell={({ index, symbol, isFocused }) => (
							<Text
								key={index}
								style={[styles.cell, isFocused && styles.focusCell]}
								onLayout={getCellOnLayoutHandler(index)}
							>
								{symbol || (isFocused ? <Cursor /> : null)}
							</Text>
						)}
					/>
				</View>

				<LoadingButton
					onPress={handleVerify}
					disabled={otpCode.length !== 6}
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
		color: "#666", 
		flex: 1, 
		marginRight: 16 
	},
	codeContainer: { 
		marginBottom: 30,
		alignItems: "center",
	},
	cell: {
		width: 50,
		height: 60,
		lineHeight: 56,
		fontSize: 20,
		fontWeight: "600",
		borderWidth: 2,
		borderColor: "#E3F2FD",
		textAlign: "center",
		borderRadius: 8,
		color: "#333",
		backgroundColor: "#fff",
		marginHorizontal: 4,
		shadowColor: "#000",
		shadowOffset: {
			width: 0,
			height: 2,
		},
		shadowOpacity: 0.1,
		shadowRadius: 3.84,
		elevation: 5,
	},
	focusCell: {
		borderColor: "#1E78C6",
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
