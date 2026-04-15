//RegisterScreen.js
import React, { useState, useContext, useRef } from 'react';
import {
  View, Text, TextInput, StyleSheet, TouchableOpacity,
  StatusBar, ScrollView, ActivityIndicator, Image
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { COLORS, SIZES } from '../constants/Colors';
import { AuthContext } from '../context/AuthContext';

const passwordRules = [
  { id: 'len',     label: 'Mínimo 8 caracteres',                    test: (p) => p.length >= 8 },
  { id: 'upper',   label: 'Al menos una mayúscula',                  test: (p) => /[A-Z]/.test(p) },
  { id: 'number',  label: 'Al menos un número',                      test: (p) => /[0-9]/.test(p) },
  { id: 'special', label: 'Al menos un carácter especial (!@#$...)', test: (p) => /[^A-Za-z0-9]/.test(p) },
];

function PasswordStrength({ password }) {
  const passed = passwordRules.filter(r => r.test(password)).length;
  const colors = ['#E74C3C', '#E74C3C', '#F39C12', '#F39C12', '#2ECC71'];
  const labels = ['', 'Muy débil', 'Débil', 'Regular', 'Fuerte'];
  if (!password) return null;
  return (
    <View style={{ marginTop: 6, marginBottom: 4 }}>
      <View style={{ flexDirection: 'row', gap: 4, marginBottom: 4 }}>
        {[1, 2, 3, 4].map(i => (
          <View key={i} style={{
            flex: 1, height: 4, borderRadius: 2,
            backgroundColor: i <= passed ? colors[passed] : '#E0E0E0'
          }} />
        ))}
      </View>
      <Text style={{ fontSize: 12, color: colors[passed], marginBottom: 2 }}>{labels[passed]}</Text>
      {passwordRules.map(r => (
        <Text key={r.id} style={{ fontSize: 11, color: r.test(password) ? '#2ECC71' : '#AAAAAA', marginTop: 1 }}>
          {r.test(password) ? '✓' : '○'} {r.label}
        </Text>
      ))}
    </View>
  );
}

// Fuera del componente para evitar bug de teclado
function InputField({ placeholder, value, onChange, secure, show, toggleShow, error, keyboardType, icon, returnKeyType, onSubmitEditing, innerRef }) {
  return (
    <View style={{ marginBottom: 14 }}>
      <View style={[inputStyles.wrapper, error && inputStyles.wrapperError]}>
        <Feather name={icon} size={18} color={COLORS.textLight} style={inputStyles.icon} />
        <TextInput
          ref={innerRef}
          style={inputStyles.input}
          placeholder={placeholder}
          placeholderTextColor={COLORS.textLight}
          value={value}
          onChangeText={onChange}
          secureTextEntry={secure && !show}
          autoCapitalize="none"
          keyboardType={keyboardType || 'default'}
          returnKeyType={returnKeyType || 'next'}
          onSubmitEditing={onSubmitEditing}
        />
        {secure && (
          <TouchableOpacity onPress={toggleShow} style={inputStyles.eyeBtn}>
            <Feather name={show ? 'eye-off' : 'eye'} size={18} color={COLORS.textLight} />
          </TouchableOpacity>
        )}
      </View>
      {error ? <Text style={inputStyles.errorText}>{error}</Text> : null}
    </View>
  );
}

const inputStyles = StyleSheet.create({
  wrapper: {
    flexDirection: 'row', alignItems: 'center',
    borderWidth: 1, borderColor: '#E0E0E0',
    borderRadius: SIZES.borderRadius, backgroundColor: '#fff',
    paddingHorizontal: 14, minHeight: 52,
  },
  wrapperError: { borderColor: '#E74C3C' },
  icon: { marginRight: 10 },
  input: { flex: 1, fontSize: 15, color: COLORS.textPrimary, paddingVertical: 14 },
  eyeBtn: { padding: 4 },
  errorText: { color: '#E74C3C', fontSize: 12, marginTop: 4, marginLeft: 4 },
});

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
  const [showStrength, setShowStrength] = useState(false);

  const emailRef   = useRef(null);
  const passRef    = useRef(null);
  const confirmRef = useRef(null);

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
      navigation.navigate('EmailSent', { email });
    }, 1500);
  };

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
        <Text style={styles.title}>Registrarse</Text>
      </View>

      {/* Nombre */}
      <InputField
        placeholder="Nombre completo"
        value={nombre}
        onChange={(v) => { setNombre(v); setErrors(p => ({ ...p, nombre: null })); }}
        icon="user"
        error={errors.nombre}
        returnKeyType="next"
        onSubmitEditing={() => emailRef.current?.focus()}
      />

      {/* Email */}
      <InputField
        placeholder="Correo electrónico"
        value={email}
        onChange={(v) => { setEmail(v); setErrors(p => ({ ...p, email: null })); }}
        icon="mail"
        keyboardType="email-address"
        error={errors.email}
        innerRef={emailRef}
        returnKeyType="next"
        onSubmitEditing={() => passRef.current?.focus()}
      />

      {/* Contraseña */}
      <View style={{ marginBottom: 14 }}>
        <View style={[inputStyles.wrapper, errors.password && inputStyles.wrapperError]}>
          <Feather name="lock" size={18} color={COLORS.textLight} style={inputStyles.icon} />
          <TextInput
            ref={passRef}
            style={inputStyles.input}
            placeholder="Contraseña"
            placeholderTextColor={COLORS.textLight}
            value={password}
            onChangeText={(v) => {
              setPass(v);
              setShowStrength(true);
              setErrors(p => ({ ...p, password: null }));
            }}
            secureTextEntry={!showPass}
            autoCapitalize="none"
            returnKeyType="next"
            onSubmitEditing={() => confirmRef.current?.focus()}
          />
          <TouchableOpacity onPress={() => setShowPass(!showPass)} style={inputStyles.eyeBtn}>
            <Feather name={showPass ? 'eye-off' : 'eye'} size={18} color={COLORS.textLight} />
          </TouchableOpacity>
        </View>
        {showStrength && <PasswordStrength password={password} />}
        {errors.password ? <Text style={inputStyles.errorText}>{errors.password}</Text> : null}
      </View>

      {/* Confirmar contraseña */}
      <InputField
        placeholder="Confirmar contraseña"
        value={confirm}
        onChange={(v) => { setConfirm(v); setErrors(p => ({ ...p, confirm: null })); }}
        icon="lock"
        secure
        show={showConf}
        toggleShow={() => setShowConf(!showConf)}
        error={errors.confirm}
        innerRef={confirmRef}
        returnKeyType="done"
        onSubmitEditing={handleRegister}
      />

      {/* Botón */}
      <TouchableOpacity
        style={[styles.button, (!allRulesPassed || !confirm) && styles.buttonDisabled]}
        onPress={handleRegister}
        disabled={loading || !allRulesPassed || !confirm}
        activeOpacity={0.85}
      >
        {loading
          ? <ActivityIndicator color="#fff" />
          : <Text style={styles.buttonText}>Registrarse</Text>
        }
      </TouchableOpacity>

      {/* Link login */}
      <View style={styles.loginRow}>
        <Text style={styles.loginText}>¿Ya tienes cuenta? </Text>
        <TouchableOpacity onPress={() => navigation.navigate('AuthOptions')}>
          <Text style={styles.loginLink}>Inicia sesión</Text>
        </TouchableOpacity>
      </View>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1, backgroundColor: COLORS.background,
    paddingHorizontal: SIZES.padding,
    paddingTop: 60, paddingBottom: 40,
  },
  topSection: { alignItems: 'center', marginBottom: 32 },
  logo: { width: 70, height: 70, marginBottom: 8 },
  appName: { fontSize: 20, fontWeight: 'bold', color: COLORS.textPrimary, marginBottom: 6 },
  title: { fontSize: 24, fontWeight: 'bold', color: COLORS.textPrimary },
  button: {
    backgroundColor: COLORS.primary, paddingVertical: 16,
    borderRadius: SIZES.borderRadius, alignItems: 'center',
    marginTop: 8, marginBottom: 24,
    shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 6, elevation: 5,
  },
  buttonDisabled: { backgroundColor: '#B0BEC5', shadowOpacity: 0 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  loginRow: { flexDirection: 'row', justifyContent: 'center' },
  loginText: { fontSize: 14, color: COLORS.textSecondary },
  loginLink: { fontSize: 14, color: COLORS.textPrimary, fontWeight: 'bold' },
});