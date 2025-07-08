import React from "react";
import { View, Text, TextInput, TouchableOpacity, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Checkbox from '@/components/Checkbox';

interface Props {
  lecturaVolumen: string;
  setLecturaVolumen: (v: string) => void;
  gasto: string;
  setGasto: (v: string) => void;
  photoUri: string | null;
  handleChoosePhotoOption: () => void;
  anomaliasVol: string[];
  setAnomaliasVol: (v: string[]) => void;
  mostrarAnomaliasVol: boolean;
  setMostrarAnomaliasVol: (v: boolean) => void;
  cambioSerieVol: string;
  setCambioSerieVol: (v: string) => void;
  otroVol: string;
  setOtroVol: (v: string) => void;
  ANOMALIAS_VOLUMETRICO: string[];
  styles: any;
  handleCheck: (arr: string[], setArr: (v: string[]) => void, value: string) => void;
}

export const MedidorVolumetricoSection: React.FC<Props> = ({
  lecturaVolumen,
  setLecturaVolumen,
  gasto,
  setGasto,
  photoUri,
  handleChoosePhotoOption,
  anomaliasVol,
  setAnomaliasVol,
  mostrarAnomaliasVol,
  setMostrarAnomaliasVol,
  cambioSerieVol,
  setCambioSerieVol,
  otroVol,
  setOtroVol,
  ANOMALIAS_VOLUMETRICO,
  styles,
  handleCheck,
}) => (
  <View style={styles.sectionContainer}>
    <Text style={[styles.sectionTitle, { color: '#00A86B' }]}>Medidor Volumétrico</Text>
    <Text style={styles.inputLabel}>Lectura Volumétrica (m³) *</Text>
    <TextInput
      style={styles.input}
      placeholder="Ingrese lectura volumétrica (solo números enteros)"
      value={lecturaVolumen}
      onChangeText={setLecturaVolumen}
      keyboardType="numeric"
    />
    <Text style={styles.inputLabel}>Gasto (l/s) - Máximo 200 *</Text>
    <TextInput
      style={styles.input}
      placeholder="Ingrese gasto volumétrico (máximo 200)"
      value={gasto}
      onChangeText={setGasto}
      keyboardType="numeric"
    />
    {/* Foto obligatoria del medidor volumétrico */}
    <Text style={[styles.inputLabel, { color: '#e74c3c', fontWeight: 'bold' }]}>Foto del Medidor Volumétrico *</Text>
    {photoUri ? (
      <View style={styles.photoPreviewContainer}>
        <Image source={{ uri: photoUri }} style={styles.photoPreview} />
        <TouchableOpacity style={styles.retakeButton} onPress={handleChoosePhotoOption}>
          <Ionicons name="camera" size={20} color="white" />
          <Text style={styles.photoButtonText}>Volver a tomar</Text>
        </TouchableOpacity>
      </View>
    ) : (
      <TouchableOpacity style={[styles.photoButton, { backgroundColor: '#e74c3c' }]} onPress={handleChoosePhotoOption}>
        <Ionicons name="camera-outline" size={20} color="white" />
        <Text style={styles.photoButtonText}>Tomar Foto (Obligatorio)</Text>
      </TouchableOpacity>
    )}
    {/* Anomalías volumétrico */}
    <View style={{ marginBottom: 12 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
        <Checkbox checked={mostrarAnomaliasVol} onPress={() => setMostrarAnomaliasVol(!mostrarAnomaliasVol)} />
        <Text style={{ marginLeft: 8 }}>¿Hay anomalías en el medidor volumétrico?</Text>
      </View>
      {mostrarAnomaliasVol && (
        <View style={{ backgroundColor: '#fafafa', borderRadius: 8, padding: 8 }}>
          {ANOMALIAS_VOLUMETRICO.map((anomalia) => (
            <View key={anomalia} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
              <Checkbox checked={anomaliasVol.includes(anomalia)} onPress={() => handleCheck(anomaliasVol, setAnomaliasVol, anomalia)} />
              <Text style={{ marginLeft: 8 }}>{anomalia}</Text>
              {anomalia === 'Cambio de Medidor' && anomaliasVol.includes('Cambio de Medidor') && (
                <TextInput style={[styles.input, { marginLeft: 8, flex: 1 }]} placeholder="Ingresar número de serie del nuevo medidor" value={cambioSerieVol} onChangeText={setCambioSerieVol} />
              )}
              {anomalia === 'Otro' && anomaliasVol.includes('Otro') && (
                <TextInput style={[styles.input, { marginLeft: 8, flex: 1 }]} placeholder="Describa la anomalía" value={otroVol} onChangeText={setOtroVol} />
              )}
            </View>
          ))}
        </View>
      )}
    </View>
  </View>
); 