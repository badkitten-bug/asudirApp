"use client";
import {
	View,
	StyleSheet,
	Image,
	type ImageSourcePropType,
} from "react-native";
import { useRouter } from "expo-router";
import { useEffect } from "react";
import { useSelector } from "@/store";
import AsyncStorage from "@react-native-async-storage/async-storage";

const QUICK_ACCESS_PIN_KEY = "@quick_access_pin";

export default function SplashScreen() {
	const router = useRouter();
	const { isAuthenticated, isLoading } = useSelector((state) => state.auth);
	const logoWhite: ImageSourcePropType = require("@/assets/images/logo-white.png");

	useEffect(() => {
		const initializeApp = async () => {
			// Verificar si existe PIN de acceso rápido
			const hasQuickAccessPin =
				await AsyncStorage.getItem(QUICK_ACCESS_PIN_KEY);

			setTimeout(() => {
				if (isAuthenticated && hasQuickAccessPin) {
					// Usuario autenticado Y tiene PIN, ir a acceso rápido
					router.replace("/quick-access");
				} else if (isAuthenticated) {
					// Usuario autenticado pero sin PIN, ir directo al scanner
					router.replace("/qr-scanner");
				} else {
					// Usuario no autenticado (primera vez o logout), ir al flujo completo
					router.replace("/verification-start");
				}
			}, 2000);
		};

		if (!isLoading) {
			initializeApp();
		}
	}, [router, isAuthenticated, isLoading]);

	return (
		<View style={styles.container}>
			<Image source={logoWhite} style={styles.logo} resizeMode="contain" />
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "#1E78C6",
		justifyContent: "center",
		alignItems: "center",
	},
	logo: {
		width: 200,
		height: 120,
	},
});
