import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { COLORS, SIZES } from '../constants/Colors';
import { useFinanz } from '../context/FinanzContext';

// ── Color verde para ingresos ────────────────────────────────────────────────
const GREEN = '#2ECC71';
const GREEN_DARK = '#27AE60';

// ── Helpers (mismos que en RegisterGasto) ───────────────────────────────────
function formatearMonto(texto) {
  const limpio = texto.replace(/[^0-9.]/g, '');
  const partes = limpio.split('.');
  if (partes.length > 2) return partes[0] + '.' + partes.slice(1).join('');
  return limpio;
}

function formatearFecha(texto) {
  const solo = texto.replace(/\D/g, '').slice(0, 8);
  if (solo.length <= 2) return solo;
  if (solo.length <= 4) return `${solo.slice(0, 2)}/${solo.slice(2)}`;
  return `${solo.slice(0, 2)}/${solo.slice(2, 4)}/${solo.slice(4)}`;
}

function fechaEsValida(texto) {
  if (texto.length !== 10) return false;
  const [dd, mm, aaaa] = texto.split('/').map(Number);
  if (!dd || !mm || !aaaa) return false;
  if (mm < 1 || mm > 12) return false;
  if (dd < 1 || dd > 31) return false;
  if (aaaa < 1900 || aaaa > 2100) return false;
  return true;
}

// ── Componente principal ─────────────────────────────────────────────────────
export default function RegisterIngresoScreen({ navigation }) {
  const { agregarIngreso } = useFinanz();

  const [monto, setMonto]   = useState('');
  const [fecha, setFecha]   = useState('');
  const [motivo, setMotivo] = useState('');
  const [errors, setErrors] = useState({});
  const [guardado, setGuardado] = useState(false);

  // ── Validación ──────────────────────────────────────────────────────────
  const validar = () => {
    const e = {};
    if (!monto || parseFloat(monto) <= 0) e.monto = 'Ingresa un monto válido';
    if (!fecha || !fechaEsValida(fecha))   e.fecha = 'Ingresa una fecha válida (dd/mm/aaaa)';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // ── Guardar ─────────────────────────────────────────────────────────────
  const handleGuardar = () => {
    if (!validar()) return;
    agregarIngreso({ monto, fecha, motivo });
    setGuardado(true);
    setTimeout(() => {
      navigation.goBack();
    }, 1200);
  };

  // ── Pantalla de éxito ───────────────────────────────────────────────────
  if (guardado) {
    return (
      <View style={styles.successContainer}>
        <View style={styles.successIcon}>
          <Feather name="check" size={40} color="#fff" />
        </View>
        <Text style={styles.successTitle}>¡Ingreso registrado!</Text>
        <Text style={styles.successSub}>Volviendo al inicio...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <StatusBar barStyle="light-content" />

      {/* ── Header verde ──────────────────────────────────────────────── */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Feather name="arrow-left" size={22} color="#fff" />
        </TouchableOpacity>
        <View style={styles.headerText}>
          <Text style={styles.headerTitle}>Registro de Ingresos</Text>
          <Text style={styles.headerSubtitle}>Completa los campos para{'\n'}registrar tu ingreso</Text>
        </View>
      </View>

      {/* ── Formulario ────────────────────────────────────────────────── */}
      <ScrollView
        style={styles.form}
        contentContainerStyle={styles.formContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Monto */}
        <Text style={styles.label}>Monto</Text>
        <View style={[styles.inputRow, errors.monto && styles.inputError]}>
          <Text style={styles.prefix}>$</Text>
          <TextInput
            style={styles.inputMonto}
            placeholder="0"
            placeholderTextColor={COLORS.textLight}
            keyboardType="decimal-pad"
            value={monto}
            onChangeText={(t) => {
              setMonto(formatearMonto(t));
              setErrors((e) => ({ ...e, monto: null }));
            }}
          />
        </View>
        {errors.monto ? <Text style={styles.errorText}>{errors.monto}</Text> : null}

        {/* Fecha */}
        <Text style={[styles.label, { marginTop: 20 }]}>Fecha</Text>
        <View style={[styles.inputRow, errors.fecha && styles.inputError]}>
          <TextInput
            style={styles.inputFecha}
            placeholder="dd / mm / aaaa"
            placeholderTextColor={COLORS.textLight}
            keyboardType="number-pad"
            value={fecha}
            onChangeText={(t) => {
              setFecha(formatearFecha(t));
              setErrors((e) => ({ ...e, fecha: null }));
            }}
            maxLength={10}
          />
          <Feather name="calendar" size={18} color={COLORS.textLight} style={{ marginRight: 14 }} />
        </View>
        {errors.fecha ? <Text style={styles.errorText}>{errors.fecha}</Text> : null}

        {/* Motivo (opcional) */}
        <Text style={[styles.label, { marginTop: 20 }]}>Motivo del ingreso</Text>
        <TextInput
          style={styles.textarea}
          placeholder="Ej: salario, freelance, venta... (opcional)"
          placeholderTextColor={COLORS.textLight}
          value={motivo}
          onChangeText={setMotivo}
          multiline
          numberOfLines={4}
          textAlignVertical="top"
        />

        {/* Botón */}
        <TouchableOpacity style={styles.btnPrimary} onPress={handleGuardar} activeOpacity={0.85}>
          <Text style={styles.btnText}>Registrar ingreso</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// ── Estilos ──────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  // Header
  header: {
    backgroundColor: GREEN,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 30,
    paddingHorizontal: SIZES.padding,
    borderBottomLeftRadius: SIZES.headerRadius,
    borderBottomRightRadius: SIZES.headerRadius,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255,255,255,0.25)',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 4,
    marginRight: 14,
  },
  headerText: { flex: 1 },
  headerTitle: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  headerSubtitle: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 14,
    lineHeight: 20,
  },

  // Formulario
  form: { flex: 1, backgroundColor: COLORS.background },
  formContent: {
    paddingHorizontal: SIZES.padding,
    paddingTop: 28,
    paddingBottom: 40,
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 8,
  },

  // Inputs
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: SIZES.borderRadius,
    backgroundColor: '#fff',
    minHeight: 52,
  },
  inputError: { borderColor: COLORS.danger },
  prefix: {
    paddingLeft: 16,
    paddingRight: 4,
    fontSize: 16,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  inputMonto: {
    flex: 1,
    paddingVertical: 14,
    paddingRight: 16,
    fontSize: 16,
    color: COLORS.textPrimary,
  },
  inputFecha: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: COLORS.textPrimary,
  },

  // Textarea
  textarea: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: SIZES.borderRadius,
    backgroundColor: '#fff',
    padding: 14,
    fontSize: 15,
    color: COLORS.textPrimary,
    minHeight: 110,
  },

  // Error
  errorText: { color: COLORS.danger, fontSize: 12, marginTop: 5, marginLeft: 2 },

  // Botón
  btnPrimary: {
    backgroundColor: GREEN,
    borderRadius: SIZES.borderRadius,
    paddingVertical: 18,
    alignItems: 'center',
    marginTop: 32,
    shadowColor: GREEN_DARK,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
  },
  btnText: { color: '#fff', fontSize: 17, fontWeight: 'bold' },

  // Éxito
  successContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  successIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: GREEN,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  successSub: { fontSize: 15, color: COLORS.textSecondary },
});