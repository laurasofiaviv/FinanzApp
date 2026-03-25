import React, { useState } from 'react';
import {
  View, Text, TextInput, StyleSheet, TouchableOpacity,
  ActivityIndicator, Image, ScrollView, StatusBar
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { COLORS, SIZES } from '../constants/Colors';

export default function ForgotPasswordScreen({ navigation }) {
  const [email, setEmail]     = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent]       = useState(false);
  const [error, setError]     = useState('');

  const handleSend = () => {
    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      setError('Ingresa un correo válido');
      return;
    }
    setLoading(true);
    setError('');
    setTimeout(() => {
      setLoading(false);
      setSent(true);
    }, 1200);
  };

  // ── Pantalla de confirmación ────────────────────────────────────────────
  if (sent) {
    return (
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />

        {/* Logo + nombre app — igual que todas las pantallas */}
        <View style={styles.topSection}>
          <Image
            source={require('../../assets/logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.appName}>Financify</Text>
        </View>

        {/* Ícono de éxito — igual que RegisterSuccess */}
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
          </Text>
          .
        </Text>

        {/* Botón principal */}
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate('LoginForm')}
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

      {/* Logo + título — idéntico a Login y Register */}
      <View style={styles.topSection}>
        <Image
          source={require('../../assets/logo.png')}
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={styles.appName}>Financify</Text>
        <Text style={styles.title}>Recuperar Contraseña</Text>
      </View>

      <Text style={styles.subtitle}>
        Por favor ingresa tu correo electrónico para enviarte un enlace de recuperación.
      </Text>

      {/* Input con icono — idéntico a Login y Register */}
      <View style={[styles.inputWrapper, error ? styles.inputWrapperError : null]}>
        <Feather
          name="mail"
          size={18}
          color={COLORS.textLight}
          style={styles.inputIcon}
        />
        <TextInput
          style={styles.input}
          placeholder="Correo electrónico"
          placeholderTextColor={COLORS.textLight}
          value={email}
          onChangeText={(v) => { setEmail(v); setError(''); }}
          keyboardType="email-address"
          autoCapitalize="none"
          returnKeyType="done"
          onSubmitEditing={handleSend}
        />
      </View>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      {/* Botón principal */}
      <TouchableOpacity
        style={styles.button}
        onPress={handleSend}
        disabled={loading}
      >
        {loading
          ? <ActivityIndicator color="#fff" />
          : <Text style={styles.buttonText}>Enviar enlace</Text>
        }
      </TouchableOpacity>

      {/* Link volver — subrayado, igual que en la imagen */}
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
  container: {
    flexGrow: 1,
    backgroundColor: COLORS.background,
    paddingHorizontal: SIZES.padding,
    paddingTop: 60,
    paddingBottom: 40,
    justifyContent: 'center',
  },

  // ── Top section — idéntico a Login, Register y RegisterSuccess ──────────
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
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    textAlign: 'center',
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
  successTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    textAlign: 'center',
    marginBottom: 14,
  },

  // ── Subtitle ────────────────────────────────────────────────────────────
  subtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 28,
    paddingHorizontal: 10,
  },

  // ── Input — idéntico a Login y Register ─────────────────────────────────
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: SIZES.borderRadius,
    backgroundColor: '#fff',
    paddingHorizontal: 14,
    minHeight: 52,
    marginBottom: 6,
  },
  inputWrapperError: {
    borderColor: COLORS.danger,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: COLORS.textPrimary,
    paddingVertical: 14,
  },
  errorText: {
    color: COLORS.danger,
    fontSize: 12,
    marginBottom: 10,
    marginLeft: 4,
  },

  // ── Botón — idéntico a Login, Register y RegisterSuccess ────────────────
  button: {
    backgroundColor: COLORS.primary,
    paddingVertical: 16,
    borderRadius: SIZES.borderRadius,
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 20,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },

  // ── Link volver — subrayado, igual que en la imagen ─────────────────────
  backLink: {
    alignItems: 'center',
  },
  backLinkText: {
    fontSize: 14,
    color: COLORS.textPrimary,
    fontWeight: 'bold',
    textDecorationLine: 'underline',
  },
});
