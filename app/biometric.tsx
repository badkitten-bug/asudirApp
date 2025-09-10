"use client";
import { View, StyleSheet, Image, TouchableOpacity, Text, Alert } from "react-native";
import { useState } from "react";
import { useRouter } from "expo-router";
import { CameraView } from 'expo-camera';
import { useSelector } from "@/store";
import { validateFace } from "@/services/api";

const logo = require("@/assets/images/icon.png");

export default function BiometricScreen() {
  const router = useRouter();
  const { email, dni, address, f1 } = useSelector((state) => state.user);
  const [cameraActive, setCameraActive] = useState(false);
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const [isValidating, setIsValidating] = useState(false);

  const activateCamera = () => {
    setCameraActive(true);
  };

  const takePicture = async () => {
    if (!cameraActive) return;
    
    // Simular captura de foto (en una implementación real usarías cameraRef.current?.takePictureAsync())
    // Por ahora usamos una imagen base64 de ejemplo
    const sampleBase64 = "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=";
    setCapturedPhoto(sampleBase64);
    setCameraActive(false);
  };

  const handleValidate = async () => {
    if (!capturedPhoto) {
      Alert.alert("Error", "Primero debes tomar una foto");
      return;
    }

    setIsValidating(true);

    const result = await validateFace({
      photoBase64: capturedPhoto,
      email,
      dni,
      f1,
      address,
      key: 'test-key-123', // Key del QR validado
    });

    if (result.isValid) {
      router.replace("/success");
    } else {
      Alert.alert("Validación", "No fue posible validar el rostro.");
    }

    setIsValidating(false);
  };
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Image source={logo} style={styles.logo} resizeMode="contain" />
      </View>

      <View style={styles.cameraView}>
        {cameraActive && (
          <CameraView
            style={styles.camera}
            facing="front"
          >
            <View style={styles.frame} />
            <View style={styles.indicator} />
            <View style={styles.sunIcon}>
              <Text style={{ fontSize: 24 }}>☀️</Text>
            </View>
          </CameraView>
        )}
        
        {capturedPhoto && !cameraActive && (
          <Image 
            source={{ uri: capturedPhoto }} 
            style={styles.preview} 
          />
        )}
        
        {!cameraActive && !capturedPhoto && (
          <View style={styles.placeholder}>
            <Text style={styles.placeholderText}>📷</Text>
            <Text style={styles.placeholderSubtext}>
              Presiona el botón para activar la cámara
            </Text>
          </View>
        )}
      </View>

      {!cameraActive && !capturedPhoto && (
        <TouchableOpacity style={styles.capture} onPress={activateCamera}>
          <Text style={styles.captureText}>📷 Activar Cámara</Text>
        </TouchableOpacity>
      )}

      {cameraActive && (
        <TouchableOpacity style={styles.capture} onPress={takePicture}>
          <Text style={styles.captureText}>📸 Tomar Foto</Text>
        </TouchableOpacity>
      )}

      {capturedPhoto && !cameraActive && (
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.retakeButton} onPress={() => {
            setCapturedPhoto(null);
            setCameraActive(true);
          }}>
            <Text style={styles.retakeText}>🔄 Tomar Otra</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.capture, isValidating && styles.captureDisabled]} 
            onPress={handleValidate}
            disabled={isValidating}
          >
            <Text style={styles.captureText}>
              {isValidating ? "Validando..." : "✅ Validar Biometría"}
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: "white",
    paddingHorizontal: 24
  },
  header: {
    paddingTop: 80,
    alignItems: "center",
  },
  logo: { 
    width: 160, 
    height: 80, 
    marginTop: 10 
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
  camera: {
    flex: 1,
    width: "100%",
    borderRadius: 12,
  },
  preview: { 
    width: "90%", 
    height: "75%", 
    borderRadius: 6, 
    resizeMode: "cover" 
  },
  placeholder: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8f9fa",
    width: "90%",
    borderRadius: 6,
  },
  placeholderText: {
    fontSize: 64,
    marginBottom: 16,
  },
  placeholderSubtext: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    paddingHorizontal: 20,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  retakeButton: {
    backgroundColor: "#6c757d",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    flex: 0.45,
  },
  retakeText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
    textAlign: "center",
  },
  captureDisabled: {
    backgroundColor: "#ccc",
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
