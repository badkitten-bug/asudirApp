import { createSlice, type PayloadAction, createAsyncThunk } from "@reduxjs/toolkit"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { getApiUrl, getAuthHeaders } from '@/src/config/api'

// Modificar la interfaz User para incluir la contraseña (para validación local)
interface User {
  id: string
  email: string
  name: string
  token: string
  password?: string // Añadido para validación local
}

// Añadir una interfaz para los usuarios disponibles
interface AvailableUser {
  email: string
  password: string
  id: string
  name: string
}

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  availableUsers: AvailableUser[] // Lista de usuarios disponibles para login
  lastSyncDate: string | null
}

// Modificar el usuario inicial en initialState
const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
  availableUsers: [
    {
      id: "1",
      email: "pozos@asudir.com",
      password: "123456",
      name: "Usuario ASUDIR",
    },
  ],
  lastSyncDate: null,
}

// Clave para almacenar los datos de usuario en AsyncStorage
const USER_STORAGE_KEY = "@auth_user"
const AVAILABLE_USERS_KEY = "@auth_available_users"
const AUTH_SYNC_DATE_KEY = "@auth_sync_date"

// Thunk para cargar el usuario desde AsyncStorage
export const loadUser = createAsyncThunk(
  'auth/loadUser',
  async (_, { getState }) => {
    const state = getState() as any;
    const token = state.auth.token;
    
    if (!token) {
      throw new Error('No hay token disponible');
    }

    try {
      const url = `${getApiUrl()}/users/me`;
      const headers = getAuthHeaders(token);
      
      console.log('URL de loadUser:', url);
      console.log('Headers de loadUser:', headers);
      
      const res = await fetch(url, { headers });
      
      if (!res.ok) {
        const errorText = await res.text();
        console.error('Error response loadUser:', errorText);
        throw new Error('Token inválido');
      }
      
      const user = await res.json();
      console.log('LoadUser response:', user);
      
      return user;
    } catch (error) {
      console.error('Error al cargar usuario:', error);
      throw error;
    }
  }
);

// Thunk para guardar el usuario en AsyncStorage
export const saveUser = createAsyncThunk("auth/saveUser", async (user: User) => {
  try {
    await AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user))
    console.log("Usuario guardado en AsyncStorage:", user)
    return user
  } catch (error) {
    console.error("Error saving user to storage:", error)
    throw error
  }
})

// Thunk para eliminar el usuario de AsyncStorage
export const removeUser = createAsyncThunk("auth/removeUser", async () => {
  try {
    await AsyncStorage.removeItem(USER_STORAGE_KEY)
    console.log("Usuario eliminado de AsyncStorage")
    return null
  } catch (error) {
    console.error("Error removing user from storage:", error)
    throw error
  }
})

// Modificar la función syncUsers para reemplazar completamente los usuarios
export const syncUsers = createAsyncThunk("auth/syncUsers", async (_, { getState }) => {
  try {
    // Simulamos una demora de red
    await new Promise((resolve) => setTimeout(resolve, 1500))

    // Simulamos que el servidor nos devuelve nuevos usuarios (reemplazando los iniciales)
    const newUsers: AvailableUser[] = [
      {
        id: "2",
        email: "admin@asudir.com",
        password: "admin123",
        name: "Administrador",
      },
      {
        id: "3",
        email: "tecnico@asudir.com",
        password: "tecnico123",
        name: "Técnico de Campo",
      },
      {
        id: "4",
        email: "supervisor@asudir.com",
        password: "super123",
        name: "Supervisor",
      },
    ]

    // Guardamos la fecha de sincronización
    const syncDate = new Date().toISOString()
    await AsyncStorage.setItem(AUTH_SYNC_DATE_KEY, syncDate)

    // Guardamos los nuevos usuarios (reemplazando los anteriores)
    await AsyncStorage.setItem(AVAILABLE_USERS_KEY, JSON.stringify(newUsers))

    return { availableUsers: newUsers, syncDate }
  } catch (error) {
    console.error("Error syncing users:", error)
    throw error
  }
})

// Thunk para validar credenciales
export const validateCredentials = createAsyncThunk(
  "auth/validateCredentials",
  async ({ email, password }: { email: string; password: string }, { getState, dispatch }) => {
    try {
      const state = getState() as { auth: AuthState }
      const availableUsers = state.auth.availableUsers

      console.log("Validando credenciales:", email, password)
      
      // Usar la variable de entorno para la URL del backend
      const API_URL = process.env.EXPO_PUBLIC_API_URL
      console.log('--- INTENTANDO CONECTAR A ESTA URL:', API_URL, '---'); // DEBUG
      
      if (!API_URL) {
        throw new Error('La URL del backend no está configurada');
      }
      
      // Llamar a la API de autenticación con plataforma mobile
      const response = await fetch(`${API_URL}/auth/custom/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          identifier: email,
          password: password,
          platform: 'mobile'
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error en la autenticación');
      }

      const data = await response.json();

      // Si la autenticación es exitosa, crear el objeto de usuario
      const userData: User = {
        id: data.user.id,
        email: data.user.email,
        name: data.user.username,
        token: data.jwt,
      }

      // Guardar el usuario en AsyncStorage
      await dispatch(saveUser(userData)).unwrap()

      return userData
    } catch (error) {
      console.error("Error validating credentials:", error)
      throw error
    }
  },
)

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    login: (state, action: PayloadAction<User>) => {
      state.user = action.payload
      state.isAuthenticated = true
      state.isLoading = false
      // Guardar en AsyncStorage
      AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(action.payload)).catch((error) =>
        console.error("Error saving user to storage:", error),
      )
    },
    logout: (state) => {
      state.user = null
      state.isAuthenticated = false
      // Eliminar de AsyncStorage
      AsyncStorage.removeItem(USER_STORAGE_KEY).catch((error) =>
        console.error("Error removing user from storage:", error),
      )
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload
    },
    setAvailableUsers: (state, action: PayloadAction<AvailableUser[]>) => {
      state.availableUsers = action.payload
      // Guardar en AsyncStorage
      AsyncStorage.setItem(AVAILABLE_USERS_KEY, JSON.stringify(action.payload)).catch((error) =>
        console.error("Error saving available users to storage:", error),
      )
    },
  },
  extraReducers: (builder) => {
    builder
      // loadUser
      .addCase(loadUser.pending, (state) => {
        state.isLoading = true
      })
      .addCase(loadUser.fulfilled, (state, action) => {
        if (action.payload.user) {
          state.user = action.payload.user
          state.isAuthenticated = true
        } else {
          state.user = null
          state.isAuthenticated = false
        }
        state.availableUsers = action.payload.availableUsers
        state.lastSyncDate = action.payload.syncDate
        state.isLoading = false
      })
      .addCase(loadUser.rejected, (state) => {
        state.user = null
        state.isAuthenticated = false
        state.isLoading = false
      })

      // saveUser
      .addCase(saveUser.fulfilled, (state, action) => {
        state.user = action.payload
        state.isAuthenticated = true
      })

      // removeUser
      .addCase(removeUser.fulfilled, (state) => {
        state.user = null
        state.isAuthenticated = false
      })

      // syncUsers
      .addCase(syncUsers.fulfilled, (state, action) => {
        state.availableUsers = action.payload.availableUsers
        state.lastSyncDate = action.payload.syncDate
      })

      // validateCredentials
      .addCase(validateCredentials.fulfilled, (state, action) => {
        state.user = action.payload
        state.isAuthenticated = true
      })
  },
})

export const { login, logout, setLoading, setAvailableUsers } = authSlice.actions
export default authSlice.reducer

// Selectores
export const selectUser = (state: { auth: AuthState }) => state.auth.user
export const selectIsAuthenticated = (state: { auth: AuthState }) => state.auth.isAuthenticated
export const selectIsLoading = (state: { auth: AuthState }) => state.auth.isLoading
export const selectAvailableUsers = (state: { auth: AuthState }) => state.auth.availableUsers
export const selectAuthLastSyncDate = (state: { auth: AuthState }) => state.auth.lastSyncDate

