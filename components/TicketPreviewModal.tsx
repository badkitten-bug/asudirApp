import React from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity, ScrollView, Image } from 'react-native';

interface TicketPreviewModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
  ticketData: {
    pozoNombre: string;
    pozoId: number | string;
    volumen: string;
    gasto: string;
    lecturaElectrica: string;
    observaciones: string;
    anomaliasVol: string[];
    anomaliasElec: string[];
    fecha: string;
    photoUri?: string | null;
    photoUriElec?: string | null;
    // Puedes agregar más campos si lo necesitas
  };
}

const TicketPreviewModal: React.FC<TicketPreviewModalProps> = ({ visible, onClose, onConfirm, ticketData }) => {
  return (
    <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <ScrollView contentContainerStyle={styles.content}>
            <Text style={styles.title}>Confirmar Lectura</Text>
            <Text style={styles.label}>Pozo:</Text>
            <Text style={styles.value}>{ticketData.pozoNombre} (ID: {ticketData.pozoId})</Text>
            <Text style={styles.label}>Fecha:</Text>
            <Text style={styles.value}>{ticketData.fecha}</Text>
            <Text style={styles.label}>Volumen registrado:</Text>
            <Text style={styles.value}>{ticketData.volumen} m³</Text>
            <Text style={styles.label}>Gasto registrado:</Text>
            <Text style={styles.value}>{ticketData.gasto} l/s</Text>
            <Text style={styles.label}>Lectura eléctrica:</Text>
            <Text style={styles.value}>{ticketData.lecturaElectrica} kWh</Text>
            <Text style={styles.label}>Anomalías Volumétrico:</Text>
            <Text style={styles.value}>{ticketData.anomaliasVol.length > 0 ? ticketData.anomaliasVol.join(', ') : 'Ninguna'}</Text>
            <Text style={styles.label}>Anomalías Eléctrico:</Text>
            <Text style={styles.value}>{ticketData.anomaliasElec.length > 0 ? ticketData.anomaliasElec.join(', ') : 'Ninguna'}</Text>
            <Text style={styles.label}>Observaciones:</Text>
            <Text style={styles.value}>{ticketData.observaciones || 'Sin observaciones'}</Text>
            <Text style={styles.label}>Fotos de la lectura:</Text>
            <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', width: '100%', marginVertical: 8 }}>
              {ticketData.photoUri ? (
                <Image source={{ uri: ticketData.photoUri }} style={{ width: 100, height: 100, margin: 8, borderRadius: 8 }} resizeMode="cover" />
              ) : (
                <View style={{ width: 100, height: 100, margin: 8, borderRadius: 8, backgroundColor: '#eee', justifyContent: 'center', alignItems: 'center' }}>
                  <Text style={{ color: 'gray', fontSize: 12, textAlign: 'center' }}>No hay foto volumétrica</Text>
                </View>
              )}
              {ticketData.photoUriElec ? (
                <Image source={{ uri: ticketData.photoUriElec }} style={{ width: 100, height: 100, margin: 8, borderRadius: 8 }} resizeMode="cover" />
              ) : (
                <View style={{ width: 100, height: 100, margin: 8, borderRadius: 8, backgroundColor: '#eee', justifyContent: 'center', alignItems: 'center' }}>
                  <Text style={{ color: 'gray', fontSize: 12, textAlign: 'center' }}>No hay foto eléctrica</Text>
                </View>
              )}
            </View>
            <View style={styles.buttonRow}>
              <TouchableOpacity style={[styles.button, { backgroundColor: '#eee' }]} onPress={onClose}>
                <Text style={{ color: '#333' }}>Editar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.button, { backgroundColor: '#00A86B' }]} onPress={onConfirm}>
                <Text style={{ color: 'white' }}>Guardar Lectura</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    width: '90%',
    maxHeight: '90%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  content: {
    alignItems: 'flex-start',
    paddingBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#00A86B',
    marginBottom: 16,
    alignSelf: 'center',
  },
  label: {
    fontWeight: 'bold',
    marginTop: 12,
  },
  value: {
    fontSize: 16,
    marginBottom: 4,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 24,
  },
  button: {
    flex: 1,
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 8,
  },
});

export default TicketPreviewModal; 