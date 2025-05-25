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

const STATUSBAR_HEIGHT = Constants.statusBarHeight || 0
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

  // Modificar para asegurar que siempre haya datos, incluso si no se pasan parámetros
  // Datos del pozo y lecturas
  const pozoId = (params.pozoId as string) || "1003"
  const pozoNombre = (params.pozoNombre as string) || "Pozo 1003"
  const pozoUbicacion = (params.pozoUbicacion as string) || "LA ESPERANZA"
  const lecturaVolumen = (params.lecturaVolumen as string) || "255000"
  const lecturaVolumenAnterior = "250000" // Simulado
  const lecturaElectrica = (params.lecturaElectrica as string) || "480"
  const lecturaElectricaAnterior = "470" // Simulado
  const cargaMotor = (params.cargaMotor as string) || "15.5"
  const gastoPozo = (params.gastoPozo as string) || "12500"
  const observaciones = (params.observaciones as string) || "Sin anomalías"
  const fecha = new Date().toISOString().split("T")[0]
  const hora = new Date().toTimeString().split(" ")[0]
  const ticketId = (params.ticketId as string) || ""

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
        t.lecturaVolumen === lecturaVolumen &&
        t.lecturaElectrica === lecturaElectrica &&
        t.fecha === fecha,
    )

    if (existingTicket) {
      setTicketSaved(true)
    }
  }, [allTickets, pozoId, lecturaVolumen, lecturaElectrica, fecha, ticketId])

  // Cálculos
  const consumoVolumen = Number.parseInt(lecturaVolumen) - Number.parseInt(lecturaVolumenAnterior)
  const consumoElectrico = Number.parseInt(lecturaElectrica) - Number.parseInt(lecturaElectricaAnterior)
  const eficienciaActual = consumoElectrico > 0 ? (consumoVolumen / consumoElectrico).toFixed(1) : "N/A"

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
      pozoNombre,
      pozoUbicacion,
      lecturaVolumen,
      lecturaElectrica,
      cargaMotor,
      gastoPozo,
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
            <span><b>Batería:</b> #3</span>
            <span><b>Pozo:</b> ${pozoId}</span>
            <span><b>Predio:</b> ${pozoUbicacion}</span>
          </div>
          
          <div class="info-row">
            <span><b>Fecha:</b> ${fecha}</span>
            <span><b>Hora:</b> ${hora}</span>
          </div>
          
          <div class="info-row">
            <span><b>Ubicación:</b> Lat 28.930000, Long -111.570000</span>
          </div>
          
          <div class="section-title">LECTURAS DEL MES:</div>
          
          <div class="reading-container">
            <div class="reading-title">- Medidor Volumétrico: No.55555666</div>
            <div class="reading-row">
              <span>Lectura Actual (m³):</span>
              <span>${Number.parseInt(lecturaVolumen).toLocaleString()}</span>
            </div>
            <div class="reading-row">
              <span>Lectura Anterior (m³):</span>
              <span>${Number.parseInt(lecturaVolumenAnterior).toLocaleString()}</span>
            </div>
            <div class="reading-row">
              <span>Consumo del Mes (m³):</span>
              <span>${consumoVolumen.toLocaleString()} (0.0 M/h)</span>
            </div>
          </div>
          
          <div class="reading-container">
            <div class="reading-title">- Medidor Eléctrico: No.66655555</div>
            <div class="reading-row">
              <span>Lectura Actual (kWh):</span>
              <span>${lecturaElectrica}</span>
            </div>
            <div class="reading-row">
              <span>Lectura Anterior (kWh):</span>
              <span>${lecturaElectricaAnterior}</span>
            </div>
            <div class="reading-row">
              <span>Consumo del Mes (kWh):</span>
              <span>${consumoElectrico}</span>
            </div>
            <div class="observation">Observaciones: ${observaciones}</div>
          </div>
          
          <div class="section-title">EFICIENCIA DETECTADA:</div>
          <div class="reading-row">
            <span>Eficiencia Actual:</span>
            <span>${eficienciaActual} m³/kWh</span>
          </div>
          <div class="reading-row">
            <span>Eficiencia Promedio Histórica:</span>
            <span>383.57 m³/kWh</span>
          </div>
          
          <div class="section-title">INFORMACIÓN ADICIONAL:</div>
          <div class="reading-row">
            <span>Carga del Motor:</span>
            <span>${cargaMotor} A</span>
          </div>
          <div class="reading-row">
            <span>Gasto del Pozo:</span>
            <span>${gastoPozo || "N/A"} L</span>
          </div>
          
          <div class="section-title">HISTORIAL DE CONSUMO (12 MESES + ACTUAL):</div>
          ${volChartHTML}
          ${elecChartHTML}
          
          <div class="section-title">HISTORIAL DE EFICIENCIA (12 MESES + ACTUAL):</div>
          ${eficChartHTML}
          
          <div class="section-title">OBSERVACIONES GENERALES:</div>
          <p>${observaciones || "Sin observaciones adicionales."}</p>
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
            <span><b>Batería:</b> #3</span>
            <span><b>Pozo:</b> ${pozoId}</span>
            <span><b>Predio:</b> ${pozoUbicacion}</span>
          </div>
          
          <div class="info-row">
            <span><b>Fecha:</b> ${fecha}</span>
            <span><b>Hora:</b> ${hora}</span>
          </div>
          
          <div class="info-row">
            <span><b>Ubicación:</b> Lat 28.930000, Long -111.570000</span>
          </div>
          
          <div class="section-title">LECTURAS DEL MES:</div>
          
          <div class="reading-container">
            <div class="reading-title">- Medidor Volumétrico: No.55555666</div>
            <div class="reading-row">
              <span>Lectura Actual (m³):</span>
              <span>${Number.parseInt(lecturaVolumen).toLocaleString()}</span>
            </div>
            <div class="reading-row">
              <span>Lectura Anterior (m³):</span>
              <span>${Number.parseInt(lecturaVolumenAnterior).toLocaleString()}</span>
            </div>
            <div class="reading-row">
              <span>Consumo del Mes (m³):</span>
              <span>${consumoVolumen.toLocaleString()} (0.0 M/h)</span>
            </div>
          </div>
          
          <div class="reading-container">
            <div class="reading-title">- Medidor Eléctrico: No.66655555</div>
            <div class="reading-row">
              <span>Lectura Actual (kWh):</span>
              <span>${lecturaElectrica}</span>
            </div>
            <div class="reading-row">
              <span>Lectura Anterior (kWh):</span>
              <span>${lecturaElectricaAnterior}</span>
            </div>
            <div class="reading-row">
              <span>Consumo del Mes (kWh):</span>
              <span>${consumoElectrico}</span>
            </div>
            <div class="observation">Observaciones: ${observaciones}</div>
          </div>
          
          <div class="section-title">EFICIENCIA DETECTADA:</div>
          <div class="reading-row">
            <span>Eficiencia Actual:</span>
            <span>${eficienciaActual} m³/kWh</span>
          </div>
          <div class="reading-row">
            <span>Eficiencia Promedio Histórica:</span>
            <span>383.57 m³/kWh</span>
          </div>
          
          <div class="section-title">INFORMACIÓN ADICIONAL:</div>
          <div class="reading-row">
            <span>Carga del Motor:</span>
            <span>${cargaMotor} A</span>
          </div>
          <div class="reading-row">
            <span>Gasto del Pozo:</span>
            <span>${gastoPozo || "N/A"} L</span>
          </div>
          
          <div class="section-title">HISTORIAL DE CONSUMO (12 MESES + ACTUAL):</div>
          ${volChartHTML}
          ${elecChartHTML}
          
          <div class="section-title">HISTORIAL DE EFICIENCIA (12 MESES + ACTUAL):</div>
          ${eficChartHTML}
          
          <div class="section-title">OBSERVACIONES GENERALES:</div>
          <p>${observaciones || "Sin observaciones adicionales."}</p>
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
              <Text style={styles.infoValue}>#3</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Pozo:</Text>
              <Text style={styles.infoValue}>{pozoId}</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Predio:</Text>
              <Text style={styles.infoValue}>{pozoUbicacion}</Text>
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
            <Text style={styles.locationText}>Ubicación: Lat 28.930000, Long -111.570000</Text>
          </View>

          {/* Sección de lecturas */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>LECTURAS DEL MES:</Text>

            {/* Medidor Volumétrico */}
            <View style={styles.readingContainer}>
              <Text style={styles.readingTitle}>- Medidor Volumétrico: No.55555666</Text>
              <View style={styles.readingRow}>
                <Text style={styles.readingLabel}>Lectura Actual (m³):</Text>
                <Text style={styles.readingValue}>{Number.parseInt(lecturaVolumen).toLocaleString()}</Text>
              </View>
              <View style={styles.readingRow}>
                <Text style={styles.readingLabel}>Lectura Anterior (m³):</Text>
                <Text style={styles.readingValue}>{Number.parseInt(lecturaVolumenAnterior).toLocaleString()}</Text>
              </View>
              <View style={styles.readingRow}>
                <Text style={styles.readingLabel}>Consumo del Mes (m³):</Text>
                <Text style={styles.readingValue}>{consumoVolumen.toLocaleString()} (0.0 M/h)</Text>
              </View>
            </View>

            {/* Medidor Eléctrico */}
            <View style={styles.readingContainer}>
              <Text style={styles.readingTitle}>- Medidor Eléctrico: No.66655555</Text>
              <View style={styles.readingRow}>
                <Text style={styles.readingLabel}>Lectura Actual (kWh):</Text>
                <Text style={styles.readingValue}>{lecturaElectrica}</Text>
              </View>
              <View style={styles.readingRow}>
                <Text style={styles.readingLabel}>Lectura Anterior (kWh):</Text>
                <Text style={styles.readingValue}>{lecturaElectricaAnterior}</Text>
              </View>
              <View style={styles.readingRow}>
                <Text style={styles.readingLabel}>Consumo del Mes (kWh):</Text>
                <Text style={styles.readingValue}>{consumoElectrico}</Text>
              </View>
              <Text style={styles.observation}>Observaciones: {observaciones}</Text>
            </View>
          </View>

          {/* Sección de eficiencia */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>EFICIENCIA DETECTADA:</Text>
            <View style={styles.readingRow}>
              <Text style={styles.readingLabel}>Eficiencia Actual:</Text>
              <Text style={styles.readingValue}>{eficienciaActual} m³/kWh</Text>
            </View>
            <View style={styles.readingRow}>
              <Text style={styles.readingLabel}>Eficiencia Promedio Histórica:</Text>
              <Text style={styles.readingValue}>383.57 m³/kWh</Text>
            </View>
          </View>

          {/* Información adicional */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>INFORMACIÓN ADICIONAL:</Text>
            <View style={styles.readingRow}>
              <Text style={styles.readingLabel}>Carga del Motor:</Text>
              <Text style={styles.readingValue}>{cargaMotor} A</Text>
            </View>
            <View style={styles.readingRow}>
              <Text style={styles.readingLabel}>Gasto del Pozo:</Text>
              <Text style={styles.readingValue}>{gastoPozo || "N/A"} L</Text>
            </View>
          </View>

          {/* Gráficos */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>HISTORIAL DE CONSUMO (12 MESES + ACTUAL):</Text>

            {/* Gráfico de consumo volumétrico */}
            <Text style={styles.chartTitle}>Consumo Volumétrico (m³):</Text>
            <View style={styles.chartPlaceholder}>
              <Text style={styles.chartPlaceholderText}>Datos de consumo volumétrico</Text>
              <View style={styles.barChartContainer}>
                {consumoVolData.datasets[0].data.map((value, index) => (
                  <View key={index} style={styles.barChartColumn}>
                    <View style={[styles.barChartBar, { height: value / 10 }]} />
                    <Text style={styles.barChartLabel}>{consumoVolData.labels[index]}</Text>
                  </View>
                ))}
              </View>
            </View>

            {/* Gráfico de consumo eléctrico */}
            <Text style={styles.chartTitle}>Consumo Eléctrico (kWh):</Text>
            <View style={styles.chartPlaceholder}>
              <Text style={styles.chartPlaceholderText}>Datos de consumo eléctrico</Text>
              <View style={styles.barChartContainer}>
                {consumoElecData.datasets[0].data.map((value, index) => (
                  <View key={index} style={styles.barChartColumn}>
                    <View style={[styles.barChartBar, { height: value * 5, backgroundColor: "#4169E1" }]} />
                    <Text style={styles.barChartLabel}>{consumoElecData.labels[index]}</Text>
                  </View>
                ))}
              </View>
            </View>
          </View>

          {/* Gráfico de eficiencia */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>HISTORIAL DE EFICIENCIA (12 MESES + ACTUAL):</Text>
            <View style={styles.chartPlaceholder}>
              <Text style={styles.chartPlaceholderText}>Datos de eficiencia</Text>
              <View style={styles.barChartContainer}>
                {eficienciaData.datasets[0].data.map((value, index) => (
                  <View key={index} style={styles.barChartColumn}>
                    <View style={[styles.barChartBar, { height: value / 10, backgroundColor: "#FFA500" }]} />
                    <Text style={styles.barChartLabel}>{eficienciaData.labels[index]}</Text>
                  </View>
                ))}
              </View>
            </View>
          </View>

          {/* Observaciones generales */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>OBSERVACIONES GENERALES:</Text>
            <Text style={styles.observationText}>{observaciones || "Sin observaciones adicionales."}</Text>
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
})

