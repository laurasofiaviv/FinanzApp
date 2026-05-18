// screens/EmailSentScreen.js
import React, { useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  Image, ScrollView, StatusBar, Alert
} from 'react-native';
import { getAuth, sendEmailVerification, signOut } from 'firebase/auth';
import { COLORS, SIZES } from '../constants/Colors';

export default function EmailSentScreen({ route, navigation }) {
  const { email } = route.params;
  const intervalRef = useRef(null);

  // ── Polling: revisa cada 3s si el usuario ya verificó su correo ──────────
  useEffect(() => {
    const auth = getAuth();

    intervalRef.current = setInterval(async () => {
      try {
        const user = auth.currentUser;
        if (!user) return;

        // Fuerza a Firebase a recargar el estado del usuario desde el servidor
        await user.reload();

        if (user.emailVerified) {
          clearInterval(intervalRef.current);
          // onAuthStateChanged se dispara automáticamente →
          // AppNavigator detecta emailVerified=true → muestra MainStack
        }
      } catch (e) {
        console.error('Error recargando usuario:', e.message);
      }
    }, 3000);

    return () => clearInterval(intervalRef.current);
  }, []);

  // ── Reenviar correo ───────────────────────────────────────────────────────
  const handleReenviar = async () => {
    try {
      const user = getAuth().currentUser;
      if (user) {
        await sendEmailVerification(user);
        Alert.alert('Correo reenviado', 'Revisa tu bandeja de entrada');
      }
    } catch (error) {
      Alert.alert('Error', 'No se pudo reenviar el correo. Espera un momento e intenta de nuevo.');
    }
  };

  // ── Ir a login manualmente ────────────────────────────────────────────────
  const handleIrALogin = async () => {
    try {
      await signOut(getAuth());
      // AppNavigator detecta usuario=null → muestra AuthStack → initialRoute="Welcome"
      // No necesitas navigation.navigate() para nada
    } catch (e) {
      console.error('Error al cerrar sesión:', e.message);
    }
  };

  const handleRegisterPress = () => {
    navigation.navigate('Register');
  };

  return (
      <ScrollView
          contentContainerStyle={styles.container}
          showsVerticalScrollIndicator={false}
      >
        <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />

        <View style={styles.topSection}>
          <Image
              source={require('../../assets/logo.png')}
              style={styles.logo}
              resizeMode="contain"
          />
          <Text style={styles.appName}>FinanzApp</Text>
        </View>

        <View style={styles.successIconWrapper}>
          <Image
              source={require('../../assets/successfull.png')}
              style={styles.successIcon}
              resizeMode="contain"
          />
        </View>

        <Text style={styles.title}>¡Revisa tu correo!</Text>

        <Text style={styles.subtitle}>Enviamos un enlace de verificación a:</Text>
        <Text style={styles.email}>{email}</Text>
        <Text style={styles.note}>
          Una vez que verifiques tu correo, entrarás automáticamente.{'\n'}
          Revisa también tu carpeta de spam.
        </Text>

        <TouchableOpacity style={styles.button} onPress={handleIrALogin}>
          <Text style={styles.buttonText}>Ir a iniciar sesión</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.resendLink} onPress={handleReenviar}>
          <Text style={styles.resendText}>¿No recibiste el correo? Reenviar</Text>
        </TouchableOpacity>
      </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: COLORS.background,
    paddingHorizontal: SIZES.padding,
    paddingTop: 60,
    paddingBottom: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  topSection:        { alignItems: 'center', marginBottom: 20 },
  logo:              { width: 70, height: 70, marginBottom: 8 },
  appName:           { fontSize: 20, fontWeight: 'bold', color: COLORS.textPrimary, marginBottom: 6 },
  successIconWrapper:{ alignItems: 'center', marginBottom: 20 },
  successIcon:       { width: 100, height: 100 },
  title:             { fontSize: 24, fontWeight: 'bold', color: COLORS.textPrimary, textAlign: 'center', marginBottom: 12 },
  subtitle:          { fontSize: 15, color: COLORS.textSecondary, textAlign: 'center' },
  email:             { fontSize: 15, fontWeight: 'bold', color: COLORS.primary, marginVertical: 8, textAlign: 'center' },
  note:              { fontSize: 13, color: COLORS.textSecondary, textAlign: 'center', lineHeight: 20, marginBottom: 40, paddingHorizontal: 10 },
  button: {
    backgroundColor: COLORS.primary,
    paddingVertical: 16,
    borderRadius: SIZES.borderRadius,
    alignItems: 'center',
    width: '100%',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
    marginBottom: 20,
  },
  buttonText:  { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  resendLink:  { alignItems: 'center' },
  resendText:  { fontSize: 14, color: COLORS.textPrimary, fontWeight: 'bold', textDecorationLine: 'underline' },
});