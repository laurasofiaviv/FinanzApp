import React, { useState, useContext, useRef } from 'react';
import {
  View, Text, TextInput, StyleSheet, TouchableOpacity,
  StatusBar, ActivityIndicator, Image, ScrollView
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { COLORS, SIZES } from '../constants/Colors';
import { AuthContext } from '../context/AuthContext';

// ✅ Fuera del componente — mismo patrón que RegisterScreen
function InputField({ placeholder, value, onChange, secure, show, toggleShow,
  error, keyboardType, icon, returnKeyType, onSubmitEditing, innerRef }) {
  return (
    <View style={{ marginBottom: 14 }}>
      <View style={[styles.inputWrapper, error && styles.inputWrapperError]}>
        <Feather name={icon} size={18} color={COLORS.textLight} style={styles.inputIcon} />
        <TextInput
          ref={innerRef}
          style={styles.input}
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
          <TouchableOpacity onPress={toggleShow} style={styles.eyeBtn}>
            <Feather name={show ? 'eye-off' : 'eye'} size={18} color={COLORS.textLight} />
          </TouchableOpacity>
        )}
      </View>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
}

export default function LoginFormScreen({ navigation }) {
  const { login } = useContext(AuthContext);
  const [email, setEmail]       = useState('');
  const [password, setPass]     = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading]   = useState(false);
  const [errors, setErrors]     = useState({});
  const passRef = useRef(null);

  const validate = () => {
    const e = {};
    if (!email)    e.email    = 'El correo es obligatorio';
    if (!password) e.password = 'La contraseña es obligatoria';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleLogin = () => {
    if (!validate()) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      if (email === 'admin@financify.com' && password === 'Admin123!') {
        login({ email, nombre: 'Juan Pérez', verificado: true });
      } else {
        setErrors({ general: 'Correo o contraseña incorrectos' });
      }
    }, 1200);
  };

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />

      {/* Logo + título — igual que Register */}
      <View style={styles.topSection}>
        <Image
          source={require('../../assets/logo.png')}
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={styles.appName}>FinanzApp</Text>
        <Text style={styles.title}>Iniciar sesión</Text>
      </View>

      {/* Error general */}
      {errors.general ? (
        <View style={styles.errorBox}>
          <Text style={styles.errorBoxText}>{errors.general}</Text>
        </View>
      ) : null}

      {/* Email — misma cajita que Register */}
      <InputField
        placeholder="Ingresa tu correo"
        value={email}
        onChange={(v) => { setEmail(v); setErrors(p => ({ ...p, email: null, general: null })); }}
        icon="mail"
        keyboardType="email-address"
        error={errors.email}
        returnKeyType="next"
        onSubmitEditing={() => passRef.current?.focus()}
      />

      {/* Contraseña — misma cajita que Register */}
      <InputField
        placeholder="Ingresa tu contraseña"
        value={password}
        onChange={(v) => { setPass(v); setErrors(p => ({ ...p, password: null, general: null })); }}
        icon="lock"
        secure
        show={showPass}
        toggleShow={() => setShowPass(!showPass)}
        error={errors.password}
        innerRef={passRef}
        returnKeyType="done"
        onSubmitEditing={handleLogin}
      />

      {/* ¿Olvidaste tu contraseña? */}
      <TouchableOpacity
        onPress={() => navigation.navigate('ForgotPassword')}
        style={styles.forgotLink}
      >
        <Text style={styles.forgotText}>¿Olvide contraseña?</Text>
      </TouchableOpacity>

      {/* Botón */}
      <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={loading}>
        {loading
          ? <ActivityIndicator color="#fff" />
          : <Text style={styles.buttonText}>Iniciar sesión</Text>
        }
      </TouchableOpacity>

      {/* Separador */}
      <View style={styles.separatorRow}>
        <View style={styles.separatorLine} />
        <Text style={styles.separatorText}>O, iniciar sesión con:</Text>
        <View style={styles.separatorLine} />
      </View>

      {/* Botones sociales */}
      <View style={styles.socialRow}>
        <TouchableOpacity style={styles.socialBtn}>
          <Text style={styles.googleText}>G</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.socialBtn}>
          <Feather name="facebook" size={20} color="#1877F2" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.socialBtn}>
          <Feather name="twitter" size={20} color="#1DA1F2" />
        </TouchableOpacity>
      </View>

      {/* Link registro */}
      <View style={styles.registerRow}>
        <Text style={styles.registerText}>¿No tienes cuenta? </Text>
        <TouchableOpacity onPress={() => navigation.navigate('Register')}>
          <Text style={styles.registerLink}>Registro</Text>
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
    justifyContent: 'center',
  },

  // Top — idéntico a Register
  topSection: { alignItems: 'center', marginBottom: 32 },
  logo: { width: 70, height: 70, marginBottom: 8 },
  appName: { fontSize: 20, fontWeight: 'bold', color: COLORS.textPrimary, marginBottom: 6 },
  title: { fontSize: 24, fontWeight: 'bold', color: COLORS.textPrimary },

  // Error general
  errorBox: {
    backgroundColor: '#FFEBEE', borderRadius: SIZES.borderRadius,
    padding: 12, marginBottom: 12,
  },
  errorBoxText: { color: '#C62828', fontSize: 14, textAlign: 'center' },

  // Inputs — idéntico a Register
  inputWrapper: {
    flexDirection: 'row', alignItems: 'center',
    borderWidth: 1, borderColor: '#E0E0E0',
    borderRadius: SIZES.borderRadius, backgroundColor: '#fff',
    paddingHorizontal: 14, minHeight: 52,
  },
  inputWrapperError: { borderColor: '#E74C3C' },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, fontSize: 15, color: COLORS.textPrimary, paddingVertical: 14 },
  eyeBtn: { padding: 4 },
  errorText: { color: '#E74C3C', fontSize: 12, marginTop: 4, marginLeft: 4 },

  // Forgot
  forgotLink: { alignSelf: 'flex-end', marginBottom: 24 },
  forgotText: { color: COLORS.primary, fontSize: 13 },

  // Botón — idéntico a Register
  button: {
    backgroundColor: COLORS.primary, paddingVertical: 16,
    borderRadius: SIZES.borderRadius, alignItems: 'center',
    marginBottom: 28,
    shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 6, elevation: 5,
  },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },

  // Separador
  separatorRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  separatorLine: { flex: 1, height: 1, backgroundColor: '#E0E0E0' },
  separatorText: { marginHorizontal: 10, fontSize: 13, color: COLORS.textLight },

  // Social
  socialRow: { flexDirection: 'row', justifyContent: 'center', gap: 16, marginBottom: 32 },
  socialBtn: {
    width: 48, height: 48, borderRadius: 24,
    borderWidth: 1, borderColor: '#E0E0E0',
    justifyContent: 'center', alignItems: 'center',
    backgroundColor: '#fff',
  },
  googleText: { fontSize: 16, fontWeight: 'bold', color: '#DB4437' },

  // Registro
  registerRow: { flexDirection: 'row', justifyContent: 'center' },
  registerText: { fontSize: 14, color: COLORS.textSecondary },
  registerLink: { fontSize: 14, color: COLORS.textPrimary, fontWeight: 'bold' },
});