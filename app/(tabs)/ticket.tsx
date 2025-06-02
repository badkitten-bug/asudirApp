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
          `${process.env.EXPO_PUBLIC_API_URL}/api/tickets/${ticketDocumentId}?populate[lectura]=true&populate[pozo]=true`,
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
        const res = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/lectura-pozos/${lecturaId}?populate[pozo]=true`, {
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
        `${process.env.EXPO_PUBLIC_API_URL}/api/pozos/${pozoId}?populate[bateria]=true&populate[lecturas][sort]=fecha:desc&populate[lecturas][limit]=2`,
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

  // Función para guardar el ticket si no existe
  const saveTicketIfNeeded = async () => {
    // Si el ticket ya está guardado, no hacer nada
    if (ticketSaved) {
      return null
    }

    // Generar un ID único para el ticket
    const uniqueId = `TICKET-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`

    // Crear un nuevo ticket con todos los datos
    const newTicket = {
      id: uniqueId,
      pozoId,
      pozoNombre: pozo?.numeropozo ?? 'N/A',
      pozoUbicacion: pozo?.predio ?? 'N/A',
      lecturaVolumen: lecturaActualVol,
      lecturaElectrica: lecturaActualElec,
      cargaMotor: lecturaActual?.carga_motor ?? 'N/A',
      gastoPozo: lecturaActual?.gasto_pozo ?? 'N/A',
      observaciones,
      fecha,
      hora,
      estado: "pendiente" as const,
    }

    try {
      // Guardar el ticket en el store
      await dispatch(addTicket(newTicket)).unwrap()
      setTicketSaved(true)

      dispatch(
        showSnackbar({
          message: "Ticket guardado correctamente",
          type: "success",
          duration: 2000,
        }),
      )

      return uniqueId
    } catch (error) {
      console.error("Error al guardar el ticket:", error)
      dispatch(
        showSnackbar({
          message: "Error al guardar el ticket",
          type: "error",
          duration: 3000,
        }),
      )
      return null
    }
  }

  // Función para generar HTML de gráficos de barras
  const generateBarChartHTML = (data: any[], labels: any[], color: string, title: string, unit: string) => {
    const maxValue = Math.max(...data)

    // Crear tabla con los datos
    let tableHTML = `
      <div style="margin-top: 15px; margin-bottom: 15px;">
        <div style="font-weight: bold; margin-bottom: 5px;">${title} (${unit}):</div>
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 10px;">
          <tr>
            ${labels.map((label: any) => `<th style="padding: 5px; text-align: center; border-bottom: 1px solid #ddd; background-color: #f2f2f2; font-size: 8px;">${label}</th>`).join("")}
          </tr>
          <tr>
            ${data.map((value: any) => `<td style="padding: 5px; text-align: center; border-bottom: 1px solid #ddd; font-size: 8px;">${value}</td>`).join("")}
          </tr>
        </table>
    `

    // Crear gráfico de barras con HTML/CSS
    tableHTML += `
      <div style="display: flex; height: 120px; align-items: flex-end; background-color: #f9f9f9; padding: 10px; border-radius: 5px;">
    `

    // Añadir barras
    for (let i = 0; i < data.length; i++) {
      const barHeight = Math.max(5, Math.floor((data[i] / maxValue) * 100))
      tableHTML += `
        <div style="display: flex; flex-direction: column; align-items: center; flex: 1;">
          <div style="width: 80%; height: ${barHeight}px; background-color: ${color}; border-top-left-radius: 3px; border-top-right-radius: 3px;"></div>
          <div style="font-size: 8px; margin-top: 3px; transform: rotate(-45deg); text-align: center;">${labels[i]}</div>
        </div>
      `
    }

    tableHTML += `
      </div>
      <div style="display: flex; justify-content: space-between; margin-top: 5px; font-size: 8px; color: #666;">
        <span>Min: ${Math.min(...data)} ${unit}</span>
        <span>Max: ${Math.max(...data)} ${unit}</span>
      </div>
    </div>
    `

    return tableHTML
  }

  // Función para descargar el ticket como PDF directamente en el dispositivo
  const handleDownloadPDF = async () => {
    try {
      setIsLoading(true)

      // Guardar el ticket si aún no está guardado
      await saveTicketIfNeeded()

      // Solicitar permisos para guardar en la galería/almacenamiento
      const { status } = await MediaLibrary.requestPermissionsAsync()

      if (status !== "granted") {
        Alert.alert("Permiso denegado", "Necesitamos permiso para guardar el PDF en tu dispositivo.", [{ text: "OK" }])
        setIsLoading(false)
        return
      }

      // Generar HTML para los gráficos
      const volChartHTML = generateBarChartHTML(
        consumoVolData.datasets[0].data,
        consumoVolData.labels,
        "#00A86B",
        "Consumo Volumétrico",
        "m³",
      )

      const elecChartHTML = generateBarChartHTML(
        consumoElecData.datasets[0].data,
        consumoElecData.labels,
        "#4169E1",
        "Consumo Eléctrico",
        "kWh",
      )

      const eficChartHTML = generateBarChartHTML(
        eficienciaData.datasets[0].data,
        eficienciaData.labels,
        "#FFA500",
        "Eficiencia",
        "m³/kWh",
      )

      // Generar HTML para el PDF con gráficos incluidos
      const html = `
      <html>
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, user-scalable=no" />
          <style>
            body {
              font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
              padding: 10px;
              font-size: 12px;
            }
            .header {
              text-align: center;
              margin-bottom: 20px;
            }
            .title {
              font-size: 16px;
              font-weight: bold;
              margin-bottom: 5px;
            }
            .subtitle {
              font-size: 14px;
              margin-bottom: 10px;
            }
            .info-row {
              display: flex;
              justify-content: space-between;
              margin-bottom: 5px;
            }
            .section-title {
              font-weight: bold;
              margin-top: 15px;
              margin-bottom: 5px;
              border-bottom: 1px solid #ccc;
              padding-bottom: 3px;
            }
            .reading-container {
              margin-bottom: 10px;
            }
            .reading-title {
              font-weight: bold;
              margin-bottom: 3px;
            }
            .reading-row {
              display: flex;
              justify-content: space-between;
              margin-bottom: 2px;
            }
            .observation {
              font-style: italic;
              margin-top: 5px;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="title">051</div>
            <div class="subtitle">ASOCIACIÓN DE USUARIOS DEL DISTRITO DE RIEGO<br>NÚMERO 051 COSTA DE HERMOSILLO, A.C.</div>
          </div>
          
          <div class="info-row">
            <span><b>Batería:</b> ${bateria?.nombrebateria ?? 'N/A'}</span>
            <span><b>Pozo:</b> ${pozo?.numeropozo ?? 'N/A'}</span>
            <span><b>Predio:</b> ${pozo?.predio ?? 'N/A'}</span>
          </div>
          
          <div class="info-row">
            <span><b>Fecha:</b> ${fecha}</span>
            <span><b>Hora:</b> ${hora}</span>
          </div>
          
          <div class="info-row">
            <span><b>Ubicación:</b> ${ubicacion}</span>
          </div>
          
          <div class="section-title">LECTURAS DEL MES:</div>
          
          <div class="reading-container">
            <div class="reading-title">- Medidor Volumétrico: ${numeroSerieVol}</div>
            <div class="reading-row">
              <span>Lectura Actual (m³):</span>
              <span>${Number(lecturaActualVol).toLocaleString()}</span>
            </div>
            <div class="reading-row">
              <span>Lectura Anterior (m³):</span>
              <span>${Number(lecturaAnteriorVol).toLocaleString()}</span>
            </div>
            <div class="reading-row">
              <span>Consumo del Mes (m³):</span>
              <span>${Number(consumoVol).toLocaleString()}</span>
            </div>
            <div class="observation">Anomalías: ${anomaliasVol}</div>
          </div>
          
          <div class="reading-container">
            <div class="reading-title">- Medidor Eléctrico: ${numeroSerieElec}</div>
            <div class="reading-row">
              <span>Lectura Actual (kWh):</span>
              <span>${Number(lecturaActualElec).toLocaleString()}</span>
            </div>
            <div class="reading-row">
              <span>Lectura Anterior (kWh):</span>
              <span>${Number(lecturaAnteriorElec).toLocaleString()}</span>
            </div>
            <div class="reading-row">
              <span>Consumo del Mes (kWh):</span>
              <span>${Number(consumoElec).toLocaleString()}</span>
            </div>
            <div class="observation">Anomalías: ${anomaliasElec}</div>
          </div>
          
          <div class="section-title">EFICIENCIA DETECTADA:</div>
          <div class="reading-row">
            <span>Eficiencia Actual:</span>
            <span>${eficienciaActual} m³/kWh</span>
          </div>
          <div class="reading-row">
            <span>Eficiencia Promedio Histórica:</span>
            <span>${eficienciaPromedioHistorica} m³/kWh</span>
          </div>
          
          <div class="section-title">INFORMACIÓN ADICIONAL:</div>
          <div class="reading-row">
            <span>Carga del Motor:</span>
            <span>${lecturaActual?.carga_motor ?? 'N/A'} A</span>
          </div>
          <div class="reading-row">
            <span>Gasto del Pozo:</span>
            <span>${lecturaActual?.gasto_pozo ?? 'N/A'} L</span>
          </div>
          
          <div class="section-title">OBSERVACIONES GENERALES:</div>
          <p>${observaciones  ?? "No se registraron observaciones"}</p>
        </body>
      </html>
      `

      const options = {
        html,
        width: 380,
        height: 900, // Aumentado para acomodar los gráficos
        base64: false,
      }

      // Generar el PDF
      const { uri: pdfUri } = await Print.printToFileAsync(options)

      // Verificar que el archivo se generó correctamente
      const fileInfo = await FileSystem.getInfoAsync(pdfUri)
      if (!fileInfo.exists) {
        throw new Error("El archivo PDF no se generó correctamente")
      }

      // Nombre del archivo
      const fileName = `ticket_pozo_${pozoId}_${Date.now()}.pdf`

      // Guardar el PDF en la galería/almacenamiento
      if (Platform.OS === "android") {
        try {
          // En Android, intentamos guardar en la carpeta de Descargas
          const asset = await MediaLibrary.createAssetAsync(pdfUri)

          // Crear un álbum para los tickets si no existe
          const album = await MediaLibrary.getAlbumAsync("Tickets")
          if (album) {
            await MediaLibrary.addAssetsToAlbumAsync([asset], album, false)
          } else {
            await MediaLibrary.createAlbumAsync("Tickets", asset, false)
          }

          dispatch(
            showSnackbar({
              message: "PDF guardado en la galería (carpeta Tickets)",
              type: "success",
              duration: 3000,
            }),
          )
        } catch (error) {
          console.error("Error al guardar en Android:", error)

          // Si falla, intentamos usar el Storage Access Framework
          try {
            if (FileSystem.StorageAccessFramework) {
              const permissions = await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync()

              if (permissions.granted) {
                const destinationUri = await FileSystem.StorageAccessFramework.createFileAsync(
                  permissions.directoryUri,
                  fileName,
                  "application/pdf",
                )

                const pdfContent = await FileSystem.readAsStringAsync(pdfUri, {
                  encoding: FileSystem.EncodingType.Base64,
                })

                await FileSystem.StorageAccessFramework.writeAsStringAsync(destinationUri, pdfContent, {
                  encoding: FileSystem.EncodingType.Base64,
                })

                dispatch(
                  showSnackbar({
                    message: "PDF guardado en la ubicación seleccionada",
                    type: "success",
                    duration: 3000,
                  }),
                )
              } else {
                throw new Error("Permiso denegado para acceder al almacenamiento")
              }
            } else {
              throw new Error("StorageAccessFramework no disponible")
            }
          } catch (storageError) {
            console.error("Error con StorageAccessFramework:", storageError)

            // Si todo falla, compartimos el archivo
            await Sharing.shareAsync(pdfUri, {
              mimeType: "application/pdf",
              dialogTitle: `Ticket ${pozoId}`,
            })
          }
        }
      } else if (Platform.OS === "ios") {
        // En iOS, guardamos en la galería
        try {
          const asset = await MediaLibrary.createAssetAsync(pdfUri)

          dispatch(
            showSnackbar({
              message: "PDF guardado en la galería",
              type: "success",
              duration: 3000,
            }),
          )
        } catch (error) {
          console.error("Error al guardar en iOS:", error)

          // Si falla, compartimos el archivo
          await Sharing.shareAsync(pdfUri, {
            UTI: "com.adobe.pdf",
            mimeType: "application/pdf",
          })
        }
      }

      setIsLoading(false)
    } catch (error) {
      console.error("Error al descargar ticket como PDF:", error)
      dispatch(
        showSnackbar({
          message: "Error al guardar el PDF: " + (error instanceof Error ? error.message : "Error desconocido"),
          type: "error",
          duration: 3000,
        }),
      )
      setIsLoading(false)
    }
  }

  // Función para imprimir el ticket
  const handlePrint = async () => {
    try {
      setIsLoading(true)

      // Guardar el ticket si aún no está guardado
      await saveTicketIfNeeded()

      // Generar HTML para los gráficos
      const volChartHTML = generateBarChartHTML(
        consumoVolData.datasets[0].data,
        consumoVolData.labels,
        "#00A86B",
        "Consumo Volumétrico",
        "m³",
      )

      const elecChartHTML = generateBarChartHTML(
        consumoElecData.datasets[0].data,
        consumoElecData.labels,
        "#4169E1",
        "Consumo Eléctrico",
        "kWh",
      )

      const eficChartHTML = generateBarChartHTML(
        eficienciaData.datasets[0].data,
        eficienciaData.labels,
        "#FFA500",
        "Eficiencia",
        "m³/kWh",
      )

      // Generar HTML para impresión con gráficos incluidos
      const html = `
      <html>
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, user-scalable=no" />
          <style>
            body {
              font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
              padding: 10px;
              font-size: 12px;
            }
            .header {
              text-align: center;
              margin-bottom: 20px;
            }
            .title {
              font-size: 16px;
              font-weight: bold;
              margin-bottom: 5px;
            }
            .subtitle {
              font-size: 14px;
              margin-bottom: 10px;
            }
            .info-row {
              display: flex;
              justify-content: space-between;
              margin-bottom: 5px;
            }
            .section-title {
              font-weight: bold;
              margin-top: 15px;
              margin-bottom: 5px;
              border-bottom: 1px solid #ccc;
              padding-bottom: 3px;
            }
            .reading-container {
              margin-bottom: 10px;
            }
            .reading-title {
              font-weight: bold;
              margin-bottom: 3px;
            }
            .reading-row {
              display: flex;
              justify-content: space-between;
              margin-bottom: 2px;
            }
            .observation {
              font-style: italic;
              margin-top: 5px;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="title">051</div>
            <div class="subtitle">ASOCIACIÓN DE USUARIOS DEL DISTRITO DE RIEGO<br>NÚMERO 051 COSTA DE HERMOSILLO, A.C.</div>
          </div>
          
          <div class="info-row">
            <span><b>Batería:</b> ${bateria?.nombrebateria ?? 'N/A'}</span>
            <span><b>Pozo:</b> ${pozo?.numeropozo ?? 'N/A'}</span>
            <span><b>Predio:</b> ${pozo?.predio ?? 'N/A'}</span>
          </div>
          
          <div class="info-row">
            <span><b>Fecha:</b> ${fecha}</span>
            <span><b>Hora:</b> ${hora}</span>
          </div>
          
          <div class="info-row">
            <span><b>Ubicación:</b> ${ubicacion}</span>
          </div>
          
          <div class="section-title">LECTURAS DEL MES:</div>
          
          <div class="reading-container">
            <div class="reading-title">- Medidor Volumétrico: ${numeroSerieVol}</div>
            <div class="reading-row">
              <span>Lectura Actual (m³):</span>
              <span>${Number(lecturaActualVol).toLocaleString()}</span>
            </div>
            <div class="reading-row">
              <span>Lectura Anterior (m³):</span>
              <span>${Number(lecturaAnteriorVol).toLocaleString()}</span>
            </div>
            <div class="reading-row">
              <span>Consumo del Mes (m³):</span>
              <span>${Number(consumoVol).toLocaleString()}</span>
            </div>
            <div class="observation">Anomalías: ${anomaliasVol}</div>
          </div>
          
          <div class="reading-container">
            <div class="reading-title">- Medidor Eléctrico: ${numeroSerieElec}</div>
            <div class="reading-row">
              <span>Lectura Actual (kWh):</span>
              <span>${Number(lecturaActualElec).toLocaleString()}</span>
            </div>
            <div class="reading-row">
              <span>Lectura Anterior (kWh):</span>
              <span>${Number(lecturaAnteriorElec).toLocaleString()}</span>
            </div>
            <div class="reading-row">
              <span>Consumo del Mes (kWh):</span>
              <span>${Number(consumoElec).toLocaleString()}</span>
            </div>
            <div class="observation">Anomalías: ${anomaliasElec}</div>
          </div>
          
          <div class="section-title">EFICIENCIA DETECTADA:</div>
          <div class="reading-row">
            <span>Eficiencia Actual:</span>
            <span>${eficienciaActual} m³/kWh</span>
          </div>
          <div class="reading-row">
            <span>Eficiencia Promedio Histórica:</span>
            <span>${eficienciaPromedioHistorica} m³/kWh</span>
          </div>
          
          <div class="section-title">INFORMACIÓN ADICIONAL:</div>
          <div class="reading-row">
            <span>Carga del Motor:</span>
            <span>${lecturaActual?.carga_motor ?? 'N/A'} A</span>
          </div>
          <div class="reading-row">
            <span>Gasto del Pozo:</span>
            <span>${lecturaActual?.gasto_pozo ?? 'N/A'} L</span>
          </div>
          
          <div class="section-title">OBSERVACIONES GENERALES:</div>
          <p>${observaciones}</p>
        </body>
      </html>
      `

      // Para impresoras Zebra, necesitamos configurar opciones específicas
      // Nota: Esto es una simulación, la implementación real requiere plugins específicos para Zebra
      const options = {
        html,
        width: 380, // Ancho típico para tickets
        height: 900, // Aumentado para acomodar los gráficos
        base64: false,
      }

      // En un entorno real, aquí se conectaría con la impresora Zebra
      // Para esta demo, generamos un PDF que se podría imprimir
      const { uri } = await Print.printToFileAsync(options)

      // Compartir el PDF generado
      if (Platform.OS === "ios") {
        await Sharing.shareAsync(uri)
      } else {
        const pdfName = `ticket_${pozoId}_${Date.now()}.pdf`
        const newUri = `${FileSystem.documentDirectory}${pdfName}`
        await FileSystem.moveAsync({ from: uri, to: newUri })
        await Sharing.shareAsync(newUri)
      }

      dispatch(
        showSnackbar({
          message: "Ticket listo para imprimir",
          type: "success",
          duration: 3000,
        }),
      )
    } catch (error) {
      console.error("Error al imprimir ticket:", error)
      dispatch(
        showSnackbar({
          message: "Error al preparar el ticket para impresión",
          type: "error",
          duration: 3000,
        }),
      )
    } finally {
      setIsLoading(false)
    }
  }

  // Función para mostrar valores de forma profesional
  const mostrarValor = (valor: any, textoSiNoHay = "N/A") =>
    valor !== undefined && valor !== null && valor !== "" ? valor : textoSiNoHay;

  const mostrarLectura = (lectura: any, textoSiNoHay = "Sin registro") =>
    lectura !== undefined && lectura !== null ? Number(lectura).toLocaleString() : textoSiNoHay;

  // Renderizado condicional
  if (loadingTicket || loadingPozoData) {
    return <ActivityIndicator size="large" color="#00A86B" style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }} />;
  }
  if (ticketDocumentId && ticketData && lecturaData) {
    // Obtener datos relacionados
    const pozo = ticketData.attributes?.pozo?.data?.attributes;
    const bateria = pozo?.bateria?.data?.attributes;
    const lecturaAnterior = ticketData.lecturaAnterior;
    const eficienciaPromedioHistorica = ticketData.eficienciaPromedioHistorica;
    // Números de serie
    const numeroSerieVol = mostrarValor(lecturaData.attributes?.numero_serie_volumetrico);
    const numeroSerieElec = mostrarValor(lecturaData.attributes?.numero_serie_electrico);
    // Lecturas
    const lecturaActualVol = mostrarValor(lecturaData.attributes?.volumen);
    const lecturaAnteriorVol = mostrarValor(lecturaAnterior?.volumen);
    const consumoVol = mostrarValor(lecturaData.attributes?.volumen - lecturaAnterior?.volumen);
    const lecturaActualElec = mostrarValor(lecturaData.attributes?.lectura_electrica);
    const lecturaAnteriorElec = mostrarValor(lecturaAnterior?.lectura_electrica);
    const consumoElec = mostrarValor(lecturaData.attributes?.lectura_electrica - lecturaAnterior?.lectura_electrica);
    const eficienciaActual = mostrarValor(lecturaData.attributes?.eficiencia, "N/A");
    // Ubicación
    const ubicacion = pozo && pozo.latitud && pozo.longitud ? `Lat ${pozo.latitud}, Long ${pozo.longitud}` : 'No disponible';
    // Observaciones
    const observaciones = mostrarValor(lecturaData.attributes?.observaciones, "Sin observaciones");
    // Anomalías
    const anomaliasVol = Array.isArray(lecturaData.attributes?.anomalias_volumetrico) && lecturaData.attributes.anomalias_volumetrico.length > 0 ? lecturaData.attributes.anomalias_volumetrico.join(', ') : "Ninguna";
    const anomaliasElec = Array.isArray(lecturaData.attributes?.anomalias_electrico) && lecturaData.attributes.anomalias_electrico.length > 0 ? lecturaData.attributes.anomalias_electrico.join(', ') : "Ninguna";
    return (
      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        <View style={styles.ticketContainer}>
          {/* Encabezado */}
          <View style={styles.ticketHeader}>
            <Text style={styles.ticketNumber}>051</Text>
            <Text style={styles.ticketTitle}>ASOCIACIÓN DE USUARIOS DEL DISTRITO DE RIEGO</Text>
            <Text style={styles.ticketTitle}>NÚMERO 051 COSTA DE HERMOSILLO, A.C.</Text>
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
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Predio:</Text>
              <Text style={styles.infoValue}>{pozo?.predio ?? 'N/A'}</Text>
            </View>
          </View>
          <View style={styles.infoRow}>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Fecha:</Text>
              <Text style={styles.infoValue}>{ticketData.attributes?.fecha?.split('T')[0]}</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Hora:</Text>
              <Text style={styles.infoValue}>{ticketData.attributes?.fecha?.split('T')[1]}</Text>
            </View>
          </View>
          {/* Separador visual */}
          <Text style={styles.separator}>----------------------------------------------------</Text>
          {/* Lecturas del mes */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>LECTURAS DEL MES:</Text>
            {/* Medidor Volumétrico */}
            <View style={styles.readingContainer}>
              <Text style={styles.readingTitle}>- Medidor Volumétrico: {numeroSerieVol}</Text>
              <View style={styles.readingRow}>
                <Text style={styles.readingLabel}>Lectura Actual (m³):</Text>
                <Text style={styles.readingValue}>{mostrarLectura(lecturaActualVol)}</Text>
              </View>
              <View style={styles.readingRow}>
                <Text style={styles.readingLabel}>Lectura Anterior (m³):</Text>
                <Text style={styles.readingValue}>{mostrarLectura(lecturaAnteriorVol)}</Text>
              </View>
              <View style={styles.readingRow}>
                <Text style={styles.readingLabel}>Consumo del Mes (m³):</Text>
                <Text style={styles.readingValue}>{mostrarLectura(consumoVol)}</Text>
              </View>
              <Text style={styles.observation}>Anomalías: {anomaliasVol}</Text>
            </View>
            {/* Medidor Eléctrico */}
            <View style={styles.readingContainer}>
              <Text style={styles.readingTitle}>- Medidor Eléctrico: {numeroSerieElec}</Text>
              <View style={styles.readingRow}>
                <Text style={styles.readingLabel}>Lectura Actual (kWh):</Text>
                <Text style={styles.readingValue}>{mostrarLectura(lecturaActualElec)}</Text>
              </View>
              <View style={styles.readingRow}>
                <Text style={styles.readingLabel}>Lectura Anterior (kWh):</Text>
                <Text style={styles.readingValue}>{mostrarLectura(lecturaAnteriorElec)}</Text>
              </View>
              <View style={styles.readingRow}>
                <Text style={styles.readingLabel}>Consumo del Mes (kWh):</Text>
                <Text style={styles.readingValue}>{mostrarLectura(consumoElec)}</Text>
              </View>
              <Text style={styles.observation}>Anomalías: {anomaliasElec}</Text>
            </View>
          </View>
          {/* Separador visual */}
          <Text style={styles.separator}>----------------------------------------------------</Text>
          {/* Eficiencia */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>EFICIENCIA DETECTADA:</Text>
            <View style={styles.readingRow}>
              <Text style={styles.readingLabel}>Eficiencia Actual:</Text>
              <Text style={styles.readingValue}>{mostrarLectura(eficienciaActual)} m³/kWh</Text>
            </View>
            <View style={styles.readingRow}>
              <Text style={styles.readingLabel}>Eficiencia Promedio Histórica:</Text>
              <Text style={styles.readingValue}>{mostrarLectura(eficienciaPromedioHistorica)} m³/kWh</Text>
            </View>
          </View>
          {/* Separador visual */}
          <Text style={styles.separator}>----------------------------------------------------</Text>
          {/* Observaciones */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>OBSERVACIONES GENERALES:</Text>
            <Text style={styles.observationText}>{observaciones}</Text>
          </View>
        </View>
      </ScrollView>
    );
  }

  // Renderizado condicional para mostrar la lectura recién creada si existe
  if (lecturaActualDirecta) {
    const lectura = lecturaActualDirecta;
    const pozo = lectura.pozo;
    const bateria = pozo?.bateria;
    const numeroSerieVol = mostrarValor(lectura.numero_serie_volumetrico);
    const numeroSerieElec = mostrarValor(lectura.numero_serie_electrico);
    const lecturaActualVol = mostrarValor(lectura.volumen);
    const lecturaAnteriorVol = mostrarValor(lecturaAnteriorDirecta?.volumen);
    const consumoVol = lecturaAnteriorDirecta ? mostrarValor(lectura.volumen - lecturaAnteriorDirecta.volumen) : "N/A";
    const lecturaActualElec = mostrarValor(lectura.lectura_electrica);
    const lecturaAnteriorElec = mostrarValor(lecturaAnteriorDirecta?.lectura_electrica);
    const consumoElec = lecturaAnteriorDirecta ? mostrarValor(lectura.lectura_electrica - lecturaAnteriorDirecta.lectura_electrica) : "N/A";
    const eficienciaActual = mostrarValor(lectura.eficiencia, "N/A");
    const eficienciaPromedioHistorica = mostrarValor(lectura.eficiencia_promedio_historica, "N/A");
    const anomaliasVol = Array.isArray(lectura.anomalias_volumetrico) && lectura.anomalias_volumetrico.length > 0 ? lectura.anomalias_volumetrico.join(', ') : "Ninguna";
    const anomaliasElec = Array.isArray(lectura.anomalias_electrico) && lectura.anomalias_electrico.length > 0 ? lectura.anomalias_electrico.join(', ') : "Ninguna";
    const observaciones = mostrarValor(lectura.observaciones, "Sin observaciones");
    const ubicacion = pozo?.latitud && pozo?.longitud ? `Lat ${pozo.latitud}, Long ${pozo.longitud}` : 'No disponible';
    const fecha = lectura.fecha ? lectura.fecha.split('T')[0] : '';
    const hora = lectura.fecha ? new Date(lectura.fecha).toTimeString().split(' ')[0] : '';

    return (
      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        <View style={styles.ticketContainer}>
          {/* Encabezado */}
          <View style={styles.ticketHeader}>
            <Text style={styles.ticketNumber}>051</Text>
            <Text style={styles.ticketTitle}>ASOCIACIÓN DE USUARIOS DEL DISTRITO DE RIEGO</Text>
            <Text style={styles.ticketTitle}>NÚMERO 051 COSTA DE HERMOSILLO, A.C.</Text>
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
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Predio:</Text>
              <Text style={styles.infoValue}>{pozo?.predio ?? 'N/A'}</Text>
            </View>
          </View>
          <View style={styles.infoRow}>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Fecha:</Text>
              <Text style={styles.infoValue}>{fecha}</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Hora:</Text>
              <Text style={styles.infoValue}>{hora}</Text>
            </View>
          </View>
          {/* Separador visual */}
          <Text style={styles.separator}>----------------------------------------------------</Text>
          {/* Ubicación */}
          <View style={styles.locationRow}>
            <Text style={styles.locationText}>Ubicación: {ubicacion}</Text>
          </View>
          {/* Separador visual */}
          <Text style={styles.separator}>----------------------------------------------------</Text>
          {/* Sección de lecturas */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>LECTURAS DEL MES:</Text>
            {/* Medidor Volumétrico */}
            <View style={styles.readingContainer}>
              <Text style={styles.readingTitle}>- Medidor Volumétrico: {numeroSerieVol}</Text>
              <View style={styles.readingRow}>
                <Text style={styles.readingLabel}>Lectura Actual (m³):</Text>
                <Text style={styles.readingValue}>{mostrarLectura(lecturaActualVol)}</Text>
              </View>
              <View style={styles.readingRow}>
                <Text style={styles.readingLabel}>Lectura Anterior (m³):</Text>
                <Text style={styles.readingValue}>{lecturaAnteriorDirecta ? mostrarLectura(lecturaAnteriorVol) : 'Primera lectura'}</Text>
              </View>
              <View style={styles.readingRow}>
                <Text style={styles.readingLabel}>Consumo del Mes (m³):</Text>
                <Text style={styles.readingValue}>{lecturaAnteriorDirecta ? mostrarLectura(consumoVol) : 'N/A'}</Text>
              </View>
              <Text style={styles.observation}>Anomalías: {anomaliasVol}</Text>
            </View>
            {/* Medidor Eléctrico */}
            <View style={styles.readingContainer}>
              <Text style={styles.readingTitle}>- Medidor Eléctrico: {numeroSerieElec}</Text>
              <View style={styles.readingRow}>
                <Text style={styles.readingLabel}>Lectura Actual (kWh):</Text>
                <Text style={styles.readingValue}>{mostrarLectura(lecturaActualElec)}</Text>
              </View>
              <View style={styles.readingRow}>
                <Text style={styles.readingLabel}>Lectura Anterior (kWh):</Text>
                <Text style={styles.readingValue}>{lecturaAnteriorDirecta ? mostrarLectura(lecturaAnteriorElec) : 'Primera lectura'}</Text>
              </View>
              <View style={styles.readingRow}>
                <Text style={styles.readingLabel}>Consumo del Mes (kWh):</Text>
                <Text style={styles.readingValue}>{lecturaAnteriorDirecta ? mostrarLectura(consumoElec) : 'N/A'}</Text>
              </View>
              <Text style={styles.observation}>Anomalías: {anomaliasElec}</Text>
            </View>
          </View>
          {/* Separador visual */}
          <Text style={styles.separator}>----------------------------------------------------</Text>
          {/* Sección de eficiencia */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>EFICIENCIA DETECTADA:</Text>
            <View style={styles.readingRow}>
              <Text style={styles.readingLabel}>Eficiencia Actual:</Text>
              <Text style={styles.readingValue}>{mostrarLectura(eficienciaActual)} m³/kWh</Text>
            </View>
            <View style={styles.readingRow}>
              <Text style={styles.readingLabel}>Eficiencia Promedio Histórica:</Text>
              <Text style={styles.readingValue}>{mostrarLectura(eficienciaPromedioHistorica)} m³/kWh</Text>
            </View>
          </View>
          {/* Separador visual */}
          <Text style={styles.separator}>----------------------------------------------------</Text>
          {/* Información adicional */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>INFORMACIÓN ADICIONAL:</Text>
            <View style={styles.readingRow}>
              <Text style={styles.readingLabel}>Carga del Motor:</Text>
              <Text style={styles.readingValue}>{mostrarLectura(lectura.carga_motor, 'Sin registro')} A</Text>
            </View>
            <View style={styles.readingRow}>
              <Text style={styles.readingLabel}>Gasto del Pozo:</Text>
              <Text style={styles.readingValue}>{mostrarLectura(lectura.gasto_pozo, 'Sin registro')} L</Text>
            </View>
          </View>
          {/* Separador visual */}
          <Text style={styles.separator}>----------------------------------------------------</Text>
          {/* Observaciones generales */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>OBSERVACIONES GENERALES:</Text>
            <Text style={styles.observationText}>{observaciones}</Text>
          </View>
        </View>
      </ScrollView>
    );
  }

  // Si estamos en modo previsualización, usar los datos del pozo
  const pozo = pozoData;
  const bateria = pozo?.bateria;
  // Usar lecturas (que es el alias de lectura_de_pozos en la respuesta del backend)
  const lecturaActual = pozo?.lecturas?.[0];
  const lecturaAnterior = pozo?.lecturas?.[1];

  // Datos para mostrar en el ticket
  const numeroSerieVol = mostrarValor(lecturaActual?.numero_serie_volumetrico);
  const numeroSerieElec = mostrarValor(lecturaActual?.numero_serie_electrico);
  const lecturaActualVol = mostrarValor(lecturaActual?.volumen);
  const lecturaAnteriorVol = mostrarValor(lecturaAnterior?.volumen);
  const consumoVol = lecturaAnterior ? mostrarValor(lecturaActual?.volumen - lecturaAnterior?.volumen) : "N/A";
  const lecturaActualElec = mostrarValor(lecturaActual?.lectura_electrica);
  const lecturaAnteriorElec = mostrarValor(lecturaAnterior?.lectura_electrica);
  const consumoElec = lecturaAnterior ? mostrarValor(lecturaActual?.lectura_electrica - lecturaAnterior?.lectura_electrica) : "N/A";
  const eficienciaActual = mostrarValor(lecturaActual?.eficiencia, "N/A");
  const eficienciaPromedioHistorica = mostrarValor(lecturaActual?.eficiencia_promedio_historica, "N/A");
  const anomaliasVol = Array.isArray(lecturaActual?.anomalias_volumetrico) && lecturaActual.anomalias_volumetrico.length > 0 ? lecturaActual.anomalias_volumetrico.join(', ') : "Ninguna";
  const anomaliasElec = Array.isArray(lecturaActual?.anomalias_electrico) && lecturaActual.anomalias_electrico.length > 0 ? lecturaActual.anomalias_electrico.join(', ') : "Ninguna";
  const observaciones = mostrarValor(lecturaActual?.observaciones, "Sin observaciones");
  const ubicacion = pozo?.latitud && pozo?.longitud ? `Lat ${pozo.latitud}, Long ${pozo.longitud}` : 'No disponible';

  return (
    <View style={styles.container}>
      {/* Configuración del StatusBar */}
      <RNStatusBar backgroundColor="#f5f5f5" barStyle="dark-content" translucent={true} />
      <StatusBar style="dark" />

      {/* Espacio para el StatusBar */}
      <View style={{ height: STATUSBAR_HEIGHT, backgroundColor: "#f5f5f5" }} />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Ticket</Text>
        <TouchableOpacity style={styles.menuButton}>
          <Ionicons name="menu" size={24} color="#000" />
        </TouchableOpacity>
      </View>

      {/* Contenido del ticket */}
      <ScrollView style={styles.scrollView}>
        <ViewShot ref={viewShotRef} style={styles.ticketContainer} options={{ format: "jpg", quality: 0.9 }}>
          {/* Encabezado del ticket */}
          <View style={styles.ticketHeader}>
            <Text style={styles.ticketNumber}>051</Text>
            <Text style={styles.ticketTitle}>ASOCIACIÓN DE USUARIOS DEL DISTRITO DE RIEGO</Text>
            <Text style={styles.ticketTitle}>NÚMERO 051 COSTA DE HERMOSILLO, A.C.</Text>
          </View>
          {/* Información del pozo */}
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

          {/* Fecha y hora */}
          <View style={styles.infoRow}>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Fecha:</Text>
              <Text style={styles.infoValue}>{fecha}</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Hora:</Text>
              <Text style={styles.infoValue}>{hora}</Text>
            </View>
          </View>

          {/* Ubicación */}
          <View style={styles.locationRow}>
            <Text style={styles.locationText}>Ubicación: {ubicacion}</Text>
          </View>

          {/* Separador visual */}
          <Text style={styles.separator}>----------------------------------------------------</Text>
          {/* Lecturas del mes */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>LECTURAS DEL MES:</Text>

            {/* Medidor Volumétrico */}
            <View style={styles.readingContainer}>
              <Text style={styles.readingTitle}>- Medidor Volumétrico: {numeroSerieVol}</Text>
              <View style={styles.readingRow}>
                <Text style={styles.readingLabel}>Lectura Actual (m³):</Text>
                <Text style={styles.readingValue}>{mostrarLectura(lecturaActualVol)}</Text>
              </View>
              <View style={styles.readingRow}>
                <Text style={styles.readingLabel}>Lectura Anterior (m³):</Text>
                <Text style={styles.readingValue}>{lecturaAnteriorDirecta ? mostrarLectura(lecturaAnteriorVol) : 'Primera lectura'}</Text>
              </View>
              <View style={styles.readingRow}>
                <Text style={styles.readingLabel}>Consumo del Mes (m³):</Text>
                <Text style={styles.readingValue}>{lecturaAnteriorDirecta ? mostrarLectura(consumoVol) : 'N/A'}</Text>
              </View>
              <Text style={styles.observation}>Anomalías: {anomaliasVol}</Text>
            </View>

            {/* Medidor Eléctrico */}
            <View style={styles.readingContainer}>
              <Text style={styles.readingTitle}>- Medidor Eléctrico: {numeroSerieElec}</Text>
              <View style={styles.readingRow}>
                <Text style={styles.readingLabel}>Lectura Actual (kWh):</Text>
                <Text style={styles.readingValue}>{mostrarLectura(lecturaActualElec)}</Text>
              </View>
              <View style={styles.readingRow}>
                <Text style={styles.readingLabel}>Lectura Anterior (kWh):</Text>
                <Text style={styles.readingValue}>{lecturaAnteriorDirecta ? mostrarLectura(lecturaAnteriorElec) : 'Primera lectura'}</Text>
              </View>
              <View style={styles.readingRow}>
                <Text style={styles.readingLabel}>Consumo del Mes (kWh):</Text>
                <Text style={styles.readingValue}>{lecturaAnteriorDirecta ? mostrarLectura(consumoElec) : 'N/A'}</Text>
              </View>
              <Text style={styles.observation}>Anomalías: {anomaliasElec}</Text>
            </View>
          </View>
          {/* Separador visual */}
          <Text style={styles.separator}>----------------------------------------------------</Text>
          {/* Sección de eficiencia */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>EFICIENCIA DETECTADA:</Text>
            <View style={styles.readingRow}>
              <Text style={styles.readingLabel}>Eficiencia Actual:</Text>
              <Text style={styles.readingValue}>{mostrarLectura(eficienciaActual)} m³/kWh</Text>
            </View>
            <View style={styles.readingRow}>
              <Text style={styles.readingLabel}>Eficiencia Promedio Histórica:</Text>
              <Text style={styles.readingValue}>{mostrarLectura(eficienciaPromedioHistorica)} m³/kWh</Text>
            </View>
          </View>
          {/* Separador visual */}
          <Text style={styles.separator}>----------------------------------------------------</Text>
          {/* Información adicional */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>INFORMACIÓN ADICIONAL:</Text>
            <View style={styles.readingRow}>
              <Text style={styles.readingLabel}>Carga del Motor:</Text>
              <Text style={styles.readingValue}>{mostrarLectura(lecturaActual?.carga_motor, 'Sin registro')} A</Text>
            </View>
            <View style={styles.readingRow}>
              <Text style={styles.readingLabel}>Gasto del Pozo:</Text>
              <Text style={styles.readingValue}>{mostrarLectura(lecturaActual?.gasto_pozo, 'Sin registro')} L</Text>
            </View>
          </View>
          {/* Separador visual */}
          <Text style={styles.separator}>----------------------------------------------------</Text>
          {/* Observaciones generales */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>OBSERVACIONES GENERALES:</Text>
            <Text style={styles.observationText}>{observaciones}</Text>
          </View>
        </ViewShot>
      </ScrollView>

      {/* Botones de acción */}
      <View style={styles.actionButtons}>
        <TouchableOpacity style={styles.actionButton} onPress={handleBack}>
          <Ionicons name="home-outline" size={24} color="#666" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton} onPress={handleDownloadPDF}>
          <Ionicons name="download-outline" size={24} color="#666" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.printButton} onPress={handlePrint}>
          <Ionicons name="print-outline" size={24} color="white" />
          <Text style={styles.printButtonText}>Imprimir</Text>
        </TouchableOpacity>
      </View>

      {/* Indicador de carga */}
      {isLoading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#00A86B" />
          <Text style={styles.loadingText}>Procesando...</Text>
        </View>
      )}
    </View>
  )
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
})

