import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ticketStyles } from '../styles/ticket.styles';

interface TicketDisplayProps {
  ticketData: any;
  lecturaData: any;
  pozoData: any;
  onPrint: () => void;
  isLoading: boolean;
  onBack?: () => void;
}

export const TicketDisplay: React.FC<TicketDisplayProps> = ({
  ticketData,
  lecturaData,
  pozoData,
  onPrint,
  isLoading,
  onBack
}) => {
  const mostrarValor = (valor: any, textoSiNoHay = "N/A") =>
    valor !== undefined && valor !== null && valor !== "" ? valor : textoSiNoHay;

  const mostrarLectura = (lectura: any, textoSiNoHay = "Sin registro") =>
    lectura !== undefined && lectura !== null ? Number(lectura).toLocaleString() : textoSiNoHay;

  const lectura = ticketData?.lectura ?? {};
  const pozo = lectura?.pozo ?? {};
  const bateria = pozo?.bateria;
  const lecturaAnterior = ticketData?.lecturaAnterior;

  return (
    <View style={ticketStyles.container}>
      {onBack && (
        <View style={ticketStyles.header}>
          <TouchableOpacity onPress={onBack} style={ticketStyles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#000" />
          </TouchableOpacity>
          <Text style={ticketStyles.headerTitle}>Ticket de Lectura</Text>
        </View>
      )}
      
      <ScrollView style={ticketStyles.content} contentContainerStyle={ticketStyles.contentContainer}>
        <View style={ticketStyles.ticketContainer}>
          <View style={ticketStyles.ticketHeader}>
            <Text style={ticketStyles.ticketNumber}>{'051'}</Text>
            <Text style={ticketStyles.ticketTitle}>
              ASOCIACION DE USUARIOS DEL DISTRITO DE RIEGO NUMERO 051 COSTA DE HERMOSILLO, A.C.
            </Text>
            <Text style={ticketStyles.ticketCode}>
              Código del Ticket: {ticketData.numeroTicket ?? 'N/A'}
            </Text>
          </View>

          {/* Info principal */}
          <View style={ticketStyles.infoRow}>
            <View style={ticketStyles.infoItem}>
              <Text style={ticketStyles.infoLabel}>Batería:</Text>
              <Text style={ticketStyles.infoValue}>{bateria?.nombrebateria ?? 'N/A'}</Text>
            </View>
            <View style={ticketStyles.infoItem}>
              <Text style={ticketStyles.infoLabel}>Pozo:</Text>
              <Text style={ticketStyles.infoValue}>{pozo?.numeropozo ?? 'N/A'}</Text>
            </View>
          </View>

          <View style={ticketStyles.infoRow}>
            <View style={ticketStyles.infoItem}>
              <Text style={ticketStyles.infoLabel}>Predio:</Text>
              <Text style={ticketStyles.infoValue}>{pozo?.predio ?? 'N/A'}</Text>
            </View>
          </View>

          <View style={ticketStyles.infoRow}>
            <View style={ticketStyles.infoItem}>
              <Text style={ticketStyles.infoLabel}>Fecha:</Text>
              <Text style={ticketStyles.infoValue}>
                {ticketData.fecha?.split('T')[0] ?? ''}
              </Text>
            </View>
            <View style={ticketStyles.infoItem}>
              <Text style={ticketStyles.infoLabel}>Hora:</Text>
              <Text style={ticketStyles.infoValue}>
                {ticketData.fecha?.split('T')[1]?.slice(0,5) ?? ''}
              </Text>
            </View>
          </View>

          <Text style={ticketStyles.separator}>-----</Text>

          {/* Lecturas */}
          <View style={ticketStyles.section}>
            <Text style={ticketStyles.sectionTitle}>Lecturas del Mes</Text>
            <View style={ticketStyles.readingContainer}>
              <Text style={ticketStyles.readingTitle}>
                Medidor Volumétrico: {mostrarValor(lectura?.numero_serie_volumetrico)}
              </Text>
              <View style={ticketStyles.readingRow}>
                <Text style={ticketStyles.readingLabel}>Lectura Actual (m³):</Text>
                <Text style={ticketStyles.readingValue}>
                  {mostrarLectura(lectura?.volumen)}
                </Text>
              </View>
              <View style={ticketStyles.readingRow}>
                <Text style={ticketStyles.readingLabel}>Lectura Anterior (m³):</Text>
                <Text style={ticketStyles.readingValue}>
                  {lecturaAnterior ? mostrarLectura(lecturaAnterior?.volumen) : "Primera lectura"}
                </Text>
              </View>
              <View style={ticketStyles.readingRow}>
                <Text style={ticketStyles.readingLabel}>Consumo del Mes (m³):</Text>
                <Text style={ticketStyles.readingValue}>
                  {lecturaAnterior ? mostrarLectura(lectura?.volumen - lecturaAnterior?.volumen) : "No calculable (primera lectura)"}
                </Text>
              </View>
            </View>

            <View style={ticketStyles.readingContainer}>
              <Text style={ticketStyles.readingTitle}>
                Medidor Eléctrico: {mostrarValor(lectura?.numero_serie_electrico)}
              </Text>
              <View style={ticketStyles.readingRow}>
                <Text style={ticketStyles.readingLabel}>Lectura Actual (kWh):</Text>
                <Text style={ticketStyles.readingValue}>
                  {mostrarLectura(lectura?.lectura_electrica)}
                </Text>
              </View>
              <View style={ticketStyles.readingRow}>
                <Text style={ticketStyles.readingLabel}>Lectura Anterior (kWh):</Text>
                <Text style={ticketStyles.readingValue}>
                  {lecturaAnterior ? mostrarLectura(lecturaAnterior?.lectura_electrica) : "Primera lectura"}
                </Text>
              </View>
              <View style={ticketStyles.readingRow}>
                <Text style={ticketStyles.readingLabel}>Consumo del Mes (kWh):</Text>
                <Text style={ticketStyles.readingValue}>
                  {lecturaAnterior ? mostrarLectura(lectura?.lectura_electrica - lecturaAnterior?.lectura_electrica) : "No calculable (primera lectura)"}
                </Text>
              </View>
            </View>
          </View>

          <Text style={ticketStyles.separator}>-----</Text>

          {/* Eficiencia */}
          <View style={ticketStyles.section}>
            <Text style={ticketStyles.sectionTitle}>Eficiencia Detectada</Text>
            <View style={ticketStyles.readingRow}>
              <Text style={ticketStyles.readingLabel}>Eficiencia Actual:</Text>
              <Text style={ticketStyles.readingValue}>
                {lecturaAnterior ? mostrarLectura(lectura?.eficiencia) + " m³/kWh" : "Sin registro"}
              </Text>
            </View>
            <View style={ticketStyles.readingRow}>
              <Text style={ticketStyles.readingLabel}>Eficiencia Promedio:</Text>
              <Text style={ticketStyles.readingValue}>
                {mostrarLectura(ticketData?.eficienciaPromedioHistorica)} m³/kWh
              </Text>
            </View>
          </View>

          <Text style={ticketStyles.separator}>-----</Text>

          {/* Observaciones */}
          <View style={ticketStyles.section}>
            <Text style={ticketStyles.sectionTitle}>Observaciones</Text>
            <Text style={ticketStyles.observationText}>
              {mostrarValor(lectura?.observaciones, "Sin observaciones")}
            </Text>
          </View>
        </View>
      </ScrollView>

      <View style={ticketStyles.actionButtons}>
        <TouchableOpacity style={ticketStyles.actionButton} onPress={onPrint}>
          <Ionicons name="print-outline" size={24} color="white" />
          <Text style={ticketStyles.printButtonText}>Imprimir</Text>
        </TouchableOpacity>
      </View>

      {isLoading && (
        <View style={ticketStyles.loadingOverlay}>
          <ActivityIndicator size="large" color="#00A86B" />
          <Text style={ticketStyles.loadingText}>Procesando...</Text>
        </View>
      )}
    </View>
  );
}; 