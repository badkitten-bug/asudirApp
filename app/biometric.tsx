"use client";
import { View, StyleSheet, Image, TouchableOpacity, Text } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

export default function BiometricScreen() {
  const router = useRouter();
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <View style={styles.logoBox}>
            <Text style={styles.logoText}>AM</Text>
          </View>
          <Text style={styles.companyText}>3xADDRESS.com</Text>
        </View>
      </View>

      <View style={styles.cameraView}>
        <Image 
          source={{ uri: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=640&q=80" }} 
          style={styles.preview} 
        />
        <View style={styles.frame} />
        <View style={styles.indicator} />
        <View style={styles.sunIcon}>
          <Ionicons name="sunny" size={24} color="#FFA500" />
        </View>
      </View>

      <TouchableOpacity style={styles.capture} onPress={() => router.replace("/success")}>
        <Text style={styles.captureText}>Validar biometría</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: "white" 
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    alignItems: "center",
  },
  logoContainer: {
    alignItems: "center",
  },
  logoBox: {
    width: 80,
    height: 50,
    backgroundColor: "#1E78C6",
    borderRadius: 6,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  logoText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "white",
  },
  companyText: {
    fontSize: 14,
    color: "#1E78C6",
    fontWeight: "500",
  },
  cameraView: { 
    flex: 1, 
    backgroundColor: "#d9d6d2", 
    alignItems: "center", 
    justifyContent: "center",
    margin: 20,
    borderRadius: 12,
    position: "relative"
  },
  preview: { 
    width: "90%", 
    height: "75%", 
    borderRadius: 6, 
    resizeMode: "cover" 
  },
  frame: { 
    position: "absolute", 
    width: "70%", 
    height: "45%", 
    borderColor: "#6fd3e7", 
    borderWidth: 6, 
    borderRadius: 6 
  },
  indicator: { 
    position: "absolute", 
    bottom: 120, 
    width: 28, 
    height: 28, 
    borderRadius: 14, 
    backgroundColor: "#fff", 
    borderWidth: 4, 
    borderColor: "#0ea5b7" 
  },
  sunIcon: {
    position: "absolute",
    bottom: 80,
    width: 40,
    height: 40,
    backgroundColor: "white",
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  capture: { 
    position: "absolute", 
    bottom: 40, 
    left: 0,
    right: 0,
    marginHorizontal: 20,
    backgroundColor: "#1E78C6", 
    paddingVertical: 16, 
    borderRadius: 10 
  },
  captureText: { 
    color: "#fff", 
    fontWeight: "700",
    fontSize: 16,
    textAlign: "center"
  },
});
