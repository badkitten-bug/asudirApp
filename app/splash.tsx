"use client";
import { View, Text, StyleSheet, Image, type ImageSourcePropType } from "react-native";
import { useRouter } from "expo-router";
import { useEffect } from "react";

export default function SplashScreen() {
	const router = useRouter();
	const logoWhite: ImageSourcePropType = require("@/assets/images/logo-white.png");

	useEffect(() => {
		const timer = setTimeout(() => {
			router.replace("/verification-start");
		}, 2000);

		return () => clearTimeout(timer);
	}, [router]);

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
