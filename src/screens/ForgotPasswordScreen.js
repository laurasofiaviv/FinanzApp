import React from 'react';
import {
  View, Text, TextInput, StyleSheet, TouchableOpacity,
  ActivityIndicator, Image, ScrollView, StatusBar
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { COLORS, SIZES } from '../constants/Colors';
import { useForgotPassword } from '../hooks/useForgotPassword';

export default function ForgotPasswordScreen({ navigation }) {
  const { email, handleEmailChange, loading, sent, error, handleSend } = useForgotPassword();

  // ── Pantalla de confirmación ────────────────────────────────────────────
  if (sent) {
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

          <Text style={styles.successTitle}>¡Correo Enviado!</Text>

          <Text style={styles.subtitle}>
            Si{' '}
            <Text style={{ fontWeight: 'bold', color: COLORS.textPrimary }}>
              {email}
            </Text>{' '}
            está registrado, recibirás un enlace para restablecer tu contraseña.{'\n'}
            El enlace expira en{' '}
            <Text style={{ fontWeight: 'bold', color: COLORS.textPrimary }}>
              15 minutos
            </Text>.
          </Text>

          <TouchableOpacity
              style={styles.button}
              onPress={() => navigation.navigate('LoginForm')}
              activeOpacity={0.85}
          >
            <Text style={styles.buttonText}>Volver a iniciar sesión</Text>
          </TouchableOpacity>
        </ScrollView>
    );
  }

  // ── Pantalla principal ──────────────────────────────────────────────────
  return (
      <ScrollView
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
      >
        <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />

        {/* Logo + título */}
        <View style={styles.topSection}>
          <Image
              source={require('../../assets/logo.png')}
              style={styles.logo}
              resizeMode="contain"
          />
          <Text style={styles.appName}>FinanzApp</Text>
          <Text style={styles.title}>Recuperar Contraseña</Text>
        </View>

        <Text style={styles.subtitle}>
          Por favor ingresa tu correo electrónico para enviarte un enlace de recuperación.
        </Text>

        {/* Campo de email */}
        <View style={{ marginBottom: 14 }}>
          <View style={[styles.inputWrapper, error && styles.inputWrapperError]}>
            <Feather name="mail" size={18} color={COLORS.textLight} style={styles.inputIcon} />
            <TextInput
                style={styles.input}
                placeholder="Correo electrónico"
                placeholderTextColor={COLORS.textLight}
                value={email}
                onChangeText={handleEmailChange}
                keyboardType="email-address"
                autoCapitalize="none"
                returnKeyType="done"
                onSubmitEditing={handleSend}
            />
          </View>
          {error ? <Text style={styles.errorText}>{error}</Text> : null}
        </View>

        {/* Botón enviar */}
        <TouchableOpacity
            style={styles.button}
            onPress={handleSend}
            disabled={loading}
            activeOpacity={0.85}
        >
          {loading
              ? <ActivityIndicator color="#fff" />
              : <Text style={styles.buttonText}>Enviar enlace</Text>
          }
        </TouchableOpacity>

        {/* Volver al login */}
        <TouchableOpacity
            onPress={() => navigation.navigate('LoginForm')}
            style={styles.backLink}
        >
          <Text style={styles.backLinkText}>Regresar al Login</Text>
        </TouchableOpacity>
      </ScrollView>
  );
}

const styles = StyleSheet.create({
  // ── Layout ────────────────────────────────────────────────────────────────
  container: {
    flexGrow: 1,
    backgroundColor: COLORS.background,
    paddingHorizontal: SIZES.padding,
    paddingTop: 60,
    paddingBottom: 40,
    justifyContent: 'center',
  },

  // ── Cabecera ──────────────────────────────────────────────────────────────
  topSection: { alignItems: 'center', marginBottom: 32 },
  logo: { width: 70, height: 70, marginBottom: 8 },
  appName: { fontSize: 20, fontWeight: 'bold', color: COLORS.textPrimary, marginBottom: 6 },
  title: { fontSize: 24, fontWeight: 'bold', color: COLORS.textPrimary },
  subtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 28,
  },

  // ── Campo de texto (igual al inputStyles del LoginForm y RegisterScreen) ──
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: SIZES.borderRadius,
    backgroundColor: '#fff',
    paddingHorizontal: 14,
    minHeight: 52,
  },
  inputWrapperError: { borderColor: '#E74C3C' },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, fontSize: 15, color: COLORS.textPrimary, paddingVertical: 14 },
  errorText: { color: '#E74C3C', fontSize: 12, marginTop: 4, marginLeft: 4 },

  // ── Botón principal ───────────────────────────────────────────────────────
  button: {
    backgroundColor: COLORS.primary,
    paddingVertical: 16,
    borderRadius: SIZES.borderRadius,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 16,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
  },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },

  // ── Link volver ───────────────────────────────────────────────────────────
  backLink: { alignItems: 'center', marginTop: 8 },
  backLinkText: { color: COLORS.primary, fontSize: 14, fontWeight: 'bold' },

  // ── Pantalla de éxito ─────────────────────────────────────────────────────
  successIconWrapper: { alignItems: 'center', marginBottom: 24 },
  successIcon: { width: 120, height: 120 },
  successTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    textAlign: 'center',
    marginBottom: 16,
  },
});
