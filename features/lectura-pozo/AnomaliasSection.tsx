import React from 'react';
import {
  View,
  Text,
  TextInput,
} from 'react-native';
import Checkbox from '../../components/Checkbox';
import { ANOMALIAS_ELECTRICO } from './lecturaPozo.constants';

interface AnomaliasSectionProps {
  // Props del formulario
  mostrarAnomaliasElec: boolean;
  anomaliasElec: string[];
  cambioSerieElec: string;
  otroElec: string;
  
  // Setters del formulario
  setMostrarAnomaliasElec: (value: boolean) => void;
  setAnomaliasElec: (value: string[]) => void;
  setCambioSerieElec: (value: string) => void;
  setOtroElec: (value: string) => void;
  
  // Handler de checkbox
  handleCheck: (arr: string[], setArr: (v: string[]) => void, value: string) => void;
  
  // Estilos
  styles: any;
}

export function AnomaliasSection({
  mostrarAnomaliasElec,
  anomaliasElec,
  cambioSerieElec,
  otroElec,
  setMostrarAnomaliasElec,
  setAnomaliasElec,
  setCambioSerieElec,
  setOtroElec,
  handleCheck,
  styles,
}: AnomaliasSectionProps) {
  return (
    <View style={{ marginBottom: 12 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
        <Checkbox 
          checked={mostrarAnomaliasElec} 
          onPress={() => setMostrarAnomaliasElec(!mostrarAnomaliasElec)} 
        />
        <Text style={{ marginLeft: 8 }}>¿Hay anomalías en el medidor eléctrico?</Text>
      </View>
      {mostrarAnomaliasElec && (
        <View style={{ backgroundColor: '#fafafa', borderRadius: 8, padding: 8 }}>
          {ANOMALIAS_ELECTRICO.map((anomalia) => (
            <View key={anomalia} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
              <Checkbox 
                checked={anomaliasElec.includes(anomalia)} 
                onPress={() => handleCheck(anomaliasElec, setAnomaliasElec, anomalia)} 
              />
              <Text style={{ marginLeft: 8 }}>{anomalia}</Text>
              {anomalia === 'Cambio de Medidor' && anomaliasElec.includes('Cambio de Medidor') && (
                <TextInput 
                  style={[styles.input, { marginLeft: 8, flex: 1 }]} 
                  placeholder="Ingresar número de serie del nuevo medidor" 
                  value={cambioSerieElec} 
                  onChangeText={setCambioSerieElec} 
                />
              )}
              {anomalia === 'Otro' && anomaliasElec.includes('Otro') && (
                <TextInput 
                  style={[styles.input, { marginLeft: 8, flex: 1 }]} 
                  placeholder="Describa la anomalía" 
                  value={otroElec} 
                  onChangeText={setOtroElec} 
                />
              )}
            </View>
          ))}
        </View>
      )}
    </View>
  );
} 