import React, { useState, useContext } from 'react';
import {
  View, Text, TextInput, StyleSheet,
  TouchableOpacity, StatusBar, Alert, ActivityIndicator
} from 'react-native';
import { COLORS, SIZES } from '../constants/Colors';
import { AuthContext } from '../context/AuthContext';

export default function LoginFormScreen({ navigation }) {
  const { login } = useContext(AuthContext);
  const [email, setEmail]     = useState('');
  const [password, setPass]   = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors]   = useState({});

  const validate = () => {
    const e = {};
    if (!email)    e.email    = 'El correo es obligatorio';
    if (!password) e.password = 'La contraseña es obligatoria';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleLogin = async () => {
    if (!validate()) return;
    setLoading(true);

    // --- Simula llamada al backend (reemplaza con Firebase/API real) ---
    setTimeout(() => {
      setLoading(false);
      // Credencial de prueba
      if (email === 'admin@financify.com' && password === 'Admin123!') {
        login({ email, nombre: 'Juan Pérez', verificado: true });
        // AppNavigator detecta usuario != null → muestra Dashboard automáticamente
      } else {
        setErrors({ general: 'Correo o contraseña incorrectos' });
      }
    }, 1200);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.back}>
        <Text style={styles.backText}>← Volver</Text>
      </TouchableOpacity>

      <Text style={styles.title}>Iniciar sesión</Text>
      <Text style={styles.subtitle}>Bienvenido de nuevo</Text>

      {errors.general ? (
        <View style={styles.errorBox}>
          <Text style={styles.errorBoxText}>{errors.general}</Text>
        </View>
      ) : null}

      <Text style={styles.label}>Correo electrónico</Text>
      <TextInput
        style={[styles.input, errors.email && styles.inputError]}
        placeholder="tu@correo.com"
        value={email}
        onChangeText={(v) => { setEmail(v); setErrors(p => ({...p, email: null, general: null})); }}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      {errors.email ? <Text style={styles.errorText}>{errors.email}</Text> : null}

      <Text style={styles.label}>Contraseña</Text>
      <View style={styles.passRow}>
        <TextInput
          style={[styles.input, styles.passInput, errors.password && styles.inputError]}
          placeholder="Tu contraseña"
          value={password}
          onChangeText={(v) => { setPass(v); setErrors(p => ({...p, password: null, general: null})); }}
          secureTextEntry={!showPass}
        />
        <TouchableOpacity style={styles.eyeBtn} onPress={() => setShowPass(!showPass)}>
          <Text style={styles.eyeText}>{showPass ? 'Ocultar' : 'Ver'}</Text>
        </TouchableOpacity>
      </View>
      {errors.password ? <Text style={styles.errorText}>{errors.password}</Text> : null}

      <TouchableOpacity
        onPress={() => navigation.navigate('ForgotPassword')}
        style={styles.forgotLink}
      >
        <Text style={styles.forgotText}>¿Olvidaste tu contraseña?</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={loading}>
        {loading
          ? <ActivityIndicator color="#fff" />
          : <Text style={styles.buttonText}>Iniciar sesión</Text>
        }
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background, paddingHorizontal: SIZES.padding, paddingTop: 60 },
  back: { marginBottom: 30 },
  backText: { color: COLORS.primary, fontSize: 15 },
  title: { fontSize: SIZES.title, fontWeight: 'bold', color: COLORS.textPrimary, marginBottom: 6 },
  subtitle: { fontSize: SIZES.subtitle, color: COLORS.textSecondary, marginBottom: 30 },
  label: { fontSize: 13, color: COLORS.textSecondary, marginBottom: 6, marginTop: 14 },
  input: {
    borderWidth: 1, borderColor: '#E0E0E0', borderRadius: SIZES.borderRadius,
    padding: 14, fontSize: 15, color: COLORS.textPrimary, backgroundColor: '#F5F7FA',
  },
  inputError: { borderColor: '#E74C3C' },
  passRow: { flexDirection: 'row', alignItems: 'center' },
  passInput: { flex: 1 },
  eyeBtn: { marginLeft: 10, padding: 8 },
  eyeText: { color: COLORS.primary, fontSize: 13 },
  errorText: { color: '#E74C3C', fontSize: 12, marginTop: 4 },
  errorBox: {
    backgroundColor: '#FFEBEE', borderRadius: SIZES.borderRadius,
    padding: 12, marginBottom: 10,
  },
  errorBoxText: { color: '#C62828', fontSize: 14 },
  forgotLink: { alignSelf: 'flex-end', marginTop: 10, marginBottom: 30 },
  forgotText: { color: COLORS.primary, fontSize: 13 },
  button: {
    backgroundColor: COLORS.primary, paddingVertical: 18,
    borderRadius: SIZES.borderRadius, alignItems: 'center',
    shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 6, elevation: 5,
  },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});