"use client";
import { useRef, useState } from "react";
import {
	View,
	Text,
	StyleSheet,
	TextInput,
	TouchableOpacity,
	KeyboardAvoidingView,
	Platform,
	Image,
	type ImageSourcePropType,
	StatusBar as RNStatusBar,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

export default function OtpVerificationScreen() {
	const router = useRouter();
	const [code, setCode] = useState<string>("");
	const inputsRef = useRef<Array<TextInput | null>>([]);

	const handleChange = (idx: number, value: string) => {
		const sanitized = value.replace(/\D/g, "").slice(0, 1);
		const next = code.substring(0, idx) + sanitized + code.substring(idx + 1);
		setCode(next.padEnd(6, ""));
		if (sanitized && idx < 5) inputsRef.current[idx + 1]?.focus();
	};

	const handleVerify = () => {
		router.replace("/(tabs)/qr-scanner");
	};

	const ids = ["a", "b", "c", "d", "e", "f"];

	const bg: ImageSourcePropType = require("@/assets/images/bg.png");
	const logo: ImageSourcePropType = require("@/assets/images/icon.png");
	const identify: ImageSourcePropType = require("@/assets/images/identify.png");

	return (
		<View style={styles.container}>
			<RNStatusBar backgroundColor="transparent" barStyle="dark-content" translucent={true} />
			<StatusBar style="dark" />

			<Image source={logo} style={styles.logo} resizeMode="contain" />
			<View style={styles.heroWrap}>
				<Image source={bg} style={styles.hero} resizeMode="contain" />
				<Image source={identify} style={styles.identify} resizeMode="contain" />
			</View>

			<KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={styles.keyboardView}>
				<View style={styles.sheet}>
					<View style={styles.sheetHeader}>
						<Text style={styles.title}>Ingrese código de activación que se le ha enviado a su correo electrónico</Text>
						<TouchableOpacity onPress={() => router.back()}>
							<Ionicons name="close" size={20} color="#3b3b3b" />
						</TouchableOpacity>
					</View>

					<View style={styles.codeRow}>
						{ids.map((id, idx) => (
							<TextInput
								key={`otp-cell-${id}`}
								ref={(el) => {
									inputsRef.current[idx] = el;
								}}
								style={styles.codeInput}
								keyboardType="numeric"
								maxLength={1}
								value={code[idx] || ""}
								onChangeText={(v) => handleChange(idx, v)}
								autoFocus={idx === 0}
								returnKeyType={idx === 5 ? "done" : "next"}
							/>
						))}
					</View>

					<TouchableOpacity style={styles.button} onPress={handleVerify}>
						<Text style={styles.buttonText}>Verificar</Text>
					</TouchableOpacity>
				</View>
			</KeyboardAvoidingView>
		</View>
	);
}

const styles = StyleSheet.create({
	container: { flex: 1, backgroundColor: "#fff", alignItems: "center" },
	keyboardView: { flex: 1, width: "100%" },
	logo: { width: 160, height: 80, marginTop: 24 },
	heroWrap: { width: "86%", height: 280, marginTop: 16, position: "relative" },
	hero: { width: "100%", height: "100%" },
	identify: { position: "absolute", left: 0, right: 0, top: 0, bottom: 0, width: "100%", height: "100%" },
	sheet: { position: "absolute", left: 0, right: 0, bottom: 0, backgroundColor: "#fff", borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24,
		...(Platform.OS === 'web' ? { boxShadow: "0px 8px 24px rgba(0,0,0,0.15)" } : { shadowColor: "#000", shadowOpacity: 0.15, shadowRadius: 12, shadowOffset: { width: 0, height: 6 }, elevation: 6 })
	},
	sheetHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12, paddingHorizontal: 4 },
	title: { fontSize: 14, fontWeight: "600", color: "#334155", flex: 1, paddingRight: 12 },
	codeRow: { marginTop: 12, flexDirection: "row", justifyContent: "space-between", paddingHorizontal: 4 },
	codeInput: { width: 46, height: 56, borderRadius: 10, borderWidth: 1, borderColor: "#cfd8dc", textAlign: "center", fontSize: 20, backgroundColor: "#EEF8F7" },
	button: { marginTop: 20, backgroundColor: "#1E78C6", paddingVertical: 14, borderRadius: 10, alignItems: "center" },
	buttonText: { color: "#fff", fontWeight: "700", fontSize: 16 },
});
