import React from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
  Image,
  ScrollView
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { COLORS, SIZES } from '../constants/Colors';
import { useLoginForm } from '../hooks/useLoginForm';

// ─── Campo reutilizable ────────────────────────────────────────────────────────
// Definido fuera del componente para evitar re-montajes al escribir
function InputField({
                      placeholder, value, onChange, secure, show, toggleShow,
                      error, keyboardType, icon, returnKeyType, onSubmitEditing, innerRef
                    }) {
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

// ─── Pantalla ──────────────────────────────────────────────────────────────────
export default function LoginFormScreen({ navigation }) {
  const {
    email,    setEmail,
    password, setPassword,
    showPass, setShowPass,
    loading,  errors,
    passRef,  limpiarError,
    handleLogin,
  } = useLoginForm(navigation);

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
          <Text style={styles.title}>Iniciar sesión</Text>
        </View>

        {/* Error general */}
        {errors.general ? (
            <View style={styles.errorBox}>
              <Text style={styles.errorBoxText}>{errors.general}</Text>
            </View>
        ) : null}

        {/* Email */}
        <InputField
            placeholder="Ingresa tu correo"
            value={email}
            onChange={(v) => { setEmail(v); limpiarError('email'); }}
            icon="mail"
            keyboardType="email-address"
            error={errors.email}
            returnKeyType="next"
            onSubmitEditing={() => passRef.current?.focus()}
        />

        {/* Contraseña */}
        <InputField
            placeholder="Ingresa tu contraseña"
            value={password}
            onChange={(v) => { setPassword(v); limpiarError('password'); }}
            icon="lock"
            secure
            show={showPass}
            toggleShow={setShowPass}
            error={errors.password}
            innerRef={passRef}
            returnKeyType="done"
            onSubmitEditing={handleLogin}
        />

        {/* Olvidé contraseña */}
        <TouchableOpacity
            onPress={() => navigation.navigate('ForgotPassword')}
            style={styles.forgotLink}
        >
          <Text style={styles.forgotText}>¿Olvide contraseña?</Text>
        </TouchableOpacity>

        {/* Botón iniciar sesión */}
        <TouchableOpacity
            style={styles.button}
            onPress={handleLogin}
            disabled={loading}
            activeOpacity={0.85}
        >
          {loading
              ? <ActivityIndicator color="#fff" />
              : <Text style={styles.buttonText}>Iniciar sesión</Text>
          }
        </TouchableOpacity>

        {/* Separador redes sociales */}
        <View style={styles.separatorRow}>
          <View style={styles.separatorLine} />
          <Text style={styles.separatorText}>O, iniciar sesión con:</Text>
          <View style={styles.separatorLine} />
        </View>

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

// ─── Estilos del InputField ────────────────────────────────────────────────────
// StyleSheet separado para que InputField no dependa del styles de la pantalla
const inputStyles = StyleSheet.create({
  wrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: SIZES.borderRadius,
    backgroundColor: '#fff',
    paddingHorizontal: 14,
    minHeight: 52,
  },
  wrapperError: { borderColor: '#E74C3C' },
  icon: { marginRight: 10 },
  input: { flex: 1, fontSize: 15, color: COLORS.textPrimary, paddingVertical: 14 },
  eyeBtn: { padding: 4 },
  errorText: { color: '#E74C3C', fontSize: 12, marginTop: 4, marginLeft: 4 },
});

// ─── Estilos de la pantalla ────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: COLORS.background,
    paddingHorizontal: SIZES.padding,
    paddingTop: 60,
    paddingBottom: 40,
    justifyContent: 'center',
  },
  topSection: { alignItems: 'center', marginBottom: 32 },
  logo: { width: 70, height: 70, marginBottom: 8 },
  appName: { fontSize: 20, fontWeight: 'bold', color: COLORS.textPrimary, marginBottom: 6 },
  title: { fontSize: 24, fontWeight: 'bold', color: COLORS.textPrimary },
  errorBox: {
    backgroundColor: '#FFEBEE',
    borderRadius: SIZES.borderRadius,
    padding: 12,
    marginBottom: 12,
  },
  errorBoxText: { color: '#C62828', fontSize: 14, textAlign: 'center' },
  forgotLink: { alignSelf: 'flex-end', marginBottom: 24 },
  forgotText: { color: COLORS.primary, fontSize: 13 },
  button: {
    backgroundColor: COLORS.primary,
    paddingVertical: 16,
    borderRadius: SIZES.borderRadius,
    alignItems: 'center',
    marginBottom: 28,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
  },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  separatorRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  separatorLine: { flex: 1, height: 1, backgroundColor: '#E0E0E0' },
  separatorText: { marginHorizontal: 10, fontSize: 13, color: COLORS.textLight },
  socialRow: { flexDirection: 'row', justifyContent: 'center', gap: 16, marginBottom: 32 },
  socialBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  googleText: { fontSize: 16, fontWeight: 'bold', color: '#DB4437' },
  registerRow: { flexDirection: 'row', justifyContent: 'center' },
  registerText: { fontSize: 14, color: COLORS.textSecondary },
  registerLink: { fontSize: 14, color: COLORS.textPrimary, fontWeight: 'bold' },
});
