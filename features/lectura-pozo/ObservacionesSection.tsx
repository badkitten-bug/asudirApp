import React from "react";
import { View, Text, TextInput } from "react-native";

interface Props {
  observaciones: string;
  setObservaciones: (v: string) => void;
  styles: any;
}

export const ObservacionesSection: React.FC<Props> = ({ observaciones, setObservaciones, styles }) => (
  <View style={styles.card}>
    <Text style={styles.inputLabel}>Observaciones</Text>
    <TextInput
      style={[styles.input, { minHeight: 60 }]}
      placeholder="Ingrese cualquier información relevante"
      value={observaciones}
      onChangeText={setObservaciones}
      multiline
    />
  </View>
);
