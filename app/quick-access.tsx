"use client";
import { useState, useEffect, useCallback } from "react";
import {
	View,
	Text,
	StyleSheet,
	TouchableOpacity,
	Platform,
	Alert,
	Image,
} from "react-native";
import { useRouter } from "expo-router";
import { useSelector, useDispatch } from "@/store";
import { login } from "@/store/authSlice";
import AsyncStorage from "@react-native-async-storage/async-storage";

const QUICK_ACCESS_PIN_KEY = "@quick_access_pin";

export default function QuickAccessScreen() {
	const router = useRouter();
	const dispatch = useDispatch();
	const { user } = useSelector((state) => state.auth);
	const [pin, setPin] = useState("");
	const [storedPin, setStoredPin] = useState<string | null>(null);
	const [confirmPin, setConfirmPin] = useState("");
	const [step, setStep] = useState<"check" | "create" | "confirm">("check");

	const logo = require("@/assets/images/icon.png");

	useEffect(() => {
		checkExistingPin();
	}, [checkExistingPin]);

	const checkExistingPin = useCallback(async () => {
		try {
			const savedPin = await AsyncStorage.getItem(QUICK_ACCESS_PIN_KEY);
			if (savedPin) {
				setStoredPin(savedPin);
				setStep("check");
			} else {
				setStep("create");
			}
		} catch (error) {
			console.error("Error checking PIN:", error);
			setStep("create");
		}
	}, []);

	const handleNumberPress = (number: string) => {
		if (step === "check") {
			if (pin.length < 6) {
				const newPin = pin + number;
				setPin(newPin);
				if (newPin.length === 6) {
					validatePin(newPin);
				}
			}
		} else if (step === "create") {
			if (pin.length < 6) {
				setPin(pin + number);
			}
		} else if (step === "confirm") {
			if (confirmPin.length < 6) {
				const newConfirmPin = confirmPin + number;
				setConfirmPin(newConfirmPin);
				if (newConfirmPin.length === 6) {
					if (newConfirmPin === pin) {
						savePin(pin);
					} else {
						Alert.alert("Error", "Los PINs no coinciden. Inténtalo de nuevo.");
						setPin("");
						setConfirmPin("");
						setStep("create");
					}
				}
			}
		}
	};

	const handleBackspace = () => {
		if (step === "check") {
			setPin(pin.slice(0, -1));
		} else if (step === "create") {
			setPin(pin.slice(0, -1));
		} else if (step === "confirm") {
			setConfirmPin(confirmPin.slice(0, -1));
		}
	};

	const validatePin = async (enteredPin: string) => {
		if (enteredPin === storedPin) {
			// PIN correcto - simular login exitoso
			const mockUser = {
				id: "quick-access-user",
				email: user?.email || "usuario@asudir.com",
				name: user?.name || "Usuario Rápido",
				token: "quick-access-token",
			};

			dispatch(login(mockUser));
			router.replace("/qr-scanner");
		} else {
			Alert.alert("Error", "PIN incorrecto. Inténtalo de nuevo.");
			setPin("");
		}
	};

	const savePin = async (newPin: string) => {
		try {
			await AsyncStorage.setItem(QUICK_ACCESS_PIN_KEY, newPin);
			setStoredPin(newPin);
			Alert.alert(
				"✅ PIN Configurado",
				"Tu PIN de acceso rápido ha sido configurado exitosamente. Ahora puedes usar este PIN para acceder rápidamente a la aplicación.",
				[
					{
						text: "Continuar",
						onPress: () => {
							// Simular login exitoso
							const mockUser = {
								id: "quick-access-user",
								email: user?.email || "usuario@asudir.com",
								name: user?.name || "Usuario Rápido",
								token: "quick-access-token",
							};

							dispatch(login(mockUser));
							router.replace("/qr-scanner");
						},
					},
				],
			);
		} catch (error) {
			console.error("Error saving PIN:", error);
			Alert.alert("Error", "No se pudo guardar el PIN. Inténtalo de nuevo.");
		}
	};

	const handleCreatePin = () => {
		if (pin.length === 6) {
			setStep("confirm");
		} else {
			Alert.alert("Error", "El PIN debe tener 6 dígitos.");
		}
	};

	const handleFullLogin = () => {
		router.replace("/(auth)");
	};

	const renderPinDots = (currentPin: string) => {
		return (
			<View style={styles.pinContainer}>
				{[...Array(6)].map((_, index) => (
					<View
						key={index}
						style={[
							styles.pinDot,
							index < currentPin.length
								? styles.pinDotFilled
								: styles.pinDotEmpty,
						]}
					/>
				))}
			</View>
		);
	};

	const renderNumberPad = () => {
		const numbers = [
			["1", "2", "3"],
			["4", "5", "6"],
			["7", "8", "9"],
			["", "0", "⌫"],
		];

		return (
			<View style={styles.numberPad}>
				{numbers.map((row, rowIndex) => (
					<View key={rowIndex} style={styles.numberRow}>
						{row.map((number, colIndex) => (
							<TouchableOpacity
								key={colIndex}
								style={[
									styles.numberButton,
									number === "" ? styles.emptyButton : {},
								]}
								onPress={() => {
									if (number === "⌫") {
										handleBackspace();
									} else if (number !== "") {
										handleNumberPress(number);
									}
								}}
								disabled={number === ""}
							>
								<Text style={styles.numberButtonText}>{number}</Text>
							</TouchableOpacity>
						))}
					</View>
				))}
			</View>
		);
	};

	const getTitle = () => {
		switch (step) {
			case "check":
				return "🔐 Acceso Rápido";
			case "create":
				return "📱 Crear PIN";
			case "confirm":
				return "✅ Confirmar PIN";
			default:
				return "🔐 Acceso Rápido";
		}
	};

	const getSubtitle = () => {
		switch (step) {
			case "check":
				return "Ingresa tu PIN de 6 dígitos";
			case "create":
				return "Crea un PIN de 6 dígitos para acceso rápido";
			case "confirm":
				return "Confirma tu PIN de 6 dígitos";
			default:
				return "";
		}
	};

	return (
		<View style={styles.container}>
			<View style={styles.header}>
				<Image source={logo} style={styles.logo} resizeMode="contain" />
			</View>

			<View style={styles.content}>
				<Text style={styles.title}>{getTitle()}</Text>
				<Text style={styles.subtitle}>{getSubtitle()}</Text>

				{renderPinDots(step === "confirm" ? confirmPin : pin)}
				{renderNumberPad()}

				{step === "create" && pin.length === 6 && (
					<TouchableOpacity
						style={styles.continueButton}
						onPress={handleCreatePin}
					>
						<Text style={styles.continueButtonText}>Continuar</Text>
					</TouchableOpacity>
				)}

				<TouchableOpacity
					style={styles.fullLoginButton}
					onPress={handleFullLogin}
				>
					<Text style={styles.fullLoginButtonText}>
						🔓 Usar verificación completa (DNI + Email + OTP)
					</Text>
				</TouchableOpacity>
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "#f8f9fa",
	},
	header: {
		paddingTop: 80,
		alignItems: "center",
		marginBottom: 40,
	},
	logo: {
		width: 160,
		height: 80,
	},
	content: {
		flex: 1,
		paddingHorizontal: 24,
		alignItems: "center",
	},
	title: {
		fontSize: 24,
		fontWeight: "600",
		color: "#333",
		textAlign: "center",
		marginBottom: 8,
	},
	subtitle: {
		fontSize: 16,
		color: "#666",
		textAlign: "center",
		marginBottom: 40,
	},
	pinContainer: {
		flexDirection: "row",
		justifyContent: "center",
		marginBottom: 40,
		gap: 12,
	},
	pinDot: {
		width: 16,
		height: 16,
		borderRadius: 8,
		borderWidth: 2,
	},
	pinDotEmpty: {
		borderColor: "#ddd",
		backgroundColor: "transparent",
	},
	pinDotFilled: {
		borderColor: "#1E78C6",
		backgroundColor: "#1E78C6",
	},
	numberPad: {
		marginBottom: 40,
	},
	numberRow: {
		flexDirection: "row",
		justifyContent: "center",
		marginBottom: 16,
		gap: 20,
	},
	numberButton: {
		width: 70,
		height: 70,
		borderRadius: 35,
		backgroundColor: "#fff",
		justifyContent: "center",
		alignItems: "center",
		...(Platform.OS === "web"
			? { boxShadow: "0px 2px 8px rgba(0,0,0,0.1)" }
			: { elevation: 2 }),
	},
	emptyButton: {
		backgroundColor: "transparent",
		elevation: 0,
		...(Platform.OS === "web" ? { boxShadow: "none" } : {}),
	},
	numberButtonText: {
		fontSize: 24,
		fontWeight: "600",
		color: "#333",
	},
	continueButton: {
		backgroundColor: "#1E78C6",
		paddingVertical: 16,
		paddingHorizontal: 32,
		borderRadius: 25,
		marginBottom: 20,
		...(Platform.OS === "web"
			? { boxShadow: "0px 8px 20px rgba(30,120,198,0.3)" }
			: { elevation: 6 }),
	},
	continueButtonText: {
		color: "#fff",
		fontWeight: "600",
		fontSize: 16,
		textAlign: "center",
	},
	fullLoginButton: {
		paddingVertical: 12,
		paddingHorizontal: 20,
		borderRadius: 20,
		backgroundColor: "rgba(255,255,255,0.8)",
		borderWidth: 1,
		borderColor: "#ddd",
	},
	fullLoginButtonText: {
		color: "#666",
		fontSize: 14,
		textAlign: "center",
		fontWeight: "500",
	},
});
