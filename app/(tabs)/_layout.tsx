import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#00A86B",
        tabBarInactiveTintColor: "gray",
        tabBarStyle: {
          elevation: 0,
          borderTopWidth: 1,
          borderTopColor: "#f0f0f0",
          backgroundColor: "white",
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Panel",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="registro-lecturas"
        options={{
          title: "Registro",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="list-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="perfil"
        options={{
          title: "Perfil",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="nueva-captura"
        options={{
          href: null, // Ocultar de la barra de navegación
        }}
      />
      <Tabs.Screen
        name="medidor-electrico"
        options={{
          href: null, // Ocultar de la barra de navegación
        }}
      />
      <Tabs.Screen
        name="seleccion-pozo"
        options={{
          href: null, // Ocultar de la barra de navegación
        }}
      />
      <Tabs.Screen
        name="ticket"
        options={{
          href: null, // Ocultar de la barra de navegación
        }}
      />
    </Tabs>
  );
}
