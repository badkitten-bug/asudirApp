import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
/* import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect } from "react"; */

export default function TabsLayout() {
  /* const eliminarAsyncStorage = async () => {
    try {
      await AsyncStorage.removeItem("@tickets_data");
      await AsyncStorage.removeItem("lecturas");
      await AsyncStorage.removeItem("pozos");
      await AsyncStorage.removeItem("capturas");
      await AsyncStorage.removeItem("recibos");
      await AsyncStorage.removeItem("estados");
      await AsyncStorage.removeItem("medidor");
      await AsyncStorage.removeItem("pozo");
      await AsyncStorage.removeItem("lectura");
      await AsyncStorage.removeItem("ticket");
      await AsyncStorage.removeItem("estado");
      await AsyncStorage.removeItem("medidor");
      await AsyncStorage.removeItem("medidor");
    } catch (error) {
      console.error("Error al eliminar datos:", error);
    }
  };
  useEffect(() => {
    eliminarAsyncStorage();
  }, []); */
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
      {/* <Tabs.Screen
        name="capturas"
        options={{
          title: "Capturas",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="document-text-outline" size={size} color={color} />
          ),
        }}
      /> */}
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
        name="carpeta-recibos"
        options={{
          title: "Recibos",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="folder-outline" size={size} color={color} />
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
      <Tabs.Screen
        name="seleccion-estados"
        options={{
          href: null, // Ocultar de la barra de navegación
        }}
      />
    </Tabs>
  );
}
