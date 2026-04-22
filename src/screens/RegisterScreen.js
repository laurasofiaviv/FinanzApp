import React from 'react';
import {
    View,
    Text,
    TextInput,
    StyleSheet,
    TouchableOpacity,
    StatusBar,
    ScrollView,
    ActivityIndicator,
    Image,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { COLORS, SIZES } from '../constants/Colors';
import { useRegister } from '../hooks/useRegister';

// ─── Reglas de contraseña (compartidas con el hook si las necesita) ────────────
const passwordRules = [
    { id: 'len',     label: 'Mínimo 8 caracteres',                    test: (p) => p.length >= 8 },
    { id: 'upper',   label: 'Al menos una mayúscula',                  test: (p) => /[A-Z]/.test(p) },
    { id: 'number',  label: 'Al menos un número',                      test: (p) => /[0-9]/.test(p) },
    { id: 'special', label: 'Al menos un carácter especial (!@#$...)', test: (p) => /[^A-Za-z0-9]/.test(p) },
];

// ─── Indicador de fortaleza de contraseña ─────────────────────────────────────
function PasswordStrength({ password }) {
    const passed = passwordRules.filter(r => r.test(password)).length;
    const colors = ['#E74C3C', '#E74C3C', '#F39C12', '#F39C12', '#2ECC71'];
    const labels = ['', 'Muy débil', 'Débil', 'Regular', 'Fuerte'];
    if (!password) return null;
    return (
        <View style={{ marginTop: 6, marginBottom: 4 }}>
            <View style={{ flexDirection: 'row', gap: 4, marginBottom: 4 }}>
                {[1, 2, 3, 4].map(i => (
                    <View
                        key={i}
                        style={{
                            flex: 1, height: 4, borderRadius: 2,
                            backgroundColor: i <= passed ? colors[passed] : '#E0E0E0',
                        }}
                    />
                ))}
            </View>
            <Text style={{ fontSize: 12, color: colors[passed], marginBottom: 2 }}>
                {labels[passed]}
            </Text>
            {passwordRules.map(r => (
                <Text
                    key={r.id}
                    style={{ fontSize: 11, color: r.test(password) ? '#2ECC71' : '#AAAAAA', marginTop: 1 }}
                >
                    {r.test(password) ? '✓' : '○'} {r.label}
                </Text>
            ))}
        </View>
    );
}

// ─── Campo de texto reutilizable ───────────────────────────────────────────────
// Definido fuera del componente principal para evitar re-montajes con el teclado
function InputField({
                        placeholder, value, onChange, secure, show, toggleShow,
                        error, keyboardType, icon, returnKeyType, onSubmitEditing, innerRef,
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

// ─── Pantalla principal ────────────────────────────────────────────────────────
export default function RegisterScreen({ navigation }) {
    const {
        nombre,   setNombre,
        email,    setEmail,
        password, setPassword,
        confirm,  setConfirm,
        showPass, setShowPass,
        showConf, setShowConf,
        loading,
        errors,
        showStrength, setShowStrength,
        allRulesPassed,
        emailRef, passRef, confirmRef,
        limpiarError,
        handleRegister,
    } = useRegister(navigation);

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
                <Text style={styles.title}>Crear cuenta</Text>
            </View>

            {/* Nombre */}
            <InputField
                placeholder="Nombre completo"
                value={nombre}
                onChange={(v) => { setNombre(v); limpiarError('nombre'); }}
                icon="user"
                error={errors.nombre}
                returnKeyType="next"
                onSubmitEditing={() => emailRef.current?.focus()}
            />

            {/* Email */}
            <InputField
                placeholder="Correo electrónico"
                value={email}
                onChange={(v) => { setEmail(v); limpiarError('email'); }}
                icon="mail"
                keyboardType="email-address"
                error={errors.email}
                innerRef={emailRef}
                returnKeyType="next"
                onSubmitEditing={() => passRef.current?.focus()}
            />

            {/* Contraseña con indicador de fortaleza */}
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
                            setPassword(v);
                            setShowStrength(true);
                            limpiarError('password');
                        }}
                        secureTextEntry={!showPass}
                        autoCapitalize="none"
                        returnKeyType="next"
                        onSubmitEditing={() => confirmRef.current?.focus()}
                    />
                    <TouchableOpacity
                        onPress={() => setShowPass(prev => !prev)}
                        style={inputStyles.eyeBtn}
                    >
                        <Feather
                            name={showPass ? 'eye-off' : 'eye'}
                            size={18}
                            color={COLORS.textLight}
                        />
                    </TouchableOpacity>
                </View>
                {showStrength && <PasswordStrength password={password} />}
                {errors.password ? (
                    <Text style={inputStyles.errorText}>{errors.password}</Text>
                ) : null}
            </View>

            {/* Confirmar contraseña */}
            <InputField
                placeholder="Confirmar contraseña"
                value={confirm}
                onChange={(v) => { setConfirm(v); limpiarError('confirm'); }}
                icon="lock"
                secure
                show={showConf}
                toggleShow={() => setShowConf(prev => !prev)}
                error={errors.confirm}
                innerRef={confirmRef}
                returnKeyType="done"
                onSubmitEditing={handleRegister}
            />

            {/* Botón registrar */}
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

            {/* Link a login */}
            <View style={styles.loginRow}>
                <Text style={styles.loginText}>¿Ya tienes cuenta? </Text>
                <TouchableOpacity onPress={() => navigation.navigate('AuthOptions')}>
                    <Text style={styles.loginLink}>Inicia sesión</Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
}

// ─── Estilos ───────────────────────────────────────────────────────────────────
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

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        backgroundColor: COLORS.background,
        paddingHorizontal: SIZES.padding,
        paddingTop: 60,
        paddingBottom: 40,
    },
    topSection: { alignItems: 'center', marginBottom: 32 },
    logo: { width: 70, height: 70, marginBottom: 8 },
    appName: { fontSize: 20, fontWeight: 'bold', color: COLORS.textPrimary, marginBottom: 6 },
    title: { fontSize: 24, fontWeight: 'bold', color: COLORS.textPrimary },
    button: {
        backgroundColor: COLORS.primary,
        paddingVertical: 16,
        borderRadius: SIZES.borderRadius,
        alignItems: 'center',
        marginTop: 8,
        marginBottom: 24,
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
        elevation: 5,
    },
    buttonDisabled: { backgroundColor: '#B0BEC5', shadowOpacity: 0 },
    buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
    loginRow: { flexDirection: 'row', justifyContent: 'center' },
    loginText: { fontSize: 14, color: COLORS.textSecondary },
    loginLink: { fontSize: 14, color: COLORS.textPrimary, fontWeight: 'bold' },
});
