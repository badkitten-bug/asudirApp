import { getApiUrl, getAuthHeaders, getAuthHeadersFormData } from '@/src/config/api';

export async function crearLecturaPozo({
  token,
  data
}: {
  token: string;
  data: any;
}) {
  const url = `${getApiUrl()}/lectura-pozos`;
  const headers = getAuthHeaders(token);
  const body = JSON.stringify({ data });
  
  console.log('URL de crearLecturaPozo:', url);
  console.log('Headers de crearLecturaPozo:', headers);
  console.log('Body de crearLecturaPozo:', body);
  
  const res = await fetch(url, {
    method: 'POST',
    headers,
    body
  });
  
  if (!res.ok) {
    const errorText = await res.text();
    console.error('Error response crearLecturaPozo:', errorText);
    throw new Error('Error al guardar la lectura en el servidor');
  }
  
  return res.json();
}

export async function crearLecturaPozoConFotos({
  token,
  data,
  fotoVolumetricoUri,
  fotoElectricoUri
}: {
  token: string;
  data: any;
  fotoVolumetricoUri?: string;
  fotoElectricoUri?: string;
}) {
  const formData = new FormData();
  
  formData.append('data', JSON.stringify(data));
  
  if (fotoVolumetricoUri) {
    let file: any = fotoVolumetricoUri;
    if (typeof window !== 'undefined') {
      file = await uriToFile(fotoVolumetricoUri, 'foto_volumetrico.jpg', 'image/jpeg');
    }
    formData.append('files.foto_volumetrico', file);
  }
  
  if (fotoElectricoUri) {
    let file: any = fotoElectricoUri;
    if (typeof window !== 'undefined') {
      file = await uriToFile(fotoElectricoUri, 'foto_electrico.jpg', 'image/jpeg');
    }
    formData.append('files.foto_electrico', file);
  }
  
  const url = `${getApiUrl()}/lectura-pozos`;
  const headers = getAuthHeadersFormData(token);
  
  console.log('URL de crearLecturaPozoConFotos:', url);
  console.log('Headers de crearLecturaPozoConFotos:', headers);
  
  const res = await fetch(url, {
    method: 'POST',
    headers,
    body: formData
  });
  
  if (!res.ok) {
    const errorText = await res.text();
    console.error('Error response crearLecturaPozoConFotos:', errorText);
    throw new Error('Error al crear la lectura con fotos');
  }
  
  return res.json();
}

export async function uploadFoto({
  token,
  uri,
  field,
  lecturaId,
  filename
}: {
  token: string;
  uri?: string;
  field: string;
  lecturaId: string | number;
  filename: string;
}) {
  const formData = new FormData();
  
  if (uri) {
    formData.append('files', {
      uri,
      name: filename,
      type: 'image/jpeg',
    } as any);
  }
  
  formData.append('ref', 'api::lectura-pozo.lectura-pozo');
  formData.append('refId', String(lecturaId));
  formData.append('field', field);
  
  const url = `${getApiUrl()}/upload`;
  const headers = getAuthHeadersFormData(token);
  
  console.log('URL de uploadFoto:', url);
  console.log('Headers de uploadFoto:', headers);
  
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers,
      body: formData
    });
    
    if (!res.ok) {
      console.warn('Upload failed, returning null');
      return null;
    }
    
    return res.json();
  } catch (e) {
    console.warn('Upload error, returning null:', e);
    return null;
  }
} 