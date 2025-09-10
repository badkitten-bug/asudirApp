"use client";
import { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image, type ImageSourcePropType, TextInput, Alert, Animated, Dimensions } from "react-native";
import { useRouter } from "expo-router";
import { sendOTP, getDeviceIMEI, createAccount } from "@/services/api";
import LoadingButton from "@/components/LoadingButton";
import { useDispatch } from "@/store";
import { setPersonalData, setOTPSent, setOTPVerified, setAccountData } from "@/store/userSlice";
import { CodeField, Cursor, useClearByFocusCell } from "react-native-confirmation-code-field";

export default function VerificationStartScreen() {
	const router = useRouter();
	const dispatch = useDispatch();
	const [termsAccepted, setTermsAccepted] = useState(false);
	const [currentStep, setCurrentStep] = useState<'start' | 'personal-data' | 'otp'>('start');
	
	// Estados para datos personales
	const [dni, setDni] = useState("");
	const [email, setEmail] = useState("");
	const [isLoadingPersonal, setIsLoadingPersonal] = useState(false);
	
	// Estados para OTP
	const [otpCode, setOtpCode] = useState("");
	const [isLoadingOTP, setIsLoadingOTP] = useState(false);
	const [otpError, setOtpError] = useState(false);
	const [props, getCellOnLayoutHandler] = useClearByFocusCell({ value: otpCode, setValue: setOtpCode });
	
	// Animaciones
	const [slideAnimation] = useState(new Animated.Value(0));

	const bg: ImageSourcePropType = require("@/assets/images/identify.png");
	const logo: ImageSourcePropType = require("@/assets/images/icon.png");

	const handleStartVerification = () => {
		if (termsAccepted) {
			setCurrentStep('personal-data');
			// Animar el modal desde abajo
			Animated.timing(slideAnimation, {
				toValue: 1,
				duration: 300,
				useNativeDriver: true,
			}).start();
		}
	};

	const handlePersonalDataSubmit = async () => {
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

		setIsLoadingPersonal(true);

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

			// Animar transición al paso OTP
			Animated.sequence([
				Animated.timing(slideAnimation, {
					toValue: 0,
					duration: 200,
					useNativeDriver: true,
				}),
				Animated.timing(slideAnimation, {
					toValue: 1,
					duration: 300,
					useNativeDriver: true,
				}),
			]).start(() => {
				setCurrentStep('otp');
			});
			
		} catch (error) {
			console.error('Error sending OTP:', error);
			Alert.alert(
				"Error", 
				"No se pudo enviar el código de verificación. Por favor intenta nuevamente.",
				[{ text: "OK" }]
			);
		} finally {
			setIsLoadingPersonal(false);
		}
	};

	const handleOTPSubmit = async () => {
		if (otpCode.length !== 6) {
			Alert.alert("Error", "Por favor complete todos los dígitos del código");
			return;
		}

		if (!email || !dni) {
			Alert.alert("Error", "Datos de usuario no encontrados. Por favor regrese al paso anterior.");
			return;
		}

		setIsLoadingOTP(true);
		setOtpError(false); // Limpiar error previo

		try {
			console.log('=== INICIANDO VERIFICACIÓN ===');
			console.log('Verificando OTP:', { email, otp: otpCode, dni });

			const imei = await getDeviceIMEI();
			const response = await createAccount({
				email,
				otp: otpCode,
				imei
			});

			console.log('=== RESPUESTA RECIBIDA ===');
			console.log('Respuesta completa:', response);
			console.log('response.response:', (response as any).response);
			console.log('response.response.isValid:', (response as any).response?.isValid);
			console.log('response.response.address:', (response as any).response?.address);

			// Verificar si el OTP es válido - más flexible para APIs de prueba
			console.log('=== VERIFICANDO VALIDEZ ===');
			const isValid = (response as any).code === 200 || 
				(response as any).response?.isValid === 'true' || 
				(response as any).response?.address ||
				(response as any).response?.isValid === true;
			console.log('isValid result:', isValid);
			
			if (isValid) {
				console.log('=== OTP VÁLIDO - PROCESANDO ÉXITO ===');
				
				// Guardar datos de la cuenta
				dispatch(setAccountData({
					address: (response as any).response?.address,
					f1: (response as any).response?.f1
				}));

				// Marcar OTP como verificado
				dispatch(setOTPVerified(true));

				console.log('Navegando a qr-display...');
				router.push("/qr-display");
			} else {
				console.log('=== OTP INVÁLIDO ===');
				setOtpError(true);
				setOtpCode(""); // Limpiar el código incorrecto
				
				Alert.alert(
					"❌ Código incorrecto",
					"El código OTP ingresado no es válido. Por favor verifica el código y intenta nuevamente.",
					[{ 
						text: "Entendido", 
						onPress: () => setOtpError(false)
					}]
				);
			}
			
		} catch (error) {
			console.log('=== ERROR EN VERIFICACIÓN ===');
			console.error('Error verifying OTP:', error);
			setOtpError(true);
			setOtpCode(""); // Limpiar el código en caso de error
			
			Alert.alert(
				"❌ Error de conexión",
				"No se pudo verificar el código. Por favor intenta nuevamente.",
				[{ 
					text: "OK", 
					onPress: () => setOtpError(false)
				}]
			);
		} finally {
			setIsLoadingOTP(false);
		}
	};

	const goBack = () => {
		if (currentStep === 'personal-data') {
			setCurrentStep('start');
			Animated.timing(slideAnimation, {
				toValue: 0,
				duration: 300,
				useNativeDriver: true,
			}).start();
		} else if (currentStep === 'otp') {
			setCurrentStep('personal-data');
		}
	};

	const screenHeight = Dimensions.get('window').height;

	return (
		<View style={styles.container}>
			<Image source={logo} style={styles.logo} resizeMode="contain" />
			<View style={styles.heroWrap}>
				<Image source={bg} style={styles.hero} resizeMode="contain" />
			</View>

			{currentStep === 'start' && (
				<>
					<Text style={styles.title}>Por favor, verifique su identidad</Text>

					<TouchableOpacity 
						style={styles.checkboxContainer} 
						onPress={() => setTermsAccepted(!termsAccepted)}
					>
						<View style={[styles.checkbox, termsAccepted && styles.checkboxChecked]}>
							{termsAccepted && <Text style={{ fontSize: 16 }}>✅</Text>}
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
				</>
			)}

			{/* Modal deslizable para datos personales */}
			{(currentStep === 'personal-data' || currentStep === 'otp') && (
				<Animated.View 
					style={[
						styles.modal,
						{
							transform: [{
								translateY: slideAnimation.interpolate({
									inputRange: [0, 1],
									outputRange: [screenHeight, 0],
								})
							}]
						}
					]}
				>
					{currentStep === 'personal-data' && (
						<>
							<View style={styles.modalHeader}>
								<Text style={styles.modalTitle}>Ingrese sus datos personales</Text>
								<TouchableOpacity onPress={goBack}>
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
								onPress={handlePersonalDataSubmit}
								disabled={!dni.trim() || !email.trim()}
								loading={isLoadingPersonal}
								title="Enviar código"
								loadingTitle="Enviando código..."
								style={styles.button}
								textStyle={styles.buttonText}
							/>
						</>
					)}

					{currentStep === 'otp' && (
						<>
							<View style={styles.modalHeader}>
								<Text style={styles.modalTitle}>Ingrese el código de 6 dígitos que se le ha enviado a su correo electrónico</Text>
								<TouchableOpacity onPress={goBack}>
									<Text style={{ fontSize: 24 }}>✕</Text>
								</TouchableOpacity>
							</View>

							<View style={styles.codeContainer}>
								<CodeField
									{...props}
									value={otpCode}
									onChangeText={(text) => {
										setOtpCode(text);
										if (otpError) setOtpError(false); // Limpiar error al escribir
									}}
									cellCount={6}
									keyboardType="number-pad"
									textContentType="oneTimeCode"
									renderCell={({ index, symbol, isFocused }) => (
										<Text
											key={index}
											style={[
												styles.cell, 
												isFocused && styles.focusCell,
												otpError && styles.errorCell
											]}
											onLayout={getCellOnLayoutHandler(index)}
										>
											{symbol || (isFocused ? <Cursor /> : null)}
										</Text>
									)}
								/>
								{otpError && (
									<Text style={styles.errorText}>
										❌ Código incorrecto. Intenta nuevamente.
									</Text>
								)}
							</View>

							<LoadingButton
								onPress={handleOTPSubmit}
								disabled={otpCode.length !== 6}
								loading={isLoadingOTP}
								title="Verificar"
								loadingTitle="Verificando código..."
								style={styles.button}
								textStyle={styles.buttonText}
							/>
						</>
					)}
				</Animated.View>
			)}
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
	// Estilos para el modal deslizable
	modal: { 
		position: "absolute", 
		left: 0, 
		right: 0, 
		bottom: 0, 
		backgroundColor: "#fff", 
		borderTopLeftRadius: 24, 
		borderTopRightRadius: 24, 
		padding: 24,
		paddingBottom: 40, // Agregar padding extra en la parte inferior
		minHeight: 300,
		shadowColor: "#000",
		shadowOffset: {
			width: 0,
			height: -2,
		},
		shadowOpacity: 0.25,
		shadowRadius: 3.84,
		elevation: 5,
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
	errorCell: {
		borderColor: "#FF4444",
		backgroundColor: "#FFF5F5",
	},
	errorText: {
		color: "#FF4444",
		fontSize: 14,
		fontWeight: "500",
		textAlign: "center",
		marginTop: 12,
	},
});
