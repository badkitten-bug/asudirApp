"use client"

import { View, KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard, ScrollView, StatusBar as RNStatusBar } from "react-native"
import { StatusBar } from "expo-status-bar"
import Constants from "expo-constants"
import { useAuth } from "@/features/auth/hooks/useAuth"
import { LoginForm } from "@/features/auth/components/LoginForm"
import { authStyles } from "@/features/auth/styles/auth.styles"

const STATUSBAR_HEIGHT = Constants.statusBarHeight || 0

export default function LoginScreen() {
  const { handleLogin, isLoading } = useAuth()

  const dismissKeyboard = () => {
    Keyboard.dismiss()
  }

  return (
    <View style={authStyles.container}>
      {/* Configuración del StatusBar */}
      <RNStatusBar backgroundColor="#f5f5f5" barStyle="dark-content" translucent={true} />
      <StatusBar style="dark" />

      {/* Espacio para el StatusBar */}
      <View style={{ height: STATUSBAR_HEIGHT, backgroundColor: "#f5f5f5" }} />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <TouchableWithoutFeedback onPress={dismissKeyboard}>
          <ScrollView
            contentContainerStyle={{ flexGrow: 1 }}
            keyboardShouldPersistTaps="handled"
          >
            <LoginForm
              onSubmit={handleLogin}
              isLoading={isLoading}
            />
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </View>
  )
}

