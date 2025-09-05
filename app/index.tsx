import { Redirect } from "expo-router";

export default function Index() {
	// Redirigir directamente al splash para el nuevo flujo
	return <Redirect href="/splash" />;
}
