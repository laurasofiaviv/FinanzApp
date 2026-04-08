import React from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  Image, ScrollView, StatusBar
} from 'react-native';
import { COLORS, SIZES } from '../constants/Colors';

export default function EmailSentScreen({ route, navigation }) {
  const { email } = route.params;

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
    >
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />

      {/* Logo + nombre app — idéntico a todas las pantallas */}
      <View style={styles.topSection}>
        <Image
          source={require('../../assets/logo.png')}
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={styles.appName}>FinanzApp</Text>
      </View>

      {/* Ícono de éxito — igual que RegisterSuccess */}
      <View style={styles.successIconWrapper}>
        <Image
          source={require('../../assets/successfull.png')}
          style={styles.successIcon}
          resizeMode="contain"
        />
      </View>

      {/* Título */}
      <Text style={styles.title}>¡Revisa tu correo!</Text>

      {/* Descripción */}
      <Text style={styles.subtitle}>
        Enviamos un enlace de verificación a:
      </Text>
      <Text style={styles.email}>{email}</Text>
      <Text style={styles.note}>
        Una vez que verifiques tu correo, podrás iniciar sesión.{'\n'}
        Revisa también tu carpeta de spam.
      </Text>

      {/* Botón principal */}
      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('AuthOptions')}
      >
        <Text style={styles.buttonText}>Ir a iniciar sesión</Text>
      </TouchableOpacity>

      {/* Link reenviar — subrayado, igual que "Regresar al Login" */}
      <TouchableOpacity style={styles.resendLink}>
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

  // ── Top section — idéntico a todas las pantallas ────────────────────────
  topSection: {
    alignItems: 'center',
    marginBottom: 20,
  },
  logo: {
    width: 70,
    height: 70,
    marginBottom: 8,
  },
  appName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: 6,
  },

  // ── Success icon — mismo estilo que RegisterSuccess ─────────────────────
  successIconWrapper: {
    alignItems: 'center',
    marginBottom: 20,
  },
  successIcon: {
    width: 100,
    height: 100,
  },

  // ── Textos ──────────────────────────────────────────────────────────────
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 15,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  email: {
    fontSize: 15,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginVertical: 8,
    textAlign: 'center',
  },
  note: {
    fontSize: 13,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 40,
    paddingHorizontal: 10,
  },

  // ── Botón — idéntico a todas las pantallas ──────────────────────────────
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
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },

  // ── Link reenviar — subrayado, igual que "Regresar al Login" ───────────
  resendLink: {
    alignItems: 'center',
  },
  resendText: {
    fontSize: 14,
    color: COLORS.textPrimary,
    fontWeight: 'bold',
    textDecorationLine: 'underline',
  },
});
