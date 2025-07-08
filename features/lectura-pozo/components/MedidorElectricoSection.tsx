import React from "react";
import { View, Text, TextInput, TouchableOpacity, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Checkbox from "../../components/Checkbox";

interface Props {
  lecturaElectrica: string;
  setLecturaElectrica: (v: string) => void;
  photoUriElec: string | null;
  handleChoosePhotoOptionElec: () => void;
  anomaliasElec: string[];
  setAnomaliasElec: (v: string[]) => void;
  mostrarAnomaliasElec: boolean;
  setMostrarAnomaliasElec: (v: boolean) => void;
  cambioSerieElec: string;
  setCambioSerieElec: (v: string) => void;
  otroElec: string;
  setOtroElec: (v: string) => void;
  ANOMALIAS_ELECTRICO: string[];
  styles: any;
  handleCheck: (arr: string[], setArr: (v: string[]) => void, value: string) => void;
}

export const MedidorElectricoSection: React.FC<Props> = ({
  lecturaElectrica,
  setLecturaElectrica,
  photoUriElec,
  handleChoosePhotoOptionElec,
  anomaliasElec,
  setAnomaliasElec,
  mostrarAnomaliasElec,
  setMostrarAnomaliasElec,
  cambioSerieElec,
  setCambioSerieElec,
  otroElec,
  setOtroElec,
  ANOMALIAS_ELECTRICO,
  styles,
  handleCheck,
}) => (
  <View style={styles.card}>
    <Text style={[styles.sectionTitle, { color: '#00A86B' }]}>Medidor Eléctrico</Text>
    <Text style={styles.inputLabel}>Lectura Eléctrica (kWh) *</Text>
    <TextInput
      style={styles.input}
      placeholder="Ingrese la lectura eléctrica (solo números enteros)"
      value={lecturaElectrica}
      onChangeText={setLecturaElectrica}
      keyboardType="numeric"
    />

    {/* Foto obligatoria del medidor eléctrico */}
    <Text style={[styles.inputLabel, { color: '#e74c3c', fontWeight: 'bold' }]}>Foto del Medidor Eléctrico *</Text>
    {photoUriElec ? (
      <View style={styles.photoPreviewContainer}>
        <Image source={{ uri: photoUriElec }} style={styles.photoPreview} />
        <TouchableOpacity style={styles.retakeButton} onPress={handleChoosePhotoOptionElec}>
          <Ionicons name="camera" size={20} color="white" />
          <Text style={styles.photoButtonText}>Volver a tomar</Text>
        </TouchableOpacity>
      </View>
    ) : (
      <TouchableOpacity style={[styles.photoButton, { backgroundColor: '#e74c3c' }]} onPress={handleChoosePhotoOptionElec}>
        <Ionicons name="camera-outline" size={20} color="white" />
        <Text style={styles.photoButtonText}>Tomar Foto (Obligatorio)</Text>
      </TouchableOpacity>
    )}

    {/* Anomalías eléctrico */}
    <View style={{ marginBottom: 12 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
        <Checkbox checked={mostrarAnomaliasElec} onPress={() => setMostrarAnomaliasElec(!mostrarAnomaliasElec)} />
        <Text style={{ marginLeft: 8 }}>¿Hay anomalías en el medidor eléctrico?</Text>
      </View>
      {mostrarAnomaliasElec && (
        <View style={{ backgroundColor: '#fafafa', borderRadius: 8, padding: 8 }}>
          {ANOMALIAS_ELECTRICO.map((anomalia) => (
            <View key={anomalia} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
              <Checkbox checked={anomaliasElec.includes(anomalia)} onPress={() => handleCheck(anomaliasElec, setAnomaliasElec, anomalia)} />
              <Text style={{ marginLeft: 8 }}>{anomalia}</Text>
              {anomalia === 'Cambio de Medidor' && anomaliasElec.includes('Cambio de Medidor') && (
                <TextInput style={[styles.input, { marginLeft: 8, flex: 1 }]} placeholder="Ingresar número de serie del nuevo medidor" value={cambioSerieElec} onChangeText={setCambioSerieElec} />
              )}
              {anomalia === 'Otro' && anomaliasElec.includes('Otro') && (
                <TextInput style={[styles.input, { marginLeft: 8, flex: 1 }]} placeholder="Describa la anomalía" value={otroElec} onChangeText={setOtroElec} />
              )}
            </View>
          ))}
        </View>
      )}
    </View>
  </View>
);
