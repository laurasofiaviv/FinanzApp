import React, { useState, useContext } from 'react';
import {
  View, Text, TextInput, StyleSheet, TouchableOpacity,
  StatusBar, ScrollView, ActivityIndicator
} from 'react-native';
import { COLORS, SIZES } from '../constants/Colors';
import { AuthContext } from '../context/AuthContext';

const passwordRules = [
  { id: 'len',     label: 'Mínimo 8 caracteres',               test: (p) => p.length >= 8 },
  { id: 'upper',   label: 'Al menos una mayúscula',             test: (p) => /[A-Z]/.test(p) },
  { id: 'number',  label: 'Al menos un número',                 test: (p) => /[0-9]/.test(p) },
  { id: 'special', label: 'Al menos un carácter especial (!@#$...)', test: (p) => /[^A-Za-z0-9]/.test(p) },
];

// ✅ FUERA del componente — se define una sola vez, no se recrea
function PasswordStrength({ password }) {
  const passed = passwordRules.filter(r => r.test(password)).length;
  const colors = ['#E74C3C', '#E74C3C', '#F39C12', '#F39C12', '#2ECC71'];
  const labels = ['', 'Muy débil', 'Débil', 'Regular', 'Fuerte'];
  if (!password) return null;
  return (
    <View style={{ marginTop: 8 }}>
      <View style={{ flexDirection: 'row', gap: 4, marginBottom: 6 }}>
        {[1, 2, 3, 4].map(i => (
          <View key={i} style={{
            flex: 1, height: 4, borderRadius: 2,
            backgroundColor: i <= passed ? colors[passed] : '#E0E0E0'
          }} />
        ))}
      </View>
      {password.length > 0 && (
        <Text style={{ fontSize: 12, color: colors[passed] }}>{labels[passed]}</Text>
      )}
      {passwordRules.map(r => (
        <Text key={r.id} style={{ fontSize: 12, color: r.test(password) ? '#2ECC71' : '#AAAAAA', marginTop: 2 }}>
          {r.test(password) ? '✓' : '○'} {r.label}
        </Text>
      ))}
    </View>
  );
}

// ✅ FUERA del componente — misma razón
function Field({ label, value, onChange, placeholder, secure, show, toggleShow, error, keyboardType }) {
  return (
    <View style={{ marginTop: 14 }}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.passRow}>
        <TextInput
          style={[styles.input, styles.passInput, error && styles.inputError]}
          placeholder={placeholder}
          value={value}
          onChangeText={onChange}
          secureTextEntry={secure && !show}
          autoCapitalize="none"
          keyboardType={keyboardType || 'default'}
        />
        {secure && (
          <TouchableOpacity style={styles.eyeBtn} onPress={toggleShow}>
            <Text style={styles.eyeText}>{show ? 'Ocultar' : 'Ver'}</Text>
          </TouchableOpacity>
        )}
      </View>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
}

export default function RegisterScreen({ navigation }) {
  const { simulateEmailVerification } = useContext(AuthContext);
  const [nombre, setNombre]     = useState('');
  const [email, setEmail]       = useState('');
  const [password, setPass]     = useState('');
  const [confirm, setConfirm]   = useState('');
  const [showPass, setShowPass] = useState(false);
  const [showConf, setShowConf] = useState(false);
  const [loading, setLoading]   = useState(false);
  const [errors, setErrors]     = useState({});

  const allRulesPassed = passwordRules.every(r => r.test(password));

  const validate = () => {
    const e = {};
    if (!nombre) e.nombre = 'El nombre es obligatorio';
    if (!email || !/\S+@\S+\.\S+/.test(email)) e.email = 'Ingresa un correo válido';
    if (!allRulesPassed) e.password = 'La contraseña no cumple los requisitos';
    if (password !== confirm) e.confirm = 'Las contraseñas no coinciden';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleRegister = () => {
    if (!validate()) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      simulateEmailVerification({ email, nombre });
      navigation.navigate('EmailSent', { email }); // ✅ navega correctamente
    }, 1500);
  };

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <StatusBar barStyle="dark-content" />

      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.back}>
        <Text style={styles.backText}>← Volver</Text>
      </TouchableOpacity>

      <Text style={styles.title}>Crear cuenta</Text>
      <Text style={styles.subtitle}>Empieza a controlar tus finanzas</Text>

      {/* ✅ onChange pasa la función directamente, sin wrapper */}
      <Field
        label="Nombre completo"
        value={nombre}
        onChange={setNombre}
        placeholder="Tu nombre"
        error={errors.nombre}
      />

      <Field
        label="Correo electrónico"
        value={email}
        onChange={setEmail}
        placeholder="tu@correo.com"
        keyboardType="email-address"
        error={errors.email}
      />

      <View style={{ marginTop: 14 }}>
        <Text style={styles.label}>Contraseña</Text>
        <View style={styles.passRow}>
          <TextInput
            style={[styles.input, styles.passInput, errors.password && styles.inputError]}
            placeholder="Crea una contraseña segura"
            value={password}
            onChangeText={setPass}
            secureTextEntry={!showPass}
            autoCapitalize="none"
          />
          <TouchableOpacity style={styles.eyeBtn} onPress={() => setShowPass(!showPass)}>
            <Text style={styles.eyeText}>{showPass ? 'Ocultar' : 'Ver'}</Text>
          </TouchableOpacity>
        </View>
        <PasswordStrength password={password} />
        {errors.password ? <Text style={styles.errorText}>{errors.password}</Text> : null}
      </View>

      <Field
        label="Confirmar contraseña"
        value={confirm}
        onChange={setConfirm}
        placeholder="Repite tu contraseña"
        secure
        show={showConf}
        toggleShow={() => setShowConf(!showConf)}
        error={errors.confirm}
      />

      <TouchableOpacity
        style={[styles.button, (!allRulesPassed || !confirm) && styles.buttonDisabled]}
        onPress={handleRegister}
        disabled={loading || !allRulesPassed || !confirm}
      >
        {loading
          ? <ActivityIndicator color="#fff" />
          : <Text style={styles.buttonText}>Crear cuenta</Text>
        }
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('AuthOptions')} style={styles.loginLink}>
        <Text style={styles.loginLinkText}>¿Ya tienes cuenta? Inicia sesión</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, backgroundColor: COLORS.background, paddingHorizontal: SIZES.padding, paddingTop: 60, paddingBottom: 40 },
  back: { marginBottom: 20 },
  backText: { color: COLORS.primary, fontSize: 15 },
  title: { fontSize: SIZES.title, fontWeight: 'bold', color: COLORS.textPrimary, marginBottom: 6 },
  subtitle: { fontSize: SIZES.subtitle, color: COLORS.textSecondary, marginBottom: 10 },
  label: { fontSize: 13, color: COLORS.textSecondary, marginBottom: 6 },
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
  button: {
    backgroundColor: COLORS.primary, paddingVertical: 18,
    borderRadius: SIZES.borderRadius, alignItems: 'center', marginTop: 30,
    shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 6, elevation: 5,
  },
  buttonDisabled: { backgroundColor: '#B0BEC5', shadowOpacity: 0 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  loginLink: { alignItems: 'center', marginTop: 20 },
  loginLinkText: { color: COLORS.primary, fontSize: 14 },
});