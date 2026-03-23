import React, { useState } from 'react';
import {
  View, Text, TextInput, StyleSheet,
  TouchableOpacity, ActivityIndicator
} from 'react-native';
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

    // --- Simula envío de email de recuperación ---
    setTimeout(() => {
      setLoading(false);
      setSent(true); // Muestra confirmación sin importar si existe el email (seguridad)
    }, 1200);
  };

  if (sent) {
    return (
      <View style={styles.container}>
        <Text style={styles.icon}>🔐</Text>
        <Text style={styles.title}>Correo enviado</Text>
        <Text style={styles.subtitle}>
          Si <Text style={{ fontWeight: 'bold' }}>{email}</Text> está registrado, recibirás un enlace para restablecer tu contraseña. El enlace expira en 15 minutos.
        </Text>
        <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('LoginForm')}>
          <Text style={styles.buttonText}>Volver a iniciar sesión</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.back}>
        <Text style={styles.backText}>← Volver</Text>
      </TouchableOpacity>

      <Text style={styles.icon}>🔑</Text>
      <Text style={styles.title}>¿Olvidaste tu contraseña?</Text>
      <Text style={styles.subtitle}>
        Ingresa tu correo y te enviaremos un enlace para restablecerla.
      </Text>

      <Text style={styles.label}>Correo electrónico</Text>
      <TextInput
        style={[styles.input, error && styles.inputError]}
        placeholder="tu@correo.com"
        value={email}
        onChangeText={(v) => { setEmail(v); setError(''); }}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      <TouchableOpacity style={styles.button} onPress={handleSend} disabled={loading}>
        {loading
          ? <ActivityIndicator color="#fff" />
          : <Text style={styles.buttonText}>Enviar enlace</Text>
        }
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background, paddingHorizontal: SIZES.padding, paddingTop: 60 },
  back: { marginBottom: 20 },
  backText: { color: COLORS.primary, fontSize: 15 },
  icon: { fontSize: 48, marginBottom: 16, textAlign: 'center' },
  title: { fontSize: 24, fontWeight: 'bold', color: COLORS.textPrimary, marginBottom: 10, textAlign: 'center' },
  subtitle: { fontSize: 14, color: COLORS.textSecondary, textAlign: 'center', lineHeight: 20, marginBottom: 30 },
  label: { fontSize: 13, color: COLORS.textSecondary, marginBottom: 6 },
  input: {
    borderWidth: 1, borderColor: '#E0E0E0', borderRadius: SIZES.borderRadius,
    padding: 14, fontSize: 15, color: COLORS.textPrimary, backgroundColor: '#F5F7FA', marginBottom: 6,
  },
  inputError: { borderColor: '#E74C3C' },
  errorText: { color: '#E74C3C', fontSize: 12, marginBottom: 10 },
  button: {
    backgroundColor: COLORS.primary, paddingVertical: 18,
    borderRadius: SIZES.borderRadius, alignItems: 'center', marginTop: 20,
    shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 6, elevation: 5,
  },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});