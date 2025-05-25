import { View, StyleSheet } from "react-native"
import ControlPanel from "./(tabs)/index"

export default function Page() {
  return (
    <View style={styles.container}>
      <ControlPanel />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
  },
})

