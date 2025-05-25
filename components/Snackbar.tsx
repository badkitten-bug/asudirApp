"use client"

import { useEffect } from "react"
import { StyleSheet, View, Text, Animated, TouchableOpacity, Dimensions } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useDispatch, useSelector } from "react-redux"
import { hideSnackbar } from "../store/snackbarSlice"

const { width } = Dimensions.get("window")

export default function Snackbar() {
  const dispatch = useDispatch()
  const { visible, message, type, duration } = useSelector((state:any) => state.snackbar)
  const translateY = new Animated.Value(100)

  useEffect(() => {
    if (visible) {
      // Mostrar el snackbar
      Animated.spring(translateY, {
        toValue: 0,
        useNativeDriver: true,
        tension: 80,
        friction: 9,
      }).start()

      // Ocultar automáticamente después de la duración
      const timer = setTimeout(() => {
        handleHide()
      }, duration)

      return () => clearTimeout(timer)
    } else {
      // Ocultar el snackbar
      Animated.timing(translateY, {
        toValue: 100,
        duration: 200,
        useNativeDriver: true,
      }).start()
    }
  }, [visible])

  const handleHide = () => {
    Animated.timing(translateY, {
      toValue: 100,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      dispatch(hideSnackbar())
    })
  }

  if (!visible) return null

  // Configuración según el tipo de mensaje
  const getTypeStyles = (): { backgroundColor: string; icon: "checkmark-circle-outline" | "alert-circle-outline" | "warning-outline" | "information-circle-outline" } => {
    switch (type) {
      case "success":
        return {
          backgroundColor: "#4CAF50",
          icon: "checkmark-circle-outline",
        }
      case "error":
        return {
          backgroundColor: "#F44336",
          icon: "alert-circle-outline",
        }
      case "warning":
        return {
          backgroundColor: "#FF9800",
          icon: "warning-outline",
        }
      default:
        return {
          backgroundColor: "#2196F3",
          icon: "information-circle-outline",
        }
    }
  }

  const typeStyle = getTypeStyles()

  return (
    <Animated.View
      style={[styles.container, { transform: [{ translateY }], backgroundColor: typeStyle.backgroundColor }]}
    >
      <View style={styles.content}>
        <Ionicons name={typeStyle.icon} size={24} color="white" style={styles.icon} />
        <Text style={styles.message}>{message}</Text>
      </View>
      <TouchableOpacity onPress={handleHide} style={styles.closeButton}>
        <Ionicons name="close" size={20} color="white" />
      </TouchableOpacity>
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: "#333",
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    paddingHorizontal: 16,
    elevation: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.27,
    shadowRadius: 4.65,
    maxWidth: width - 40,
    zIndex: 9999,
  },
  content: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  icon: {
    marginRight: 10,
  },
  message: {
    color: "white",
    fontSize: 14,
    flex: 1,
  },
  closeButton: {
    padding: 4,
  },
})

