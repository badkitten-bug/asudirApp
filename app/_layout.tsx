"use client";

import { useEffect } from "react";
import { Stack } from "expo-router";
import { Provider } from "react-redux";
import Snackbar from "../components/Snackbar";
import { loadUser } from "../store/authSlice";
import { View, ActivityIndicator, Text } from "react-native";
import { useDispatch, useSelector, store, type RootState } from "../store";
import { PersistGate } from "redux-persist/integration/react";
import { persistor } from "../store";

function AuthWrapper() {
	const dispatch = useDispatch();
	const { isAuthenticated, isLoading } = useSelector(
		(state: RootState) => state.auth,
	);

	useEffect(() => {
		let isMounted = true;
		const loadData = async () => {
			try {
				await dispatch(loadUser());
			} catch (error) {
				if (isMounted) {
					console.error("Error al cargar datos:", error);
				}
			}
		};

		loadData();
		return () => {
			isMounted = false;
		};
	}, [dispatch]);

	if (isLoading) {
		return (
			<View
				style={{
					flex: 1,
					justifyContent: "center",
					alignItems: "center",
					backgroundColor: "#f5f5f5",
				}}
			>
				<ActivityIndicator size="large" color="#00A86B" />
				<Text style={{ marginTop: 16, color: "#333", fontSize: 16 }}>
					Cargando...
				</Text>
			</View>
		);
	}

	return (
		<Stack screenOptions={{ headerShown: false }}>
			<Stack.Screen name="splash" />
			<Stack.Screen name="verification-start" />
			<Stack.Screen name="personal-data" />
			<Stack.Screen name="activation-code" />
			<Stack.Screen name="quick-access" />
			<Stack.Screen name="qr-scanner" />
			<Stack.Screen name="requirements" />
			<Stack.Screen name="biometric" />
			<Stack.Screen name="success" />
			<Stack.Screen name="otp-generator" />
			<Stack.Screen name="otp-scanner" />
			<Stack.Screen name="(auth)" options={{ presentation: "modal" }} />
		</Stack>
	);
}

export default function RootLayout() {
	return (
		<Provider store={store}>
			<PersistGate
				loading={
					<View
						style={{
							flex: 1,
							justifyContent: "center",
							alignItems: "center",
							backgroundColor: "#f5f5f5",
						}}
					>
						<ActivityIndicator size="large" color="#00A86B" />
						<Text style={{ marginTop: 16, color: "#333", fontSize: 16 }}>
							Cargando datos locales...
						</Text>
					</View>
				}
				persistor={persistor}
			>
				<AuthWrapper />
				<Snackbar />
			</PersistGate>
		</Provider>
	);
}
