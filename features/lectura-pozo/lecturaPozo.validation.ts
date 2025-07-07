import { showSnackbar } from '../../store/snackbarSlice';

// Tipos para las validaciones
interface FormData {
  photoUri: string | null;
  photoUriElec: string | null;
  lecturaVolumen: string;
  lecturaElectrica: string;
}

interface ValidationResult {
  isValid: boolean;
  message?: string;
}

// Validación de fotos obligatorias
export function validatePhotos(form: FormData, dispatch: any): ValidationResult {
  if (!form.photoUri) {
    dispatch(showSnackbar({
      message: "Es obligatorio tomar foto del medidor volumétrico",
      type: "warning",
      duration: 3000,
    }));
    return { isValid: false, message: "Foto volumétrica requerida" };
  }
  
  if (!form.photoUriElec) {
    dispatch(showSnackbar({
      message: "Es obligatorio tomar foto del medidor eléctrico",
      type: "warning",
      duration: 3000,
    }));
    return { isValid: false, message: "Foto eléctrica requerida" };
  }
  
  return { isValid: true };
}

// Validación de lectura volumétrica
export function validateLecturaVolumen(lecturaVolumen: string, dispatch: any): ValidationResult {
  if (!lecturaVolumen.trim() || parseInt(lecturaVolumen) === 0) {
    dispatch(showSnackbar({
      message: "Por favor ingresa la lectura volumétrica",
      type: "warning",
      duration: 3000,
    }));
    return { isValid: false, message: "Lectura volumétrica requerida" };
  }
  
  return { isValid: true };
}

// Validación de lectura eléctrica
export function validateLecturaElectrica(lecturaElectrica: string, dispatch: any): ValidationResult {
  if (!lecturaElectrica.trim() || parseInt(lecturaElectrica) === 0) {
    dispatch(showSnackbar({
      message: "Por favor ingresa la lectura eléctrica",
      type: "warning",
      duration: 3000,
    }));
    return { isValid: false, message: "Lectura eléctrica requerida" };
  }
  
  return { isValid: true };
}

// Validación completa del formulario
export function validateForm(form: FormData, dispatch: any): ValidationResult {
  const photosValidation = validatePhotos(form, dispatch);
  if (!photosValidation.isValid) return photosValidation;
  
  const volumenValidation = validateLecturaVolumen(form.lecturaVolumen, dispatch);
  if (!volumenValidation.isValid) return volumenValidation;
  
  const electricaValidation = validateLecturaElectrica(form.lecturaElectrica, dispatch);
  if (!electricaValidation.isValid) return electricaValidation;
  
  return { isValid: true };
}

// Helper para generar ID de ticket
export function generateTicketId(): string {
  return `TICKET-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

// Helper para validar autenticación
export function validateAuth(user: any, dispatch: any): ValidationResult {
  if (!user || !user.token) {
    dispatch(showSnackbar({ 
      message: 'No autenticado', 
      type: 'error', 
      duration: 3000 
    }));
    return { isValid: false, message: "Usuario no autenticado" };
  }
  
  return { isValid: true };
}

// Helper para validar información del pozo
export function validatePozoInfo(pozoInfo: any, dispatch: any): ValidationResult {
  if (!pozoInfo || !pozoInfo.id || !pozoInfo.usuario_pozos?.[0]?.id) {
    dispatch(showSnackbar({ 
      message: 'No se pudo obtener pozo o usuario_pozos', 
      type: 'error', 
      duration: 3000 
    }));
    return { isValid: false, message: "Información del pozo incompleta" };
  }
  
  return { isValid: true };
} 