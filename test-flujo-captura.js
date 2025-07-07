console.log('🧪 PRUEBA COMPLETA DEL FLUJO');

const fetch = require('node-fetch');
const fs = require('fs');
const FormData = require('form-data');

const API_URL = 'http://localhost:3000/api'; // Cambia si tu API está en otro puerto
let TOKEN = 'TU_TOKEN_AQUI'; // Se actualizará automáticamente con login

// Función para hacer login y obtener token automáticamente
async function obtenerToken() {
  console.log('🔐 Obteniendo token de autenticación...');
  const loginData = {
    identifier: 'steve@gmail.com',
    password: '12341234',
    platform: 'mobile'
  };
  
  const res = await fetch(`${API_URL}/auth/custom/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(loginData)
  });
  
  const json = await res.json();
  if (!res.ok) {
    console.error('❌ Error en login:', json);
    console.log('💡 Verifica las credenciales');
    process.exit(1);
  }
  
  TOKEN = json.jwt;
  console.log('✅ Token obtenido:', TOKEN.substring(0, 50) + '...');
  console.log('👤 Usuario:', json.user.username, `(${json.user.id})`);
  return TOKEN;
}

async function crearLectura() {
  const data = {
    fecha: new Date().toISOString(),
    lectura_volumetrica: '1234',
    gasto: '100',
    lectura_electrica: '567',
    observaciones: 'Test desde script',
    pozo: '35', // ID real de pozo
    capturador: '7', // ID del usuario steve@gmail.com (capturador)
    estado: 'pendiente'
  };
  const res = await fetch(`${API_URL}/lectura-pozos`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${TOKEN}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ data })
  });
  const json = await res.json();
  if (!res.ok) throw new Error(JSON.stringify(json));
  return json.data.id;
}

async function subirFoto({ lecturaId, field, filePath, filename }) {
  console.log(`📤 Subiendo foto para campo: ${field}`);
  const form = new FormData();
  form.append('files', fs.createReadStream(filePath), filename);
  form.append('ref', 'api::lectura-pozo.lectura-pozo');
  form.append('refId', String(lecturaId));
  form.append('field', field);
  
  console.log(`  📋 FormData: ref=api::lectura-pozo.lectura-pozo, refId=${lecturaId}, field=${field}`);
  
  const res = await fetch(`${API_URL}/upload`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${TOKEN}`
    },
    body: form
  });
  const json = await res.json();
  
  if (!res.ok) {
    console.error(`❌ Error subiendo foto ${field}:`, json);
    throw new Error(JSON.stringify(json));
  }
  
  console.log(`✅ Foto ${field} subida exitosamente:`, {
    archivosSubidos: json.length,
    primerArchivo: json[0]?.id
  });
  return json;
}

async function obtenerLectura(id) {
  console.log(`🔍 Consultando lectura ID: ${id}`);
  
  // Probar diferentes endpoints
  const endpoints = [
    `${API_URL}/lectura-pozos/${id}?populate[foto_volumetrico]=true&populate[foto_electrico]=true`,
    `${API_URL}/lectura-pozos/${id}`,
    `${API_URL}/lectura-pozos?filters[id][$eq]=${id}&populate[foto_volumetrico]=true&populate[foto_electrico]=true`,
    `${API_URL}/lectura-pozos?filters[id][$eq]=${id}`,
    `${API_URL}/lectura-pozos?filters[id][$eq]=${id}&populate=*`
  ];
  
  for (let i = 0; i < endpoints.length; i++) {
    try {
      console.log(`  🔍 Intentando endpoint ${i + 1}: ${endpoints[i]}`);
      const res = await fetch(endpoints[i], {
        headers: { 'Authorization': `Bearer ${TOKEN}` }
      });
      const json = await res.json();
      
      if (res.ok) {
        console.log('✅ Endpoint exitoso:', endpoints[i]);
        
        // Si es el endpoint con filters, devuelve un array
        if (endpoints[i].includes('filters')) {
          console.log('📋 Lectura encontrada (filters):', json.data?.[0]?.attributes?.fecha);
          console.log('🔍 Estructura completa de la respuesta (filters):', JSON.stringify(json, null, 2));
          return json.data?.[0]; // Retorna el primer elemento del array
        } else {
          console.log('📋 Lectura encontrada:', json.data?.attributes?.fecha);
          return json.data;
        }
      } else {
        console.log(`❌ Endpoint ${i + 1} falló:`, json.error?.message);
      }
    } catch (err) {
      console.log(`❌ Error en endpoint ${i + 1}:`, err.message);
    }
  }
  
  throw new Error('No se pudo consultar la lectura con ningún endpoint');
}

(async () => {
  try {
    // Obtener token automáticamente
    await obtenerToken();
    
    console.log('1. Creando lectura...');
    const lecturaId = await crearLectura();
    console.log('Lectura creada con ID:', lecturaId);

    console.log('2. Subiendo foto volumétrica...');
    await subirFoto({
      lecturaId,
      field: 'foto_volumetrico',
      filePath: './test-foto1.jpg',
      filename: 'foto_volumetrico.jpg'
    });
    console.log('Foto volumétrica subida.');

    console.log('3. Subiendo foto eléctrica...');
    await subirFoto({
      lecturaId,
      field: 'foto_electrico',
      filePath: './test-foto2.jpg',
      filename: 'foto_electrico.jpg'
    });
    console.log('Foto eléctrica subida.');
    
    // Probar con nombres alternativos de campos
    console.log('4. Probando nombres alternativos de campos...');
    const camposAlternativos = ['foto_volumetrica', 'foto_electrica', 'imagen_volumetrico', 'imagen_electrico'];
    
    for (const campo of camposAlternativos) {
      try {
        console.log(`  🔄 Probando campo: ${campo}`);
        await subirFoto({
          lecturaId,
          field: campo,
          filePath: './test-foto1.jpg',
          filename: `${campo}.jpg`
        });
        console.log(`  ✅ Campo ${campo} funcionó`);
      } catch (err) {
        console.log(`  ❌ Campo ${campo} falló:`, err.message);
      }
    }

    console.log('5. Verificando asociación de imágenes...');
    const lectura = await obtenerLectura(lecturaId);
    
    // Verificar estructura de respuesta completa
    console.log('📊 Estructura completa de la lectura:');
    console.log('  - ID:', lectura.id);
    console.log('  - Fecha:', lectura.fecha);
    console.log('  - Foto volumétrica:', !!lectura.foto_volumetrico);
    console.log('  - Foto eléctrica:', !!lectura.foto_electrico);
    
    // Mostrar todos los campos disponibles
    console.log('🔍 Todos los campos disponibles:');
    Object.keys(lectura).forEach(key => {
      if (key !== 'foto_volumetrico' && key !== 'foto_electrico') {
        console.log(`  - ${key}:`, typeof lectura[key], lectura[key]);
      }
    });
    
    // Verificar estructura de respuesta
    console.log('📊 Resumen de asociación:', {
      tieneFotoVol: !!lectura.foto_volumetrico,
      tieneFotoElec: !!lectura.foto_electrico,
      fotoVolId: lectura.foto_volumetrico?.id,
      fotoElecId: lectura.foto_electrico?.id
    });
    
    const tieneVol = !!lectura.foto_volumetrico;
    const tieneElec = !!lectura.foto_electrico;
    
    console.log('📸 ¿Foto volumétrica asociada?', tieneVol);
    console.log('⚡ ¿Foto eléctrica asociada?', tieneElec);
    
    if (tieneVol && tieneElec) {
      console.log('✅ TEST PASÓ: Ambas fotos asociadas correctamente.');
      console.log('🎉 El flujo completo funciona perfectamente!');
    } else {
      console.log('❌ TEST FALLÓ: Falta alguna foto asociada.');
      console.log('🔍 Revisando detalles...');
      if (!tieneVol) console.log('   - Foto volumétrica no encontrada');
      if (!tieneElec) console.log('   - Foto eléctrica no encontrada');
      
      // Sugerir posibles soluciones
      console.log('💡 Posibles causas:');
      console.log('   1. Nombres de campos incorrectos en Strapi');
      console.log('   2. Permisos insuficientes para asociar archivos');
      console.log('   3. Configuración incorrecta del modelo lectura-pozo');
    }
  } catch (err) {
    console.error('Error en test:', err);
  }
})();
