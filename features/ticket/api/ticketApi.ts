import { Platform } from 'react-native';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';

export interface TicketPrintData {
  bateria: string;
  pozo: string;
  predio: string;
  fecha: string;
  hora: string;
  numeroSerieVol?: string;
  numeroSerieElec?: string;
  lecturaActualVol: string;
  lecturaAnteriorVol: string;
  consumoVol: string;
  lecturaActualElec: string;
  lecturaAnteriorElec: string;
  consumoElec: string;
  eficienciaActual: string;
  eficienciaPromedioHistorica: string;
  anomaliasVol: string;
  anomaliasElec: string;
  observaciones: string;
  codigo: string;
}

export const printTicketHTML = async (printData: TicketPrintData) => {
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>Ticket de Lectura</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 0; padding: 10px; }
          .ticket { max-width: 380px; margin: 0 auto; }
          .header { text-align: center; border-bottom: 2px solid #000; padding-bottom: 10px; }
          .ticket-number { font-size: 24px; font-weight: bold; }
          .ticket-title { font-size: 12px; margin: 5px 0; }
          .ticket-code { font-size: 10px; color: #666; }
          .info-row { display: flex; justify-content: space-between; margin: 5px 0; }
          .section { margin: 15px 0; }
          .section-title { font-weight: bold; border-bottom: 1px solid #ccc; padding-bottom: 5px; }
          .reading-row { display: flex; justify-content: space-between; margin: 3px 0; }
          .line { border-top: 1px solid #ccc; margin: 10px 0; }
          .center { text-align: center; }
          .small { font-size: 10px; }
          .bold { font-weight: bold; }
        </style>
      </head>
      <body>
        <div class="ticket">
          <div class="header">
            <div class="ticket-number">051</div>
            <div class="ticket-title">ASOCIACION DE USUARIOS DEL DISTRITO DE RIEGO NUMERO 051 COSTA DE HERMOSILLO, A.C.</div>
            <div class="ticket-code">Código del Ticket: ${printData.codigo}</div>
          </div>
          
          <div class="info-row">
            <span>Batería:</span>
            <span>${printData.bateria}</span>
          </div>
          <div class="info-row">
            <span>Pozo:</span>
            <span>${printData.pozo}</span>
          </div>
          <div class="info-row">
            <span>Predio:</span>
            <span>${printData.predio}</span>
          </div>
          <div class="info-row">
            <span>Fecha:</span>
            <span>${printData.fecha}</span>
          </div>
          <div class="info-row">
            <span>Hora:</span>
            <span>${printData.hora}</span>
          </div>
          
          <div class="line"></div>
          
          <div class="section">
            <div class="section-title">Lecturas del Mes</div>
            <div class="reading-row">
              <span>Medidor Volumétrico:</span>
              <span>${printData.numeroSerieVol || 'N/A'}</span>
            </div>
            <div class="reading-row">
              <span>Lectura Actual (m³):</span>
              <span>${printData.lecturaActualVol}</span>
            </div>
            <div class="reading-row">
              <span>Lectura Anterior (m³):</span>
              <span>${printData.lecturaAnteriorVol}</span>
            </div>
            <div class="reading-row">
              <span>Consumo del Mes (m³):</span>
              <span>${printData.consumoVol}</span>
            </div>
          </div>
          
          <div class="section">
            <div class="reading-row">
              <span>Medidor Eléctrico:</span>
              <span>${printData.numeroSerieElec || 'N/A'}</span>
            </div>
            <div class="reading-row">
              <span>Lectura Actual (kWh):</span>
              <span>${printData.lecturaActualElec}</span>
            </div>
            <div class="reading-row">
              <span>Lectura Anterior (kWh):</span>
              <span>${printData.lecturaAnteriorElec}</span>
            </div>
            <div class="reading-row">
              <span>Consumo del Mes (kWh):</span>
              <span>${printData.consumoElec}</span>
            </div>
          </div>
          
          <div class="line"></div>
          
          <div class="section">
            <div class="section-title">Eficiencia Detectada</div>
            <div class="reading-row">
              <span>Eficiencia Actual:</span>
              <span>${printData.eficienciaActual}</span>
            </div>
            <div class="reading-row">
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
    const printWindow = window.open('', '_blank');
    printWindow?.document.write(html);
    printWindow?.document.close();
    printWindow?.focus();
    printWindow?.print();
    printWindow?.close();
  } else {
    const { uri } = await Print.printToFileAsync({ 
      html, 
      width: 380, 
      height: 900, 
      base64: false 
    });
    
    if (Platform.OS === "ios") {
      await Sharing.shareAsync(uri);
    } else {
      const pdfName = `ticket_${Date.now()}.pdf`;
      const newUri = `${FileSystem.documentDirectory}${pdfName}`;
      await FileSystem.moveAsync({ from: uri, to: newUri });
      await Sharing.shareAsync(newUri);
    }
  }
};

export const prepareTicketPrintData = (ticketData: any, lecturaData: any): TicketPrintData => {
  const lectura = ticketData?.lectura ?? {};
  const pozo = lectura?.pozo ?? {};
  const bateria = pozo?.bateria ?? {};
  const lecturaAnterior = ticketData?.lecturaAnterior ?? null;

  const mostrarValor = (valor: any, textoSiNoHay = "N/A") =>
    valor !== undefined && valor !== null && valor !== "" ? valor : textoSiNoHay;

  const mostrarLectura = (lectura: any, textoSiNoHay = "Sin registro") =>
    lectura !== undefined && lectura !== null ? Number(lectura).toLocaleString() : textoSiNoHay;

  return {
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
}; 