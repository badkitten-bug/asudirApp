export async function crearLecturaPozo({
  apiUrl,
  token,
  data
}: {
  apiUrl: string;
  token: string;
  data: any;
}) {
  const url = `${apiUrl}/lectura-pozos`;
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
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
  apiUrl,
  token,
  data,
  fotoVolumetricoUri,
  fotoElectricoUri
}: {
  apiUrl: string;
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
  
  const res = await fetch(`${apiUrl}/lectura-pozos`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    },
    body: formData
  });
  
  if (!res.ok) {
    const errorText = await res.text();
    console.error('Error response:', errorText);
    throw new Error('Error al crear la lectura con fotos');
  }
  
  return res.json();
}

export async function uploadFoto({
  apiUrl,
  token,
  uri,
  field,
  lecturaId,
  filename
}: {
  apiUrl: string;
  token: string;
  uri?: any; // Puede ser File (web) o string (móvil)
  field: string;
  lecturaId: string | number;
  filename: string;
}) {
  const formData = new FormData();
  // Log de depuración
  console.log('DEBUG uploadFoto - tipo de archivo:', typeof uri, uri instanceof File, uri);
  if (typeof window !== 'undefined' && uri instanceof File) {
    // WEB: File real
    formData.append('files', uri);
  } else if (uri && typeof uri === 'string') {
    // MÓVIL: objeto { uri, name, type }
    formData.append('files', {
      uri,
      name: filename,
      type: 'image/jpeg',
    } as any);
  }
  formData.append('ref', 'api::lectura-pozo.lectura-pozo');
  formData.append('refId', String(lecturaId));
  formData.append('field', field);
  const url = `${apiUrl}/upload`;
  const headers = {
    'Authorization': `Bearer ${token}`
  };
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers,
      body: formData
    });
    if (!res.ok) {
      // No lanzar error, solo retornar null
      return null;
    }
    return res.json();
  } catch (e) {
    // No lanzar error, solo retornar null
    return null;
  }
} 