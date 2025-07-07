// Constantes y opciones para la feature lectura-pozo

export const MEDIDOR_VOLUMETRICO_OPTIONS = [
  { label: "Funcionando", value: "funcionando" },
  { label: "Descompuesto", value: "descompuesto" },
  { label: "Cambio de medidor", value: "cambio" },
  { label: "Sin medidor", value: "sin_medidor" },
];

export const EXTRACCION_MANUAL_OPTIONS = [
  { label: "Normal", value: "normal" },
  { label: "Estimado", value: "estimado" },
  { label: "No acceso", value: "no_acceso" },
  { label: "Inactivo", value: "inactivo" },
  { label: "Sin medidor", value: "sin_medidor" },
];

export const TIPO_DESCARGA_OPTIONS = [
  { label: "Libre", value: "libre" },
  { label: "Controlada", value: "controlada" },
  { label: "Cerrada", value: "cerrada" },
];

export const DISTANCIA_OPTIONS = [
  { label: "10m", value: "10m" },
  { label: "20m", value: "20m" },
  { label: "35m", value: "35m" },
  { label: "50m", value: "50m" },
  { label: "Más de 50m", value: "mas_50m" },
];

export const ANOMALIAS_VOLUMETRICO = [
  'Medidor Apagado',
  'Sin medidor',
  'Pozo encendido, medidor no marca gasto',
  'Sin Acceso',
  'Lectura ilegible',
  'Cambio de Medidor',
  'Holograma violado',
  'Holograma despegado',
  'Pozo desequipado',
  'Pozo mantenimiento',
  'Otro',
];

export const ANOMALIAS_ELECTRICO = [
  'Medidor Apagado',
  'Sin medidor',
  'Sin Acceso',
  'Lectura ilegible',
  'Cambio de Medidor',
  'Medidor descompuesto',
  'Otro',
]; 