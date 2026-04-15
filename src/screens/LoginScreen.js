//LoginScreen.js
import React from 'react';  // ← quita useContext
import { View, Text, StyleSheet, TouchableOpacity, StatusBar, Image } from 'react-native';
import { COLORS, SIZES } from '../constants/Colors';
// ← quita la importación de AuthContext

export default function AuthOptionsScreen({ navigation }) {
  // ← quita el useContext y el login

  const handleLoginPress = () => {
    navigation.navigate('LoginForm'); 
  };

  const handleRegisterPress = () => {
    navigation.navigate('Register');
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />

      <View style={styles.headerSection}>
        <Image
          source={require('../../assets/logo.png')}
          style={styles.logoImage}
          resizeMode="contain"
        />
        <Text style={styles.title}>Bienvenido a{'\n'}FinanzApp</Text>
        <Text style={styles.subtitle}>Organiza tus ingresos,{'\n'}gastos y deudas</Text>
      </View>

      <View style={styles.buttonSection}>
        <TouchableOpacity style={styles.loginButton} onPress={handleLoginPress}>
          <Text style={styles.loginButtonText}>Iniciar sesión</Text>
        </TouchableOpacity>

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
    justifyContent: 'space-between',
    paddingTop: 80,
    paddingBottom: 60,
  },
  headerSection: { alignItems: 'center', flex: 1, justifyContent: 'center' },
  logoImage: { width: 130, height: 130 },
  title: {
    fontSize: SIZES.title,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    textAlign: 'center',
    marginVertical: 20,
    lineHeight: 34,
  },
  subtitle: {
    fontSize: SIZES.subtitle,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  buttonSection: { width: '100%', gap: 15 },
  loginButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 18,
    borderRadius: SIZES.borderRadius,
    alignItems: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
  },
  loginButtonText: { color: COLORS.white, fontSize: 16, fontWeight: 'bold' },
  registerButton: {
    backgroundColor: COLORS.white,
    paddingVertical: 18,
    borderRadius: SIZES.borderRadius,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  registerButtonText: { color: COLORS.primary, fontSize: 16, fontWeight: 'bold' },
});