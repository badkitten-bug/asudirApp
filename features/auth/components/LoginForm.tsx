import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { authStyles } from '../styles/auth.styles';
import { LoginCredentials } from '../hooks/useAuth';

interface LoginFormProps {
  onSubmit: (credentials: LoginCredentials) => void;
  isLoading: boolean;
}

export const LoginForm: React.FC<LoginFormProps> = ({
  onSubmit,
  isLoading,
}) => {
  const [credentials, setCredentials] = useState<LoginCredentials>({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  const handleSubmit = () => {
    // Validación básica
    const newErrors: string[] = [];
    
    if (!credentials.email.trim()) {
      newErrors.push('El email es requerido');
    } else if (!/\S+@\S+\.\S+/.test(credentials.email)) {
      newErrors.push('El email no es válido');
    }

    if (!credentials.password.trim()) {
      newErrors.push('La contraseña es requerida');
    }

    setErrors(newErrors);

    if (newErrors.length === 0) {
      onSubmit(credentials);
    }
  };

  const handleInputChange = (field: keyof LoginCredentials, value: string) => {
    setCredentials(prev => ({ ...prev, [field]: value }));
    // Limpiar errores cuando el usuario empiece a escribir
    if (errors.length > 0) {
      setErrors([]);
    }
  };

  return (
    <View style={authStyles.formContainer}>
      {/* Logo o título */}
      <View style={authStyles.logoContainer}>
        <Ionicons name="water" size={64} color="#00A86B" />
        <Text style={authStyles.appTitle}>ASUDIR</Text>
        <Text style={authStyles.appSubtitle}>Sistema de Lecturas</Text>
      </View>

      {/* Formulario */}
      <View style={authStyles.form}>
        {/* Campo Email */}
        <View style={authStyles.inputContainer}>
          <Ionicons name="mail-outline" size={20} color="#666" style={authStyles.inputIcon} />
          <TextInput
            style={authStyles.input}
            placeholder="Email"
            value={credentials.email}
            onChangeText={(value) => handleInputChange('email', value)}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            editable={!isLoading}
          />
        </View>

        {/* Campo Contraseña */}
        <View style={authStyles.inputContainer}>
          <Ionicons name="lock-closed-outline" size={20} color="#666" style={authStyles.inputIcon} />
          <TextInput
            style={authStyles.input}
            placeholder="Contraseña"
            value={credentials.password}
            onChangeText={(value) => handleInputChange('password', value)}
            secureTextEntry={!showPassword}
            autoCapitalize="none"
            autoCorrect={false}
            editable={!isLoading}
          />
          <TouchableOpacity
            onPress={() => setShowPassword(!showPassword)}
            style={authStyles.passwordToggle}
          >
            <Ionicons
              name={showPassword ? "eye-off-outline" : "eye-outline"}
              size={20}
              color="#666"
            />
          </TouchableOpacity>
        </View>

        {/* Errores */}
        {errors.length > 0 && (
          <View style={authStyles.errorsContainer}>
            {errors.map((error, index) => (
              <Text key={index} style={authStyles.errorText}>
                • {error}
              </Text>
            ))}
          </View>
        )}

        {/* Botón de login */}
        <TouchableOpacity
          style={[authStyles.loginButton, isLoading && authStyles.loginButtonDisabled]}
          onPress={handleSubmit}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <>
              <Ionicons name="log-in-outline" size={20} color="#fff" />
              <Text style={authStyles.loginButtonText}>Iniciar Sesión</Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      {/* Información adicional */}
      <View style={authStyles.footer}>
        <Text style={authStyles.footerText}>
          Sistema de captura de lecturas de pozos
        </Text>
        <Text style={authStyles.footerSubtext}>
          Asociación de Usuarios del Distrito de Riego
        </Text>
      </View>
    </View>
  );
}; 