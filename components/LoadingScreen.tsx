import { View, ActivityIndicator, StyleSheet, Text } from "react-native"

interface LoadingScreenProps {
  message?: string
}

export default function LoadingScreen({ message = "Cargando..." }: LoadingScreenProps) {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#00A86B" />
      {message && <Text style={styles.message}>{message}</Text>}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
  },
  message: {
    marginTop: 16,
    fontSize: 16,
    color: "#333",
  },
})

