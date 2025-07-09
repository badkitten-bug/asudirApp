"use client"
import { View, Text, StyleSheet, TouchableOpacity, StatusBar as RNStatusBar, ScrollView } from "react-native"
import { StatusBar } from "expo-status-bar"
import { useSelector } from "react-redux"
import { useRouter } from "expo-router"
import { logout, removeUser, selectAuthLastSyncDate, syncUsers } from "../../store/authSlice"
import { showSnackbar } from "../../store/snackbarSlice"
import Constants from "expo-constants"
import { useDispatch } from "../../store" // Importar el useDispatch tipado

const STATUSBAR_HEIGHT = Constants.statusBarHeight || 0

export default function PerfilScreen() {
  const user = useSelector((state:any) => state.auth.user)
  const lastSyncDate = useSelector(selectAuthLastSyncDate)
  const dispatch = useDispatch() // Usar el dispatch tipado
  const router = useRouter()

  const handleLogout = async () => {
    try {
      // Primero eliminamos el usuario de AsyncStorage
      await dispatch(removeUser()).unwrap()

      // Luego actualizamos el estado de Redux
      dispatch(logout())

      // Mostramos mensaje de éxito
      dispatch(
        showSnackbar({
          message: "Has cerrado sesión correctamente",
          type: "info",
          duration: 3000,
        }),
      )

      // Usar setTimeout para asegurar que la navegación ocurra después del render
      setTimeout(() => {
        router.replace("/(auth)/login")
      }, 100)
    } catch (error) {
      console.error("Error al cerrar sesión:", error)
      dispatch(
        showSnackbar({
          message: "Error al cerrar sesión",
          type: "error",
          duration: 3000,
        }),
      )
    }
  }

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

  // Formatear la fecha de última sincronización
  const formatSyncDate = () => {
    if (!lastSyncDate) return "Nunca"

    try {
      const date = new Date(lastSyncDate)
      return date.toLocaleString()
    } catch (error) {
      return "Fecha inválida"
    }
  }

  return (
    <View style={styles.container}>
      {/* Configuración del StatusBar nativo */}
      <RNStatusBar backgroundColor="#fff" barStyle="dark-content" translucent={true} />

      {/* StatusBar de Expo como respaldo */}
      <StatusBar style="dark" />

      {/* Espacio para el StatusBar */}
      <View style={{ height: STATUSBAR_HEIGHT, backgroundColor: "#fff" }} />

      <Text style={styles.title}>Perfil</Text>

      <ScrollView style={styles.scrollView}>
        {user && (
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{user.name}</Text>
            <Text style={styles.userEmail}>{user.email}</Text>
          </View>
        )}

        <View style={styles.syncInfo}>
          <Text style={styles.syncTitle}>Información de sincronización</Text>
          <Text style={styles.syncText}>Última sincronización: {formatSyncDate()}</Text>

          <TouchableOpacity style={styles.syncButton} onPress={handleSyncUsers}>
            <Text style={styles.syncButtonText}>Sincronizar usuarios</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>Cerrar Sesión</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginTop: 20,
    marginBottom: 24,
    textAlign: "center",
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 16,
  },
  userInfo: {
    alignItems: "center",
    marginBottom: 32,
  },
  userName: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 8,
  },
  userEmail: {
    fontSize: 16,
    color: "#666",
  },
  syncInfo: {
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
    padding: 16,
    marginBottom: 32,
  },
  syncTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 8,
  },
  syncText: {
    fontSize: 14,
    color: "#666",
    marginBottom: 16,
  },
  syncButton: {
    backgroundColor: "#00A86B",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignSelf: "flex-start",
  },
  syncButtonText: {
    color: "white",
    fontWeight: "500",
    fontSize: 14,
  },
  logoutButton: {
    backgroundColor: "#ff3b30",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignSelf: "center",
    marginBottom: 32,
  },
  logoutText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
})

