// src/screens/LoginScreen.js
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StatusBar, Image, Alert } from 'react-native';
import { COLORS, SIZES } from '../constants/Colors';

// Renombramos el componente para que refleje que es una pantalla de opciones
export default function AuthOptionsScreen({ navigation }) {
  
  const handleLoginPress = () => {
    // Aquí navegarías a tu pantalla con el formulario de login real
    Alert.alert("Nota", "Aquí iría el formulario. Presiona 'Aceptar' para simular login.");
    // login({ email: 'admin@test.com', nombre: 'Laura' }); 
  };

  const handleRegisterPress = () => {
    // Navegar a tu pantalla de registro existente
    navigation.navigate('Register');
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      
      {/* Sección Superior: Logo y Textos */}
      <View style={styles.headerSection}>
        {/* Usamos el componente Image para cargar tu logo.png */}
        <Image 
          source={require('../../assets/logo.png')} // Ruta a tu archivo
          style={styles.logoImage}
          resizeMode="contain"
        />
        
        <Text style={styles.title}>
          Bienvenido a{'\n'}Financify
        </Text>
        
        <Text style={styles.subtitle}>
          Organiza tus ingresos,{'\n'}gastos y deudas
        </Text>
      </View>

      {/* Sección Inferior: Botones */}
      <View style={styles.buttonSection}>
        {/* Botón Iniciar Sesión (Lleno) */}
        <TouchableOpacity style={styles.loginButton} onPress={handleLoginPress}>
          <Text style={styles.loginButtonText}>Iniciar sesión</Text>
        </TouchableOpacity>

        {/* Botón Registro (Borde) */}
        <TouchableOpacity style={styles.registerButton} onPress={handleRegisterPress}>
          <Text style={styles.registerButtonText}>Registro</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingHorizontal: SIZES.padding,
    justifyContent: 'space-between', // Separa cabecera de botones
    paddingTop: 80, // Espacio superior
    paddingBottom: 60, // Espacio inferior
  },
  headerSection: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center', // Centra el contenido en su espacio
  },
  logoImage: {
    width: 130, // Un poco más pequeño que en la bienvenida
    height: 130,
  },
  title: {
    fontSize: SIZES.title,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    textAlign: 'center',
    marginVertical: 20,
    lineHeight: 34, // Mejora legibilidad del salto de línea
  },
  subtitle: {
    fontSize: SIZES.subtitle,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  buttonSection: {
    width: '100%',
    gap: 15, // Espacio entre botones
  },
  loginButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 18,
    borderRadius: SIZES.borderRadius,
    alignItems: 'center',
    width: '100%',
    // Sombra para el botón principal
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
  },
  loginButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  registerButton: {
    backgroundColor: COLORS.white,
    paddingVertical: 18,
    borderRadius: SIZES.borderRadius,
    alignItems: 'center',
    width: '100%',
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  registerButtonText: {
    color: COLORS.primary,
    fontSize: 16,
    fontWeight: 'bold',
  },
});