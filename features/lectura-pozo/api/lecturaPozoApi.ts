import { getApiUrl, getAuthHeaders, getAuthHeadersFormData } from '@/src/config/api';

// Helper para subir una imagen y obtener el ID
export async function subirImagen({ token, file, field, lecturaId }: {
  token: string;
  file: File | Blob | string;
  field: string;
  lecturaId: string | number;
}): Promise<number | null> {
  const formData = new FormData();

  // Web: file es File/Blob, móvil: file es uri
  if (typeof file === 'string') {
    // Móvil (expo-image-picker): file es uri
    formData.append('files', {
      uri: file,
      name: `${field}.jpg`,
      type: 'image/jpeg',
    } as any);
  } else {
    // Web: file es File o Blob
    formData.append('files', file);
  }

  formData.append('ref', 'api::lectura-pozo.lectura-pozo');
  formData.append('refId', String(lecturaId));
  formData.append('field', field);

  const url = `${getApiUrl()}/upload`;
  const headers = getAuthHeadersFormData(token);

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers,
      body: formData
    });
    if (!res.ok) {
      const errorText = await res.text();
      console.error('Error al subir imagen:', errorText);
      return null;
    }
    const data = await res.json();
    // Strapi retorna un array de archivos subidos
    if (Array.isArray(data) && data.length > 0) {
      return data[0].id;
    }
    return null;
  } catch (e) {
    console.error('Error al subir imagen:', e);
    return null;
  }
}

// Crear lectura de pozo con IDs de imágenes
export async function crearLecturaPozoConImagenes({
  token,
  data,
  fotoVolumetrico,
  fotoElectrico
}: {
  token: string;
  data: any;
  fotoVolumetrico?: File | Blob | string;
  fotoElectrico?: File | Blob | string;
}) {
  // 1. Crear la lectura sin imágenes
  const url = `${getApiUrl()}/lectura-pozos`;
  const headers = getAuthHeaders(token);
  const body = JSON.stringify({ data });

  const res = await fetch(url, {
    method: 'POST',
    headers,
    body
  });
  if (!res.ok) {
    const errorText = await res.text();
    throw new Error('Error al crear la lectura: ' + errorText);
  }
  const lectura = await res.json();
  const lecturaId = lectura.data?.id;
  if (!lecturaId) throw new Error('No se pudo obtener el ID de la lectura');

  // 2. Subir imágenes y asociar
  let fotoVolumetricoId = null;
  let fotoElectricoId = null;
  if (fotoVolumetrico) {
    fotoVolumetricoId = await subirImagen({
      token,
      file: fotoVolumetrico,
      field: 'foto_volumetrico',
      lecturaId
    });
    if (!fotoVolumetricoId) throw new Error('Error al subir foto volumétrica');
  }
  if (fotoElectrico) {
    fotoElectricoId = await subirImagen({
      token,
      file: fotoElectrico,
      field: 'foto_electrico',
      lecturaId
    });
    if (!fotoElectricoId) throw new Error('Error al subir foto eléctrica');
  }

  // 3. (Opcional) Actualizar la lectura con los IDs de las imágenes si tu modelo lo requiere
  // Si Strapi asocia automáticamente, este paso no es necesario

  return {
    ...lectura,
    fotoVolumetricoId,
    fotoElectricoId
  };
} 