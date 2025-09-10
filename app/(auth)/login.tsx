"use client";

import { useState, useEffect, useRef } from "react";
import {
	StyleSheet,
	View,
	Text,
	TextInput,
	TouchableOpacity,
	Image,
	KeyboardAvoidingView,
	Platform,
	TouchableWithoutFeedback,
	Keyboard,
	ScrollView,
	Dimensions,
	Animated,
	StatusBar as RNStatusBar,
	type ImageSourcePropType,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useSelector } from "react-redux";
import { showSnackbar } from "../../store/snackbarSlice";
import Constants from "expo-constants";
import { useDispatch, type RootState } from "../../store";
import { syncUsers } from "../../store/authSlice";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");
const STATUSBAR_HEIGHT = Constants.statusBarHeight || 0;

export default function LoginScreen() {
	const [dni, setDni] = useState("");
	const [email, setEmail] = useState("");
	const [accepted, setAccepted] = useState(false);
	const [panelY] = useState(new Animated.Value(SCREEN_HEIGHT));
	const [keyboardHeight, setKeyboardHeight] = useState(0);
	const [keyboardVisible, setKeyboardVisible] = useState(false);
	const scrollViewRef = useRef<ScrollView>(null);
	const formPositionY = useRef(new Animated.Value(0)).current;

	const router = useRouter();
	const dispatch = useDispatch();
	const { isAuthenticated } = useSelector((state: RootState) => state.auth);

	useEffect(() => {
		if (isAuthenticated) router.replace("/(tabs)");
	}, [isAuthenticated, router]);

	useEffect(() => {
		const keyboardWillShowListener = Keyboard.addListener(
			Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow",
			(e) => {
				setKeyboardVisible(true);
				setKeyboardHeight(e.endCoordinates.height);
				Animated.timing(formPositionY, { toValue: -Math.min(150, e.endCoordinates.height * 0.4), duration: 300, useNativeDriver: true }).start();
				if (scrollViewRef.current) setTimeout(() => { scrollViewRef.current?.scrollToEnd({ animated: true }) }, 100);
			},
		);

		const keyboardWillHideListener = Keyboard.addListener(
			Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide",
			() => {
				setKeyboardVisible(false);
				setKeyboardHeight(0);
				Animated.timing(formPositionY, { toValue: 0, duration: 300, useNativeDriver: true }).start();
			},
		);

		return () => { keyboardWillShowListener.remove(); keyboardWillHideListener.remove() };
	}, [formPositionY]);

	const showPanel = () => {
		Animated.timing(panelY, { toValue: 0, duration: 300, useNativeDriver: true }).start();
	};

	const hidePanel = () => {
		Animated.timing(panelY, { toValue: SCREEN_HEIGHT, duration: 250, useNativeDriver: true }).start();
	};

	const handleStart = () => {
		if (!accepted) {
			dispatch(showSnackbar({ message: "Debes aceptar términos y condiciones", type: "warning", duration: 2500 }));
			return;
		}
		showPanel();
	};

	const handleVerify = () => {
		if (!dni.trim() || !email.trim()) {
			dispatch(showSnackbar({ message: "Completa DNI y correo", type: "warning", duration: 2500 }));
			return;
		}
		router.push("/(auth)/otp-verification");
	};

	const dismissKeyboard = () => Keyboard.dismiss();

	const bg: ImageSourcePropType = require("@/assets/images/bg.png");
	const logo: ImageSourcePropType = require("@/assets/images/icon.png");
	const identify: ImageSourcePropType = require("@/assets/images/identify.png");

	return (
		<View style={styles.container}>
			<RNStatusBar backgroundColor="transparent" barStyle="dark-content" translucent={true} />
			<StatusBar style="dark" />

			<TouchableWithoutFeedback onPress={dismissKeyboard}>
				<View style={styles.innerContainer}>
					<View style={{ height: STATUSBAR_HEIGHT }} />

					<Image source={logo} style={styles.logo} resizeMode="contain" />
					<View style={styles.heroWrap}>
						<Image source={bg} style={styles.hero} resizeMode="contain" />
						<Image source={identify} style={styles.identify} resizeMode="contain" />
					</View>

					<View style={styles.tcContainer}>
						<Text style={styles.tcText}>Por favor, verifique su identidad.</Text>
						<TouchableOpacity style={styles.tcRow} onPress={() => setAccepted(!accepted)}>
							<View style={[styles.tcCheck, accepted && styles.tcCheckOn]} />
							<Text style={styles.tcLink}>Acepto términos y condiciones</Text>
						</TouchableOpacity>
					</View>

					<TouchableOpacity style={styles.primaryBtn} onPress={handleStart}>
						<Text style={styles.primaryText}>Iniciar verificación</Text>
					</TouchableOpacity>

					<KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.keyboardView}>
						<Animated.View style={[styles.sheet, { transform: [{ translateY: panelY }] }]}>
							<View style={styles.sheetHeader}>
								<Text style={styles.sheetTitle}>Ingrese sus datos personales</Text>
								<TouchableOpacity onPress={hidePanel}><Text style={{ fontSize: 20 }}>✕</Text></TouchableOpacity>
							</View>

							<View style={styles.inputGroup}>
								<Text style={styles.label}>DNI</Text>
								<TextInput style={styles.input} placeholder="Ingresa tu DNI" keyboardType="numeric" maxLength={8} value={dni} onChangeText={setDni} />
							</View>

							<View style={styles.inputGroup}>
								<Text style={styles.label}>Email</Text>
								<TextInput style={styles.input} placeholder="Ingresa tu Email" keyboardType="email-address" autoCapitalize="none" value={email} onChangeText={setEmail} />
							</View>

							<TouchableOpacity style={styles.primaryBtn} onPress={handleVerify}>
								<Text style={styles.primaryText}>Verificar</Text>
							</TouchableOpacity>
						</Animated.View>
					</KeyboardAvoidingView>
				</View>
			</TouchableWithoutFeedback>
		</View>
	);
}

const styles = StyleSheet.create({
	container: { flex: 1, backgroundColor: "#fff" },
	innerContainer: { flex: 1, alignItems: "center" },
	keyboardView: { flex: 1, width: "100%" },
	logo: { width: 160, height: 80, marginTop: 24 },
	heroWrap: { width: "86%", height: 280, marginTop: 16, position: "relative" },
	hero: { width: "100%", height: "100%" },
	identify: { position: "absolute", left: 0, right: 0, top: 0, bottom: 0, width: "100%", height: "100%" },
	tcContainer: { marginTop: 16, alignItems: "center" },
	tcText: { color: "#6b7280" },
	tcRow: { flexDirection: "row", alignItems: "center", marginTop: 8 },
	tcCheck: { width: 18, height: 18, borderRadius: 4, borderWidth: 2, borderColor: "#1E78C6", marginRight: 8 },
	tcCheckOn: { backgroundColor: "#1E78C6" },
	tcLink: { color: "#1E78C6" },
	primaryBtn: { backgroundColor: "#1E78C6", paddingVertical: 12, paddingHorizontal: 18, borderRadius: 10, marginTop: 16 },
	primaryText: { color: "#fff", fontWeight: "700" },
	sheet: { position: "absolute", left: 0, right: 0, bottom: 0, backgroundColor: "#fff", borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, gap: 12,
		...(Platform.OS === 'web' ? { boxShadow: "0px 8px 24px rgba(0,0,0,0.15)" } : { shadowColor: "#000", shadowOpacity: 0.15, shadowRadius: 12, shadowOffset: { width: 0, height: 6 }, elevation: 6 })
	},
	sheetHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
	sheetTitle: { fontSize: 16, fontWeight: "700" },
	inputGroup: { marginTop: 8 },
	label: { marginBottom: 6, color: "#374151" },
	input: { backgroundColor: "#EEF8F7", borderColor: "#cfd8dc", borderWidth: 1, borderRadius: 10, padding: 12 },
});
