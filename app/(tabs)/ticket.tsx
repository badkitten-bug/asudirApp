"use client"

import { useState, useEffect } from "react"
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
  Alert,
} from "react-native"
import { StatusBar } from "expo-status-bar"
import { Ionicons } from "@expo/vector-icons"
import { useRouter, useLocalSearchParams } from "expo-router"
import { useDispatch } from "@/store"
import { showSnackbar } from "@/store/snackbarSlice"
import { useTicket } from "@/features/ticket/hooks/useTicket"
import { TicketDisplay } from "@/features/ticket/components/TicketDisplay"
import { printTicketHTML, prepareTicketPrintData } from "@/features/ticket/api/ticketApi"
import { ticketStyles } from "@/features/ticket/styles/ticket.styles"

export default function TicketScreen() {
  const router = useRouter()
  const dispatch = useDispatch()
  const params = useLocalSearchParams()
  
  const ticketDocumentId = (params.ticketDocumentId as string) ?? null;
  const lecturaId = (params.lecturaId as string) ?? null;
  
  // Datos recibidos directamente desde el registro de lecturas
  const pozoId = (params.pozoId as string) ?? "1003"
  const fecha = (params.fecha as string) ?? new Date().toISOString().split("T")[0]
  const hora = new Date().toTimeString().split(" ")[0]
  const ticketId = (params.ticketId as string) ?? ""
  
  // Datos de la lectura recibidos como parámetros
  const lecturaFromParams = {
    pozoNombre: params.pozoNombre as string,
    pozoUbicacion: params.pozoUbicacion as string,
    volumen: params.volumen as string,
    gasto: params.gasto as string,
    lecturaElectrica: params.lecturaElectrica as string,
    observaciones: params.observaciones as string,
    bateria: params.bateria as string,
    usuario: params.usuario as string,
    ticketNumero: params.ticketNumero as string,
  }

  // Verificar si tenemos datos de lectura desde parámetros
  const hasLecturaData = lecturaFromParams.pozoNombre && lecturaFromParams.volumen;

  // Usar hook modularizado
  const {
    ticketData,
    lecturaData,
    pozoData,
    loadingTicket,
    loadingPozoData,
    isLoading,
    ticketSaved,
    setTicketData,
    setLecturaData,
    setLoadingTicket,
    setLoadingPozoData,
    setIsLoading,
    setTicketSaved,
    fetchPozoData,
    saveTicketIfNeeded,
    checkExistingTicket,
  } = useTicket(ticketDocumentId);

  // Verificar si el ticket ya existe
  useEffect(() => {
    if (ticketId) {
      setTicketSaved(true)
      return
    }
    checkExistingTicket(pozoId, fecha)
  }, [pozoId, fecha, ticketId, checkExistingTicket, setTicketSaved])

  // Efecto para cargar los datos del pozo cuando cambia el pozoId
  useEffect(() => {
    if (pozoId && !ticketDocumentId) {
      fetchPozoData(pozoId);
    }
  }, [pozoId, ticketDocumentId, fetchPozoData]);

  // Función para volver al Panel de Control
  const handleBack = () => {
    router.replace("/(tabs)")
  }

  // Función para imprimir el ticket
  const handlePrint = async () => {
    try {
      setIsLoading(true);
      
      // Si tenemos datos de parámetros, usarlos directamente
      if (hasLecturaData) {
        await printFromParams();
      } else {
        // Usar datos del backend
        await saveTicketIfNeeded({
          pozoId,
          lecturaVolumen: 'N/A',
          lecturaElectrica: 'N/A',
        });
        await printFromBackend();
      }
    } catch (error) {
      console.error("Error al imprimir ticket:", error);
      dispatch(showSnackbar({
        message: "Error al preparar el ticket para impresión",
        type: "error",
        duration: 3000,
      }));
    } finally {
      setIsLoading(false);
    }
  };

  // Función para imprimir desde datos de parámetros
  const printFromParams = async () => {
    const printData = {
      bateria: lecturaFromParams.bateria || 'N/A',
      pozo: lecturaFromParams.pozoNombre,
      predio: lecturaFromParams.pozoUbicacion,
      fecha: fecha,
      hora: hora,
      usuario: lecturaFromParams.usuario || 'N/A',
      lecturaActualVol: Number(lecturaFromParams.volumen).toLocaleString(),
      gasto: Number(lecturaFromParams.gasto).toLocaleString(),
      lecturaActualElec: Number(lecturaFromParams.lecturaElectrica).toLocaleString(),
      observaciones: lecturaFromParams.observaciones || "Sin observaciones",
      codigo: lecturaFromParams.ticketNumero || 'N/A',
      // Valores por defecto para campos no disponibles en parámetros
      numeroSerieVol: 'N/A',
      numeroSerieElec: 'N/A',
      lecturaAnteriorVol: "Primera lectura",
      consumoVol: "No calculable",
      lecturaAnteriorElec: "Primera lectura",
      consumoElec: "No calculable",
      eficienciaActual: "Sin registro",
      eficienciaPromedioHistorica: "Sin registro",
      anomaliasVol: "Ninguna",
      anomaliasElec: "Ninguna",
    };

    await printTicketHTML(printData);
  };

  // Función para imprimir desde datos del backend
  const printFromBackend = async () => {
    const printData = prepareTicketPrintData(ticketData, lecturaData);
    await printTicketHTML(printData);
  };

  // Renderizado condicional
  if (loadingTicket || loadingPozoData) {
    return (
      <View style={ticketStyles.loadingContainer}>
        <ActivityIndicator size="large" color="#00A86B" />
        <Text style={ticketStyles.loadingText}>Cargando ticket...</Text>
      </View>
    );
  }

  // Renderizado principal del ticket
  if (ticketDocumentId && ticketData && lecturaData) {
    return (
      <TicketDisplay
        ticketData={ticketData}
        lecturaData={lecturaData}
        pozoData={pozoData}
        onPrint={handlePrint}
        isLoading={isLoading}
        onBack={handleBack}
      />
    );
  }

  // Renderizado para datos de lectura desde parámetros
  if (hasLecturaData) {
    // Crear datos simulados para el componente
    const mockTicketData = {
      numeroTicket: lecturaFromParams.ticketNumero || 'N/A',
      fecha: `${fecha}T${hora}`,
      lectura: {
        volumen: Number(lecturaFromParams.volumen),
        lectura_electrica: Number(lecturaFromParams.lecturaElectrica),
        observaciones: lecturaFromParams.observaciones,
        pozo: {
          numeropozo: lecturaFromParams.pozoNombre,
          predio: lecturaFromParams.pozoUbicacion,
          bateria: {
            nombrebateria: lecturaFromParams.bateria || 'N/A'
          }
        }
      }
    };

    return (
      <TicketDisplay
        ticketData={mockTicketData}
        lecturaData={mockTicketData.lectura}
        pozoData={mockTicketData.lectura.pozo}
        onPrint={handlePrint}
        isLoading={isLoading}
        onBack={handleBack}
      />
    );
  }

  // Renderizado por defecto
  return (
    <View style={ticketStyles.container}>
      <View style={ticketStyles.header}>
        <TouchableOpacity onPress={handleBack} style={ticketStyles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={ticketStyles.headerTitle}>Ticket de Lectura</Text>
      </View>
      
      <View style={ticketStyles.loadingContainer}>
        <Text style={ticketStyles.loadingText}>No hay datos de ticket disponibles</Text>
      </View>
    </View>
  );
}

