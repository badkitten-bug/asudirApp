import { Redirect } from "expo-router"
import { useSelector } from "react-redux"

export default function Index() {
  const { isAuthenticated, isLoading } = useSelector((state:any) => state.auth)

  // Si todavía está cargando, no redirigir aún
  if (isLoading) {
    return null
  }

  // Redirigir según el estado de autenticación
  if (isAuthenticated) {
    return <Redirect href="/(tabs)" />
  } else {
    return <Redirect href="/(auth)/login" />
  }
}

