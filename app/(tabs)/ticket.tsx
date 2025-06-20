"use client"

import { useState, useRef, useEffect } from "react"
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar as RNStatusBar,
  Platform,
  ActivityIndicator,
  Dimensions,
  Alert,
} from "react-native"
import { StatusBar } from "expo-status-bar"
import { Ionicons } from "@expo/vector-icons"
import { useRouter, useLocalSearchParams } from "expo-router"
import { useDispatch, useSelector } from "../../store"
import { showSnackbar } from "../../store/snackbarSlice"
import Constants from "expo-constants"
// import { LineChart } from "react-native-chart-kit"
import * as Print from "expo-print"
import * as FileSystem from "expo-file-system"
import * as Sharing from "expo-sharing"
import * as MediaLibrary from "expo-media-library"
import ViewShot from "react-native-view-shot"
import { addTicket, selectAllTickets } from "../../store/ticketsSlice"

const STATUSBAR_HEIGHT = Constants.statusBarHeight ?? 0
const { width: SCREEN_WIDTH } = Dimensions.get("window")

// Datos de ejemplo para los gráficos
const consumoVolData = {
  labels: ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic", "Act"],
  datasets: [
    {
      data: [400, 450, 500, 350, 600, 450, 500, 550, 450, 400, 500, 550, 500],
      color: (opacity = 1) => `rgba(0, 168, 107, ${opacity})`,
      strokeWidth: 2,
    },
  ],
}

const consumoElecData = {
  labels: ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic", "Act"],
  datasets: [
    {
      data: [10, 12, 8, 9, 11, 10, 9, 12, 10, 11, 9, 10, 10],
      color: (opacity = 1) => `rgba(65, 105, 225, ${opacity})`,
      strokeWidth: 2,
    },
  ],
}

const eficienciaData = {
  labels: ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic", "Act"],
  datasets: [
    {
      data: [400, 375, 625, 389, 545, 450, 556, 458, 450, 364, 556, 550, 500],
      color: (opacity = 1) => `rgba(255, 165, 0, ${opacity})`,
      strokeWidth: 2,
    },
  ],
}

const chartConfig = {
  backgroundGradientFrom: "#fff",
  backgroundGradientTo: "#fff",
  decimalPlaces: 0,
  color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
  labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
  style: {
    borderRadius: 16,
  },
  propsForDots: {
    r: "4",
    strokeWidth: "1",
    stroke: "#ffa726",
  },
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#f5f5f5",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
  },
  menuButton: {
    padding: 4,
  },
  scrollView: {
    flex: 1,
  },
  ticketContainer: {
    backgroundColor: "white",
    margin: 16,
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  ticketHeader: {
    alignItems: "center",
    marginBottom: 16,
  },
  ticketNumber: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 8,
  },
  ticketTitle: {
    fontSize: 14,
    fontWeight: "bold",
    textAlign: "center",
  },
  ticketCode: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#00A86B",
    marginTop: 4,
    textAlign: "center",
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  infoItem: {
    flexDirection: "row",
  },
  infoLabel: {
    fontWeight: "bold",
    marginRight: 4,
  },
  infoValue: {
    color: "#333",
  },
  locationRow: {
    marginBottom: 16,
  },
  locationText: {
    fontSize: 12,
    color: "#666",
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontWeight: "bold",
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    paddingBottom: 4,
  },
  readingContainer: {
    marginBottom: 12,
  },
  readingTitle: {
    fontWeight: "bold",
    marginBottom: 4,
  },
  readingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 2,
  },
  readingLabel: {
    color: "#666",
  },
  readingValue: {
    fontWeight: "500",
  },
  observation: {
    fontStyle: "italic",
    marginTop: 4,
    color: "#666",
  },
  chartTitle: {
    marginTop: 8,
    marginBottom: 4,
    color: "#666",
  },
  chartPlaceholder: {
    backgroundColor: "#f9f9f9",
    borderRadius: 8,
    padding: 10,
    marginVertical: 8,
    height: 180,
    justifyContent: "center",
  },
  chartPlaceholderText: {
    textAlign: "center",
    color: "#666",
    marginBottom: 10,
  },
  barChartContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    height: 120,
    paddingHorizontal: 5,
  },
  barChartColumn: {
    alignItems: "center",
    width: 20,
  },
  barChartBar: {
    width: 12,
    backgroundColor: "#00A86B",
    borderTopLeftRadius: 3,
    borderTopRightRadius: 3,
  },
  barChartLabel: {
    fontSize: 7,
    color: "#666",
    marginTop: 2,
    transform: [{ rotate: "-45deg" }],
    width: 20,
    height: 20,
    textAlign: "center",
  },
  chart: {
    marginVertical: 8,
    borderRadius: 8,
  },
  observationText: {
    color: "#666",
    fontStyle: "italic",
  },
  actionButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 16,
    backgroundColor: "white",
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  actionButton: {
    padding: 12,
    borderRadius: 8,
    backgroundColor: "#f0f0f0",
    alignItems: "center",
    justifyContent: "center",
    width: 50,
  },
  printButton: {
    flexDirection: "row",
    backgroundColor: "#00A86B",
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
    marginLeft: 16,
  },
  printButtonText: {
    color: "white",
    fontWeight: "bold",
    marginLeft: 8,
  },
  loadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    color: "white",
    marginTop: 12,
    fontSize: 16,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
  },
  sectionText: {
    color: "#333",
    marginBottom: 8,
  },
  separator: {
    textAlign: 'center',
    color: '#bbb',
    marginVertical: 8,
    fontWeight: 'bold',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
})

export default function TicketScreen() {
  const router = useRouter()
  const dispatch = useDispatch()
  const params = useLocalSearchParams()
  const viewShotRef = useRef<ViewShot>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [ticketUri, setTicketUri] = useState<string | null>(null)
  const [ticketSaved, setTicketSaved] = useState(false)
  const allTickets = useSelector(selectAllTickets)
  const ticketDocumentId = (params.ticketDocumentId as string) ?? null;
  const [ticketData, setTicketData] = useState<any>(null);
  const [lecturaData, setLecturaData] = useState<any>(null);
  const [loadingTicket, setLoadingTicket] = useState(false);
  const [pozoData, setPozoData] = useState<any>(null);
  const [loadingPozoData, setLoadingPozoData] = useState(false);
  const user = useSelector((state: any) => state.auth.user);
  const lecturaId = (params.lecturaId as string) ?? null;
  const [lecturaActualDirecta, setLecturaActualDirecta] = useState<any>(null);
  const [lecturaAnteriorDirecta, setLecturaAnteriorDirecta] = useState<any>(null);

  // Modificar para asegurar que siempre haya datos, incluso si no se pasan parámetros
  // Datos del pozo y lecturas
  const pozoId = (params.pozoId as string) ?? "1003"
  const fecha = new Date().toISOString().split("T")[0]
  const hora = new Date().toTimeString().split(" ")[0]
  const ticketId = (params.ticketId as string) ?? ""

  // Verificar si el ticket ya existe
  useEffect(() => {
    // Si ya tenemos un ticketId en los parámetros, significa que el ticket ya existe
    if (ticketId) {
      setTicketSaved(true)
      return
    }

    // Verificar si ya existe un ticket con los mismos datos
    const existingTicket = allTickets.find(
      (t) =>
        t.pozoId === pozoId &&
        t.fecha === fecha
    )

    if (existingTicket) {
      setTicketSaved(true)
    }
  }, [allTickets, pozoId, fecha, ticketId])

  useEffect(() => {
    const fetchTicket = async () => {
      if (!ticketDocumentId || !user?.token) return;
      setLoadingTicket(true);
      try {
        const res = await fetch(
          `${process.env.EXPO_PUBLIC_API_URL}/tickets/${ticketDocumentId}?populate[lectura]=true&populate[pozo]=true`,
          {
            headers: { 'Authorization': `Bearer ${user.token}` }
          }
        );
        const data = await res.json();
        setTicketData(data.data);
        setLecturaData(data.data?.lectura);
      } catch (e) {
        setTicketData(null);
        setLecturaData(null);
      } finally {
        setLoadingTicket(false);
      }
    };
    if (ticketDocumentId) fetchTicket();
  }, [ticketDocumentId, user?.token]);

  useEffect(() => {
    const fetchLecturaDirecta = async () => {
      if (!lecturaId || !user?.token) return;
      setLoadingPozoData(true);
      try {
        const res = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/lectura-pozos/${lecturaId}?populate[pozo]=true`, {
          headers: { 'Authorization': `Bearer ${user.token}` }
        });
        const data = await res.json();
        setLecturaActualDirecta(data);
        // Buscar la lectura anterior (puedes ajustar esto según tu backend)
        // Si el backend ya la envía como lectura_anterior, úsala:
        setLecturaAnteriorDirecta(data.lectura_anterior ?? null);
      } catch (e) {
        setLecturaActualDirecta(null);
        setLecturaAnteriorDirecta(null);
      } finally {
        setLoadingPozoData(false);
      }
    };
    if (lecturaId) fetchLecturaDirecta();
  }, [lecturaId, user?.token]);

  // Función para obtener los datos del pozo y sus lecturas
  const fetchPozoData = async (pozoId: string) => {
    if (!pozoId || !user?.token) return;
    setLoadingPozoData(true);
    try {
      // Obtener datos del pozo incluyendo batería y última lectura
      const res = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/pozos/${pozoId}?populate[bateria]=true&populate[lecturas][sort]=fecha:desc&populate[lecturas][limit]=2`,
        {
          headers: { 'Authorization': `Bearer ${user.token}` }
        }
      );
      const data = await res.json();
      
      if (data.data) {
        setPozoData(data.data);
        // Si hay lecturas, la primera es la actual y la segunda la anterior
        if (data.data.attributes?.lecturas?.data?.length > 0) {
          setLecturaData(data.data.attributes.lecturas.data[0]);
        }
      }
    } catch (error) {
      console.error("Error al obtener datos del pozo:", error);
      dispatch(
        showSnackbar({
          message: "Error al obtener datos del pozo",
          type: "error",
          duration: 3000,
        })
      );
    } finally {
      setLoadingPozoData(false);
    }
  };

  // Efecto para cargar los datos del pozo cuando cambia el pozoId
  useEffect(() => {
    if (pozoId && !ticketDocumentId) {
      fetchPozoData(pozoId);
    }
  }, [pozoId, ticketDocumentId]);

  // Función para volver al Panel de Control
  const handleBack = () => {
    router.replace("/(tabs)")
  }

  // Función para mostrar valores de forma profesional
  const mostrarValor = (valor: any, textoSiNoHay = "N/A") =>
    valor !== undefined && valor !== null && valor !== "" ? valor : textoSiNoHay;

  const mostrarLectura = (lectura: any, textoSiNoHay = "Sin registro") =>
    lectura !== undefined && lectura !== null ? Number(lectura).toLocaleString() : textoSiNoHay;

  // Función para guardar el ticket si no existe
  const saveTicketIfNeeded = async () => {
    if (ticketSaved) return null;

    const uniqueId = `TICKET-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    const lectura = ticketData?.lectura ?? {};
    const pozo = lectura?.pozo ?? {};

    const newTicket = {
      id: uniqueId,
      pozoId,
      pozoNombre: pozo?.numeropozo ?? 'N/A',
      pozoUbicacion: pozo?.predio ?? 'N/A',
      lecturaVolumen: mostrarLectura(lectura?.volumen),
      lecturaElectrica: mostrarLectura(lectura?.lectura_electrica),
      cargaMotor: lectura?.carga_motor ?? 'N/A',
      gastoPozo: lectura?.gasto_pozo ?? 'N/A',
      observaciones: lectura?.observaciones ?? 'Sin observaciones',
      fecha: ticketData?.fecha?.split('T')[0] ?? '',
      hora: ticketData?.fecha?.split('T')[1] ?? '',
      estado: "pendiente" as const,
    };

    try {
      await dispatch(addTicket(newTicket)).unwrap();
      setTicketSaved(true);
      dispatch(showSnackbar({
          message: "Ticket guardado correctamente",
          type: "success",
          duration: 2000,
      }));
      return uniqueId;
    } catch (error) {
      console.error("Error al guardar el ticket:", error);
      dispatch(showSnackbar({
          message: "Error al guardar el ticket",
          type: "error",
          duration: 3000,
      }));
      return null;
    }
  };

  // Función para imprimir el ticket
  const handlePrint = async () => {
    try {
      setIsLoading(true);
      await saveTicketIfNeeded();

      // Variables locales para el ticket de impresión
      const lectura: any = ticketData?.lectura ?? {};
      const pozo: any = lectura?.pozo ?? {};
      const bateria: any = pozo?.bateria ?? {};
      const lecturaAnterior: any = ticketData?.lecturaAnterior ?? null;

      // Preparar datos para impresión
      const printData = {
        bateria: bateria?.nombrebateria ?? 'N/A',
        pozo: pozo?.numeropozo ?? 'N/A',
        predio: pozo?.predio ?? 'N/A',
        fecha: ticketData?.fecha?.split('T')[0] ?? '',
        hora: ticketData?.fecha?.split('T')[1] ?? '',
        numeroSerieVol: mostrarValor(lectura?.numero_serie_volumetrico),
        numeroSerieElec: mostrarValor(lectura?.numero_serie_electrico),
        lecturaActualVol: mostrarLectura(lectura?.volumen),
        lecturaAnteriorVol: lecturaAnterior ? mostrarLectura(lecturaAnterior?.volumen) : "Primera lectura",
        consumoVol: lecturaAnterior ? mostrarLectura(lectura?.volumen - lecturaAnterior?.volumen) : "No calculable",
        lecturaActualElec: mostrarLectura(lectura?.lectura_electrica),
        lecturaAnteriorElec: lecturaAnterior ? mostrarLectura(lecturaAnterior?.lectura_electrica) : "Primera lectura",
        consumoElec: lecturaAnterior ? mostrarLectura(lectura?.lectura_electrica - lecturaAnterior?.lectura_electrica) : "No calculable",
        eficienciaActual: lecturaAnterior ? mostrarLectura(lectura?.eficiencia) + " m³/kWh" : "Sin registro",
        eficienciaPromedioHistorica: mostrarLectura(ticketData?.eficienciaPromedioHistorica),
        anomaliasVol: Array.isArray(lectura?.anomalias_volumetrico) ? lectura.anomalias_volumetrico.join(', ') : "Ninguna",
        anomaliasElec: Array.isArray(lectura?.anomalias_electrico) ? lectura.anomalias_electrico.join(', ') : "Ninguna",
        observaciones: mostrarValor(lectura?.observaciones, "Sin observaciones"),
        codigo: ticketData?.numeroTicket ?? 'N/A',
      };

      // Generar HTML para impresión
      const html = `
      <html>
        <head>
          <meta name="viewport" content="width=380, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, user-scalable=no" />
          <style>
            body {
              font-family: 'Courier New', Courier, monospace;
              padding: 0;
              margin: 0;
              font-size: 11px;
              width: 58mm;
              max-width: 58mm;
              background: #fff;
            }
            .ticket {
              width: 58mm;
              max-width: 58mm;
              margin: 0 auto;
              padding: 4px 0;
            }
            .center { text-align: center; }
            .bold { font-weight: bold; }
            .row {
              display: flex;
              justify-content: space-between;
              margin-bottom: 2px;
            }
            .line {
              border-top: 1px dashed #000;
              margin: 4px 0;
            }
            .section { margin-bottom: 6px; }
            .label { font-weight: bold; }
            .small { font-size: 10px; }
          </style>
        </head>
        <body>
          <div class="ticket">
            <div class="center bold">051</div>
            <div class="center">ASOCIACIÓN DE USUARIOS DEL DISTRITO DE RIEGO</div>
            <div class="center">NÚMERO 051 COSTA DE HERMOSILLO, A.C.</div>
            <div class="center bold">Código del Ticket: ${printData.codigo}</div>
            <div class="line"></div>
            <div class="row">
              <span class="label">Batería:</span> <span>${printData.bateria}</span>
              <span class="label">Pozo:</span> <span>${printData.pozo}</span>
          </div>
            <div class="row">
              <span class="label">Predio:</span> <span>${printData.predio}</span>
          </div>
            <div class="row">
              <span class="label">Fecha:</span> <span>${printData.fecha}</span>
              <span class="label">Hora:</span> <span>${printData.hora}</span>
          </div>
            <div class="line"></div>
            <div class="section">
              <div class="bold">LECTURAS DEL MES:</div>
              <div class="small">- Medidor Volumétrico: ${printData.numeroSerieVol}</div>
              <div class="row">
              <span>Lectura Actual (m³):</span>
                <span>${printData.lecturaActualVol}</span>
            </div>
              <div class="row">
              <span>Lectura Anterior (m³):</span>
                <span>${printData.lecturaAnteriorVol}</span>
            </div>
              <div class="row">
              <span>Consumo del Mes (m³):</span>
                <span>${printData.consumoVol}</span>
            </div>
              <div class="row">
                <span>Anomalías:</span>
                <span>${printData.anomaliasVol}</span>
          </div>
              <div class="small">- Medidor Eléctrico: ${printData.numeroSerieElec}</div>
              <div class="row">
              <span>Lectura Actual (kWh):</span>
                <span>${printData.lecturaActualElec}</span>
            </div>
              <div class="row">
              <span>Lectura Anterior (kWh):</span>
                <span>${printData.lecturaAnteriorElec}</span>
            </div>
              <div class="row">
              <span>Consumo del Mes (kWh):</span>
                <span>${printData.consumoElec}</span>
            </div>
              <div class="row">
                <span>Anomalías:</span>
                <span>${printData.anomaliasElec}</span>
          </div>
            </div>
            <div class="line"></div>
            <div class="section">
              <div class="bold">EFICIENCIA DETECTADA:</div>
              <div class="row">
            <span>Eficiencia Actual:</span>
                <span>${printData.eficienciaActual}</span>
          </div>
              <div class="row">
                <span>Eficiencia Promedio:</span>
                <span>${printData.eficienciaPromedioHistorica} m³/kWh</span>
          </div>
          </div>
            <div class="line"></div>
            <div class="section">
              <div class="bold">OBSERVACIONES:</div>
              <div>${printData.observaciones}</div>
          </div>
            <div class="center small">Gracias por su registro</div>
          </div>
        </body>
      </html>`;

      if (Platform.OS === "web") {
        // En web, usar window.print()
        const printWindow = window.open('', '_blank');
        printWindow?.document.write(html);
        printWindow?.document.close();
        printWindow?.focus();
        printWindow?.print();
        printWindow?.close();
      } else {
        // En móvil, usar expo-print y expo-sharing
        const { uri } = await Print.printToFileAsync({ html, width: 380, height: 900, base64: false });
      if (Platform.OS === "ios") {
          await Sharing.shareAsync(uri);
      } else {
          const pdfName = `ticket_${pozoId}_${Date.now()}.pdf`;
          const newUri = `${FileSystem.documentDirectory}${pdfName}`;
          await FileSystem.moveAsync({ from: uri, to: newUri });
          await Sharing.shareAsync(newUri);
        }
      }

      dispatch(showSnackbar({
          message: "Ticket listo para imprimir",
          type: "success",
          duration: 3000,
      }));
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

  // Renderizado condicional
  if (loadingTicket || loadingPozoData) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#00A86B" />
      </View>
    );
  }

  // Renderizado principal del ticket
  if (ticketDocumentId && ticketData && lecturaData) {
    const lectura = ticketData.lectura;
    const pozo = lectura?.pozo;
    const bateria = pozo?.bateria;
    const lecturaAnterior = ticketData.lecturaAnterior;

    return (
      <View style={styles.container}>
      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        <View style={styles.ticketContainer}>
          <View style={styles.ticketHeader}>
              <Text style={styles.ticketNumber}>{'051'}</Text>
              <Text style={styles.ticketTitle}>ASOCIACION DE USUARIOS DEL DISTRITO DE RIEGO NUMERO 051 COSTA DE HERMOSILLO, A.C.</Text>
              <Text style={styles.ticketCode}>Código del Ticket: {ticketData.numeroTicket ?? 'N/A'}</Text>
          </View>
          {/* Info principal */}
          <View style={styles.infoRow}>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Batería:</Text>
              <Text style={styles.infoValue}>{bateria?.nombrebateria ?? 'N/A'}</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Pozo:</Text>
              <Text style={styles.infoValue}>{pozo?.numeropozo ?? 'N/A'}</Text>
            </View>
          </View>
          <View style={styles.infoRow}>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Predio:</Text>
              <Text style={styles.infoValue}>{pozo?.predio ?? 'N/A'}</Text>
            </View>
          </View>
          <View style={styles.infoRow}>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Fecha:</Text>
                <Text style={styles.infoValue}>{ticketData.fecha?.split('T')[0] ?? ''}</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Hora:</Text>
                <Text style={styles.infoValue}>{ticketData.fecha?.split('T')[1]?.slice(0,5) ?? ''}</Text>
            </View>
          </View>
            <Text style={styles.separator}>-----</Text>
            {/* Lecturas */}
          <View style={styles.section}>
              <Text style={styles.sectionTitle}>Lecturas del Mes</Text>
            <View style={styles.readingContainer}>
                <Text style={styles.readingTitle}>Medidor Volumétrico: {mostrarValor(lectura?.numero_serie_volumetrico)}</Text>
              <View style={styles.readingRow}>
                <Text style={styles.readingLabel}>Lectura Actual (m³):</Text>
                  <Text style={styles.readingValue}>{mostrarLectura(lectura?.volumen)}</Text>
              </View>
              <View style={styles.readingRow}>
                <Text style={styles.readingLabel}>Lectura Anterior (m³):</Text>
                  <Text style={styles.readingValue}>{lecturaAnterior ? mostrarLectura(lecturaAnterior?.volumen) : "Primera lectura"}</Text>
              </View>
              <View style={styles.readingRow}>
                <Text style={styles.readingLabel}>Consumo del Mes (m³):</Text>
                  <Text style={styles.readingValue}>{lecturaAnterior ? mostrarLectura(lectura?.volumen - lecturaAnterior?.volumen) : "No calculable (primera lectura)"}</Text>
              </View>
                <View style={styles.readingRow}>
                  <Text style={styles.readingLabel}>Anomalías:</Text>
                  <Text style={styles.readingValue}>{Array.isArray(lectura?.anomalias_volumetrico) ? lectura.anomalias_volumetrico.join(', ') : "Ninguna"}</Text>
            </View>
              </View>
              <Text style={styles.readingTitle}>Medidor Eléctrico: {mostrarValor(lectura?.numero_serie_electrico)}</Text>
              <View style={styles.readingRow}>
                <Text style={styles.readingLabel}>Lectura Actual (kWh):</Text>
                <Text style={styles.readingValue}>{mostrarLectura(lectura?.lectura_electrica)}</Text>
              </View>
              <View style={styles.readingRow}>
                <Text style={styles.readingLabel}>Lectura Anterior (kWh):</Text>
                <Text style={styles.readingValue}>{lecturaAnterior ? mostrarLectura(lecturaAnterior?.lectura_electrica) : "Primera lectura"}</Text>
              </View>
              <View style={styles.readingRow}>
                <Text style={styles.readingLabel}>Consumo del Mes (kWh):</Text>
                <Text style={styles.readingValue}>{lecturaAnterior ? mostrarLectura(lectura?.lectura_electrica - lecturaAnterior?.lectura_electrica) : "No calculable (primera lectura)"}</Text>
              </View>
              <View style={styles.readingRow}>
                <Text style={styles.readingLabel}>Anomalías:</Text>
                <Text style={styles.readingValue}>{Array.isArray(lectura?.anomalias_electrico) ? lectura.anomalias_electrico.join(', ') : "Ninguna"}</Text>
            </View>
          </View>
            <Text style={styles.separator}>-----</Text>
            {/* Eficiencia */}
          <View style={styles.section}>
              <Text style={styles.sectionTitle}>Eficiencia Detectada</Text>
            <View style={styles.readingRow}>
              <Text style={styles.readingLabel}>Eficiencia Actual:</Text>
                <Text style={styles.readingValue}>{lecturaAnterior ? mostrarLectura(lectura?.eficiencia) + " m³/kWh" : "Sin registro"}</Text>
            </View>
            <View style={styles.readingRow}>
                <Text style={styles.readingLabel}>Eficiencia Promedio:</Text>
                <Text style={styles.readingValue}>{mostrarLectura(ticketData?.eficienciaPromedioHistorica)} m³/kWh</Text>
            </View>
          </View>
            <Text style={styles.separator}>-----</Text>
            {/* Observaciones */}
          <View style={styles.section}>
              <Text style={styles.sectionTitle}>Observaciones</Text>
              <Text style={styles.observationText}>{mostrarValor(lectura?.observaciones, "Sin observaciones")}</Text>
            </View>
            </View>
      </ScrollView>

      <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.actionButton} onPress={handlePrint}>
          <Ionicons name="print-outline" size={24} color="white" />
          <Text style={styles.printButtonText}>Imprimir</Text>
        </TouchableOpacity>
      </View>

      {isLoading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#00A86B" />
          <Text style={styles.loadingText}>Procesando...</Text>
        </View>
      )}
    </View>
    );
  }

  return null;
}

