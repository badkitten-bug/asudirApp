/**
 * Configuración centralizada de la API
 * Maneja la URL base y headers comunes para todas las peticiones
 */

// Obtener la URL base de la API desde las variables de entorno
export const getApiUrl = (): string => {
  const baseUrl = process.env.EXPO_PUBLIC_API_URL || '';
  
  // Si la URL ya termina en /api, no agregar otro
  if (baseUrl.endsWith('/api')) {
    return baseUrl;
  }
  
  // Si la URL termina en /, remover el slash final
  const cleanUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
  
  // Agregar /api si no está presente
  return cleanUrl + '/api';
};

// Helper para crear headers de autenticación
export const getAuthHeaders = (token: string): Record<string, string> => ({
  'Authorization': `Bearer ${token}`,
  'Content-Type': 'application/json',
});

// Helper para crear headers de autenticación sin Content-Type (para FormData)
export const getAuthHeadersFormData = (token: string): Record<string, string> => ({
  'Authorization': `Bearer ${token}`,
});

// Helper para hacer peticiones GET autenticadas
export const apiGet = async (endpoint: string, token: string) => {
  const url = `${getApiUrl()}${endpoint}`;
  const headers = getAuthHeaders(token);
  
  console.log('API GET:', url);
  console.log('Headers:', headers);
  
  const response = await fetch(url, { headers });
  
  if (!response.ok) {
    const errorText = await response.text();
    console.error('API Error:', response.status, errorText);
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }
  
  return response.json();
};

// Helper para hacer peticiones POST autenticadas
export const apiPost = async (endpoint: string, token: string, data: any) => {
  const url = `${getApiUrl()}${endpoint}`;
  const headers = getAuthHeaders(token);
  const body = JSON.stringify({ data });
  
  console.log('API POST:', url);
  console.log('Headers:', headers);
  console.log('Body:', body);
  
  const response = await fetch(url, {
    method: 'POST',
    headers,
    body
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    console.error('API Error:', response.status, errorText);
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }
  
  return response.json();
};

// Helper para hacer peticiones POST con FormData
export const apiPostFormData = async (endpoint: string, token: string, formData: FormData) => {
  const url = `${getApiUrl()}${endpoint}`;
  const headers = getAuthHeadersFormData(token);
  
  console.log('API POST FormData:', url);
  console.log('Headers:', headers);
  
  const response = await fetch(url, {
    method: 'POST',
    headers,
    body: formData
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    console.error('API Error:', response.status, errorText);
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }
  
  return response.json();
}; 