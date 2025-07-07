"use client"

import { useState, useEffect, useRef } from "react"
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  ScrollView,
  Dimensions,
  Animated,
  StatusBar as RNStatusBar,
} from "react-native"
import { StatusBar } from "expo-status-bar"
import { Ionicons } from "@expo/vector-icons"
import { useRouter } from "expo-router"
import { useSelector } from "react-redux"
import { showSnackbar } from "../../store/snackbarSlice"
import Constants from "expo-constants"
import { useDispatch } from "../../store"
// Importar syncUsers
import { validateCredentials, syncUsers } from "../../store/authSlice"

const { height: SCREEN_HEIGHT } = Dimensions.get("window")
const STATUSBAR_HEIGHT = Constants.statusBarHeight || 0

export default function LoginScreen() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [keyboardHeight, setKeyboardHeight] = useState(0)
  const [keyboardVisible, setKeyboardVisible] = useState(false)
  // Corregir el tipo del ref para ScrollView
  const scrollViewRef = useRef<ScrollView>(null)
  const formPositionY = useRef(new Animated.Value(0)).current

  const router = useRouter()
  const dispatch = useDispatch()
  const { isAuthenticated } = useSelector((state:any) => state.auth)

  // Redirigir si ya está autenticado
  useEffect(() => {
    if (isAuthenticated) {
      router.replace("/(tabs)")
    }
  }, [isAuthenticated])

  // Manejar eventos del teclado
  useEffect(() => {
    const keyboardWillShowListener = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow",
      (e) => {
        setKeyboardVisible(true)
        setKeyboardHeight(e.endCoordinates.height)

        // Animar el formulario hacia arriba cuando aparece el teclado
        Animated.timing(formPositionY, {
          toValue: -Math.min(150, e.endCoordinates.height * 0.4),
          duration: 300,
          useNativeDriver: true,
        }).start()

        // Scroll al input activo - verificar que el ref existe
        if (scrollViewRef.current) {
          setTimeout(() => {
            scrollViewRef.current?.scrollToEnd({ animated: true })
          }, 100)
        }
      },
    )

    const keyboardWillHideListener = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide",
      () => {
        setKeyboardVisible(false)
        setKeyboardHeight(0)

        // Devolver el formulario a su posición original
        Animated.timing(formPositionY, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }).start()
      },
    )

    return () => {
      keyboardWillShowListener.remove()
      keyboardWillHideListener.remove()
    }
  }, [])

  // Modificar la función handleLogin para usar las credenciales desde Redux
  const handleLogin = async () => {
    // Validación básica
    if (!email.trim()) {
      dispatch(
        showSnackbar({
          message: "Por favor ingresa tu email",
          type: "warning",
          duration: 3000,
        }),
      )
      return
    }

    if (!password.trim()) {
      dispatch(
        showSnackbar({
          message: "Por favor ingresa tu contraseña",
          type: "warning",
          duration: 3000,
        }),
      )
      return
    }

    try {
      console.log("Intentando iniciar sesión con:", email, password)

      // Validar credenciales usando el thunk
      const login = await dispatch(validateCredentials({ email, password })).unwrap()
      console.log("Respuesta del backend:", login)

      // Mostrar mensaje de éxito
      if(login){
      dispatch(
        showSnackbar({
          message: "¡Inicio de sesión exitoso!",
          type: "success",
          duration: 2000,
        }),
      )
    }
    else{
      dispatch(
        showSnackbar({
          message: "Email o contraseña incorrectos",
          type: "error",
          duration: 3000,
        }),
      )
      return
    }

      // Navegar al panel de control después de un breve retraso
      setTimeout(() => {
        router.replace("/(tabs)")
      }, 500)
    } catch (error) {
      console.error("Error en el proceso de login:", error)
      // Mostrar el mensaje real del backend si existe
      let mensaje = "Email o contraseña incorrectos"
      if (error && typeof error === 'object') {
        const err = error as any;
        if ('message' in err && typeof err.message === 'string') {
          mensaje = err.message;
        }
        if ('response' in err && err.response && typeof err.response === 'object') {
          const response = err.response;
          if (response.data && response.data.error && response.data.error.message) {
            mensaje = response.data.error.message || mensaje;
          }
        }
      }
      dispatch(
        showSnackbar({
          message: mensaje,
          type: "error",
          duration: 4000,
        }),
      )
    }
  }

  // Añadir función para sincronizar usuarios
  const handleSyncUsers = async () => {
    try {
      dispatch(
        showSnackbar({
          message: "Sincronizando usuarios...",
          type: "info",
          duration: 2000,
        }),
      )

      await dispatch(syncUsers()).unwrap()

      dispatch(
        showSnackbar({
          message: "Usuarios sincronizados correctamente",
          type: "success",
          duration: 3000,
        }),
      )
    } catch (error) {
      console.error("Error al sincronizar usuarios:", error)
      dispatch(
        showSnackbar({
          message: "Error al sincronizar usuarios",
          type: "error",
          duration: 3000,
        }),
      )
    }
  }

  // Añadir esta función para mostrar las credenciales disponibles

  // Función para cerrar el teclado al tocar fuera de los inputs
  const dismissKeyboard = () => {
    Keyboard.dismiss()
  }

  // Verificar si la imagen existe
  let backgroundImage
  try {
    backgroundImage = require("@/assets/images/bg.png")
  } catch (error) {
    console.warn("No se pudo cargar la imagen de fondo:", error)
    backgroundImage = null
  }

  // Modificar el return para añadir botones de sincronización y ayuda
  return (
    <View style={styles.container}>
      {/* Usar StatusBar nativo para asegurar que se respete */}
      <RNStatusBar backgroundColor="transparent" barStyle="light-content" translucent={true} />

      {/* Usar StatusBar de Expo como respaldo */}
      <StatusBar style="light" />

      <TouchableWithoutFeedback onPress={dismissKeyboard}>
        <View style={styles.innerContainer}>
          {/* Espacio para el StatusBar */}
          <View style={{ height: STATUSBAR_HEIGHT }} />

          {/* Imagen de fondo */}
          {backgroundImage ? (
            <Image style={styles.imgTop} source={backgroundImage} />
          ) : (
            <View style={[styles.imgTop, { backgroundColor: "#00A86B" }]} />
          )}

          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.keyboardView}
            keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
          >
            <ScrollView
              ref={scrollViewRef}
              contentContainerStyle={[
                styles.scrollContent,
                { paddingBottom: keyboardVisible ? keyboardHeight * 0 : 20 },
              ]}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              <Animated.View style={[styles.formContainer, { transform: [{ translateY: formPositionY }] }]}>
                <Text style={styles.title}>Iniciar Sesión</Text>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Correo</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Ingresa tu Email aquí"
                    placeholderTextColor="#aaa"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Contraseña</Text>
                  <View style={styles.passwordContainer}>
                    <TextInput
                      style={styles.passwordInput}
                      placeholder="Ingresa tu Contraseña aquí"
                      placeholderTextColor="#aaa"
                      value={password}
                      onChangeText={setPassword}
                      secureTextEntry={!showPassword}
                      autoCapitalize="none"
                    />
                    <TouchableOpacity style={styles.eyeIcon} onPress={() => setShowPassword(!showPassword)}>
                      <Ionicons name={showPassword ? "eye-off-outline" : "eye-outline"} size={24} color="#888" />
                    </TouchableOpacity>
                  </View>
                </View>

                <TouchableOpacity style={styles.button} onPress={handleLogin}>
                  <Text style={styles.buttonText}>Iniciar Sesión</Text>
                </TouchableOpacity>

                {/* Botones de ayuda y sincronización */}
                <View style={styles.helpButtonsContainer}>
                  <TouchableOpacity style={styles.helpButton} onPress={handleSyncUsers}>
                    <Ionicons name="sync-outline" size={20} color="#00A86B" />
                    <Text style={styles.helpButtonText}>Sincronizar usuarios</Text>
                  </TouchableOpacity>
                </View>
              </Animated.View>
            </ScrollView>
          </KeyboardAvoidingView>
        </View>
      </TouchableWithoutFeedback>
    </View>
  )
}

// Añadir estilos para los nuevos botones
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f0f0f0",
  },
  innerContainer: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "flex-end",
  },
  imgTop: {
    position: "absolute",
    height: 450,
    width: "100%",
    top: 0,
    left: 0,
  },
  formContainer: {
    backgroundColor: "rgba(200, 200, 200, 0.7)",
    borderRadius: 30,
    padding: 24,
    paddingVertical: 48,
    width: "90%",
    alignSelf: "center",
    marginTop: SCREEN_HEIGHT * 0.35, // Posición relativa a la altura de la pantalla
  },
  title: {
    fontSize: 36,
    fontWeight: "bold",
    color: "#00A86B",
    textAlign: "center",
    marginBottom: 24,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    color: "#333",
  },
  input: {
    backgroundColor: "white",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  passwordContainer: {
    flexDirection: "row",
    backgroundColor: "white",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  passwordInput: {
    flex: 1,
    padding: 12,
    fontSize: 16,
  },
  eyeIcon: {
    padding: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  button: {
    backgroundColor: "#00A86B",
    borderRadius: 8,
    padding: 16,
    alignItems: "center",
    marginTop: 24,
  },
  buttonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  helpButtonsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 16,
  },
  helpButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 8,
  },
  helpButtonText: {
    color: "#00A86B",
    marginLeft: 4,
    fontSize: 14,
  },
})

