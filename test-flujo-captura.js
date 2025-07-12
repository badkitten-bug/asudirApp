// Test completo del flujo de captura y sincronización
// Ejecutar con: node test-flujo-captura.js

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'https://proxy-app.asudir051.com/api';

// Credenciales reales del usuario
const mockUser = {
  username: 'stevegomezdev@gmail.com',
  password: '12341234',
  mobile: true,
  token: null, // Para almacenar el token obtenido
  id: null // Para almacenar el ID del usuario
};

// Función para hacer login y obtener token y userId
async function loginAndGetTokenAndUserId() {
  console.log('🔐 Iniciando login...');
  try {
    const loginResponse = await fetch(`${API_URL}/auth/custom/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        identifier: mockUser.username,
        password: mockUser.password,
        platform: 'mobile'
      })
    });

    if (loginResponse.ok) {
      const loginData = await loginResponse.json();
      console.log('✅ Login exitoso');
      console.log('🔑 Token obtenido:', loginData.jwt ? 'Presente' : 'Faltante');
      return { token: loginData.jwt, userId: loginData.user?.id };
    } else {
      console.log('❌ Error en login:', loginResponse.status);
      const errorData = await loginResponse.text();
      console.log('📄 Detalles del error:', errorData);
      return null;
    }
  } catch (error) {
    console.log('❌ Error en login:', error.message);
    return null;
  }
}

// Simular datos de pozo
const mockPozo = {
  id: 6,
  numeropozo: "1403",
  predio: "LAS TONINAS"
};

// Simular datos de lectura
const mockLectura = {
  lecturaVolumen: '100.5',
  lecturaElectrica: '50.2',
  gasto: '25.3',
  observaciones: 'Test de lectura automática',
  photoUri: 'file://test-foto1.jpg',
  photoUriElec: 'file://test-foto2.jpg',
  anomaliasVol: ['fuga'],
  anomaliasElec: []
};

async function testFlujoCompleto() {
  console.log('🧪 INICIANDO TEST DEL FLUJO COMPLETO');
  console.log('=====================================');

  // Obtener token real
  const loginResult = await loginAndGetTokenAndUserId();
  if (!loginResult) {
    console.log('❌ No se pudo obtener token, abortando test');
    return;
  }
  const token = loginResult.token;
  const userId = loginResult.userId;

  // Actualizar mockUser con token real
  mockUser.token = token;
  mockUser.id = userId; // Asumimos ID 1 para el test

  try {
    // 1. Test de conexión al backend
    console.log('\n1️⃣ Probando conexión al backend...');
    const connectionTest = await fetch(`${API_URL}/lectura-pozos`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (connectionTest.ok) {
      console.log('✅ Conexión al backend exitosa');
    } else {
      console.log('❌ Error de conexión al backend:', connectionTest.status);
      return;
    }

    // 2. Test de creación de lectura
    console.log('\n2️⃣ Probando creación de lectura...');
    const lecturaPayload = {
      fecha: new Date().toISOString(),
      lectura_volumetrica: mockLectura.lecturaVolumen,
      gasto: mockLectura.gasto,
      lectura_electrica: mockLectura.lecturaElectrica,
      observaciones: mockLectura.observaciones,
      pozo: String(mockPozo.id), // Enviar como string
      capturador: String(userId), // Enviar como string
      estado: "pendiente"
    };

    const createResponse = await fetch(`${API_URL}/lectura-pozos`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ data: lecturaPayload })
    });

    if (createResponse.ok) {
      const lecturaData = await createResponse.json();
      console.log('✅ Lectura creada exitosamente');
      console.log('📊 ID de lectura:', lecturaData.data?.id);
      
      const lecturaId = lecturaData.data?.id;
      
      // 3. Test de subida de fotos
      console.log('\n3️⃣ Probando subida de fotos...');
      
      // Simular foto volumétrica
      const fotoVolFormData = new FormData();
      fotoVolFormData.append('files', {
        uri: mockLectura.photoUri,
        name: 'foto_volumetrico.jpg',
        type: 'image/jpeg',
      });
      fotoVolFormData.append('ref', 'api::lectura-pozo.lectura-pozo');
      fotoVolFormData.append('refId', lecturaId);
      fotoVolFormData.append('field', 'foto_volumetrico');

      const fotoVolResponse = await fetch(`${API_URL}/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: fotoVolFormData
      });

      if (fotoVolResponse.ok) {
        console.log('✅ Foto volumétrica subida exitosamente');
      } else {
        console.log('❌ Error subiendo foto volumétrica:', fotoVolResponse.status);
      }

      // Simular foto eléctrica
      const fotoElecFormData = new FormData();
      fotoElecFormData.append('files', {
        uri: mockLectura.photoUriElec,
        name: 'foto_electrico.jpg',
        type: 'image/jpeg',
      });
      fotoElecFormData.append('ref', 'api::lectura-pozo.lectura-pozo');
      fotoElecFormData.append('refId', lecturaId);
      fotoElecFormData.append('field', 'foto_electrico');

      const fotoElecResponse = await fetch(`${API_URL}/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: fotoElecFormData
      });

      if (fotoElecResponse.ok) {
        console.log('✅ Foto eléctrica subida exitosamente');
      } else {
        console.log('❌ Error subiendo foto eléctrica:', fotoElecResponse.status);
      }

      // 4. Verificar lectura completa
      console.log('\n4️⃣ Verificando lectura completa...');
      const verifyResponse = await fetch(`${API_URL}/lectura-pozos/${lecturaId}?populate=*`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (verifyResponse.ok) {
        const lecturaCompleta = await verifyResponse.json();
        console.log('✅ Lectura verificada en el backend');
        console.log('📊 Datos de la lectura:');
        console.log('   - Volumen:', lecturaCompleta.data?.attributes?.lectura_volumetrica);
        console.log('   - Eléctrica:', lecturaCompleta.data?.attributes?.lectura_electrica);
        console.log('   - Gasto:', lecturaCompleta.data?.attributes?.gasto);
        console.log('   - Fotos:', {
          volumétrica: !!lecturaCompleta.data?.attributes?.foto_volumetrico?.data,
          eléctrica: !!lecturaCompleta.data?.attributes?.foto_electrico?.data
        });
      } else {
        console.log('❌ Error verificando lectura:', verifyResponse.status);
      }

    } else {
      console.log('❌ Error creando lectura:', createResponse.status);
      const errorData = await createResponse.json();
      console.log('📄 Detalles del error:', errorData);
    }

  } catch (error) {
    console.log('❌ Error en el test:', error.message);
  }

  console.log('\n🏁 TEST COMPLETADO');
  console.log('=====================================');
}

// Test del hook de sincronización
async function testSincronizacion() {
  console.log('\n🔄 TEST DE SINCRONIZACIÓN');
  console.log('==========================');

  // Obtener token real
  const loginResult = await loginAndGetTokenAndUserId();
  if (!loginResult) {
    console.log('❌ No se pudo obtener token, abortando test de sincronización');
    return;
  }
  const token = loginResult.token;
  const userId = loginResult.userId;

  // Simular datos pendientes
  const mockPendingTicket = {
    id: Date.now().toString(),
    pozoId: mockPozo.id,
    pozoNombre: mockPozo.numeropozo,
    pozoUbicacion: mockPozo.predio,
    lecturaVolumen: mockLectura.lecturaVolumen,
    lecturaElectrica: mockLectura.lecturaElectrica,
    gastoPozo: mockLectura.gasto,
    observaciones: mockLectura.observaciones,
    fecha: new Date().toISOString().split('T')[0],
    hora: new Date().toLocaleTimeString(),
    estado: 'pendiente',
    photoVolumenUri: mockLectura.photoUri,
    photoElectricaUri: mockLectura.photoUriElec,
    token: token,
    capturadorId: userId
  };

  console.log('📋 Ticket pendiente simulado:', mockPendingTicket.id);
  console.log('🔗 URL del backend:', API_URL);
  console.log('👤 Token de usuario:', token ? 'Presente' : 'Faltante');

  // Simular proceso de sincronización
  try {
    console.log('\n🔄 Iniciando sincronización...');
    
    // Crear lectura
    const lecturaPayload = {
      fecha: mockPendingTicket.fecha,
      lectura_volumetrica: String(mockPendingTicket.lecturaVolumen),
      gasto: String(mockPendingTicket.gastoPozo),
      lectura_electrica: String(mockPendingTicket.lecturaElectrica),
      observaciones: mockPendingTicket.observaciones,
      pozo: mockPendingTicket.pozoId,
      capturador: userId,
      estado: "pendiente"
    };

    const createRes = await fetch(`${API_URL}/lectura-pozos`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ data: lecturaPayload }),
    });

    if (createRes.ok) {
      const lecturaData = await createRes.json();
      const lecturaId = lecturaData.data?.id;
      console.log('✅ Lectura creada en sincronización:', lecturaId);

      // Subir fotos
      const fotos = [];
      if (mockPendingTicket.photoVolumenUri) {
        fotos.push({ field: 'foto_volumetrico', file: mockPendingTicket.photoVolumenUri });
      }
      if (mockPendingTicket.photoElectricaUri) {
        fotos.push({ field: 'foto_electrico', file: mockPendingTicket.photoElectricaUri });
      }

      for (const foto of fotos) {
        const formData = new FormData();
        formData.append('files', {
          uri: foto.file,
          name: `${foto.field}.jpg`,
          type: 'image/jpeg',
        });
        formData.append('ref', 'api::lectura-pozo.lectura-pozo');
        formData.append('refId', String(lecturaId));
        formData.append('field', foto.field);
        
        const resFoto = await fetch(`${API_URL}/upload`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` },
          body: formData,
        });
        
        if (resFoto.ok) {
          console.log(`✅ ${foto.field} subida exitosamente`);
        } else {
          console.log(`❌ Error subiendo ${foto.field}:`, resFoto.status);
        }
      }

      console.log('✅ Sincronización completada');
    } else {
      console.log('❌ Error en sincronización:', createRes.status);
      const errorData = await createRes.text();
      console.log('📄 Detalles del error:', errorData);
    }

  } catch (error) {
    console.log('❌ Error en sincronización:', error.message);
  }
}

// Ejecutar tests
async function runTests() {
  await testFlujoCompleto();
  await testSincronizacion();
}

// Ejecutar si se llama directamente
if (require.main === module) {
  runTests().catch(console.error);
}

module.exports = { testFlujoCompleto, testSincronizacion };
