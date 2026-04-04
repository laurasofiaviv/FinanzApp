import React, { useState } from 'react';
import {
  View, Text, TextInput, StyleSheet, TouchableOpacity,
  ScrollView, StatusBar, Platform, Modal, FlatList, KeyboardAvoidingView,
} from 'react-native';
import { Calendar } from 'react-native-calendars';
import { Feather }  from '@expo/vector-icons';
import { COLORS, SIZES } from '../constants/Colors';
import { useFinanz } from '../context/FinanzContext';

const CATEGORIAS_GASTO = [
  { id: '1',  label: '🍔 Alimentación' },
  { id: '2',  label: '🚌 Transporte' },
  { id: '3',  label: '🏠 Vivienda' },
  { id: '4',  label: '💊 Salud' },
  { id: '5',  label: '📚 Educación' },
  { id: '6',  label: '🎮 Entretenimiento' },
  { id: '7',  label: '👕 Ropa' },
  { id: '8',  label: '📱 Tecnología' },
  { id: '9',  label: '🐾 Mascotas' },
  { id: '10', label: '💳 Deudas' },
  { id: '11', label: '🎁 Regalos' },
  { id: '12', label: '🔧 Servicios' },
  { id: '13', label: '📦 Otros' },
];

const TIPOS_DEUDA = [
  { id: '1', label: '💳 Tarjeta de crédito' },
  { id: '2', label: '🏦 Préstamo bancario' },
  { id: '3', label: '👤 Deuda personal' },
  { id: '4', label: '🏠 Arriendo / hipoteca' },
  { id: '5', label: '📱 Servicio / suscripción' },
  { id: '6', label: '📦 Otro' },
];

function fmt(num) {
  if (num === '' || num === null || num === undefined) return '';
  return Number(num).toLocaleString('es-CO');
}
function parsear(texto) {
  const d = texto.replace(/[^0-9]/g, '');
  return d === '' ? '' : parseInt(d, 10);
}
function isoADisplay(iso) {
  if (!iso) return '';
  const [y, m, d] = iso.split('-');
  return `${d}/${m}/${y}`;
}
function hoyISO() {
  return new Date().toISOString().split('T')[0];
}

// ── Estado vacío por tipo ──────────────────────────────────────────────────
const estadoVacio = () => ({
  montoNum: '',
  montoDisplay: '',
  fechaISO: '',
  descripcion: '',
  categoria: null,
  errors: {},
});

export default function RegisterMovScreen({ navigation }) {
  const { agregarGasto, agregarIngreso, agregarDeuda } = useFinanz();

  const [tab, setTab]         = useState('gasto'); // 'gasto' | 'ingreso' | 'deuda'
  const [form, setForm]       = useState(estadoVacio());
  const [showCal, setShowCal] = useState(false);
  const [showCat, setShowCat] = useState(false);
  const [guardado, setGuardado] = useState(false);

  // ── Helpers de formulario ──────────────────────────────────────────────
  const setField = (key, val) => {
    setForm((prev) => ({ ...prev, [key]: val, errors: { ...prev.errors, [key]: null } }));
  };

  const handleMonto = (texto) => {
    const num = parsear(texto);
    setForm((prev) => ({
      ...prev,
      montoNum: num,
      montoDisplay: num === '' ? '' : fmt(num),
      errors: { ...prev.errors, monto: null },
    }));
  };

  const cambiarTab = (t) => {
    setTab(t);
    setForm(estadoVacio());
  };

  // ── Validación ─────────────────────────────────────────────────────────
  const validar = () => {
    const e = {};
    if (!form.montoNum || form.montoNum <= 0) e.monto = 'Ingresa un monto válido';
    if (!form.fechaISO)                       e.fecha = 'Selecciona una fecha';
    if (tab === 'gasto' && !form.categoria)   e.categoria = 'Selecciona una categoría';
    if (tab === 'deuda' && !form.categoria)   e.categoria = 'Selecciona un tipo de deuda';
    setForm((prev) => ({ ...prev, errors: e }));
    return Object.keys(e).length === 0;
  };

  // ── Guardar ────────────────────────────────────────────────────────────
  const handleGuardar = () => {
    if (!validar()) return;
    const base = {
      monto: form.montoNum,
      montoDisplay: '$' + form.montoDisplay,
      fecha: isoADisplay(form.fechaISO),
    };
    if (tab === 'gasto')   agregarGasto({ ...base, categoria: form.categoria?.label, descripcion: form.descripcion });
    if (tab === 'ingreso') agregarIngreso({ ...base, motivo: form.descripcion });
    if (tab === 'deuda')   agregarDeuda({ ...base, tipo: form.categoria?.label, descripcion: form.descripcion });
    setGuardado(true);
    setTimeout(() => { setGuardado(false); setForm(estadoVacio()); }, 1400);
  };

  const headerColor = tab === 'ingreso' ? '#2ECC71' : COLORS.primary;
  const catList     = tab === 'deuda' ? TIPOS_DEUDA : CATEGORIAS_GASTO;
  const catLabel    = tab === 'deuda' ? 'Tipo de deuda' : 'Categoría';

  // ── Pantalla de éxito ──────────────────────────────────────────────────
  if (guardado) {
    const msgs = { gasto: '¡Gasto registrado!', ingreso: '¡Ingreso registrado!', deuda: '¡Deuda registrada!' };
    return (
      <View style={styles.successContainer}>
        <View style={[styles.successIcon, { backgroundColor: headerColor }]}>
          <Feather name="check" size={40} color="#fff" />
        </View>
        <Text style={styles.successTitle}>{msgs[tab]}</Text>
        <Text style={styles.successSub}>Listo</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <StatusBar barStyle="light-content" />

      {/* ── Header con selector de tipo ── */}
      <View style={[styles.header, { backgroundColor: headerColor }]}>
        <Text style={styles.headerTitle}>Nuevo registro</Text>
        <View style={styles.tabRow}>
          {[
            { key: 'gasto',   label: 'Gasto' },
            { key: 'ingreso', label: 'Ingreso' },
            { key: 'deuda',   label: 'Deuda' },
          ].map((t) => (
            <TouchableOpacity
              key={t.key}
              style={[styles.tabBtn, tab === t.key && styles.tabBtnActive]}
              onPress={() => cambiarTab(t.key)}
            >
              <Text style={[styles.tabBtnText, tab === t.key && styles.tabBtnTextActive]}>
                {t.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* ── Formulario ── */}
      <ScrollView style={styles.form} contentContainerStyle={styles.formContent} keyboardShouldPersistTaps="handled">

        {/* MONTO */}
        <Text style={styles.label}>Monto</Text>
        <View style={[styles.inputRow, form.errors.monto && styles.inputError]}>
          <Text style={styles.prefix}>$</Text>
          <TextInput
            style={styles.inputMonto}
            placeholder="0"
            placeholderTextColor={COLORS.textLight}
            keyboardType="number-pad"
            value={form.montoDisplay}
            onChangeText={handleMonto}
          />
        </View>
        {form.errors.monto ? <Text style={styles.errorText}>{form.errors.monto}</Text> : null}

        {/* FECHA */}
        <Text style={[styles.label, { marginTop: 20 }]}>Fecha</Text>
        <TouchableOpacity
          style={[styles.inputRow, form.errors.fecha && styles.inputError]}
          onPress={() => setShowCal(true)}
          activeOpacity={0.8}
        >
          <Text style={[styles.inputFecha, !form.fechaISO && styles.placeholder]}>
            {form.fechaISO ? isoADisplay(form.fechaISO) : 'dd / mm / aaaa'}
          </Text>
          <Feather name="calendar" size={18} color={COLORS.textLight} style={{ marginRight: 14 }} />
        </TouchableOpacity>
        {form.errors.fecha ? <Text style={styles.errorText}>{form.errors.fecha}</Text> : null}

        {/* CATEGORÍA / TIPO (solo para gasto y deuda) */}
        {tab !== 'ingreso' && (
          <>
            <Text style={[styles.label, { marginTop: 20 }]}>{catLabel}</Text>
            <TouchableOpacity
              style={[styles.inputRow, styles.rowSpace, form.errors.categoria && styles.inputError]}
              onPress={() => setShowCat(true)}
              activeOpacity={0.8}
            >
              <Text style={form.categoria ? styles.dropdownSelected : styles.dropdownPlaceholder}>
                {form.categoria ? form.categoria.label : `Selecciona ${catLabel.toLowerCase()}`}
              </Text>
              <Feather name="chevron-down" size={18} color={COLORS.textLight} style={{ marginRight: 14 }} />
            </TouchableOpacity>
            {form.errors.categoria ? <Text style={styles.errorText}>{form.errors.categoria}</Text> : null}
          </>
        )}

        {/* DESCRIPCIÓN / MOTIVO */}
        <Text style={[styles.label, { marginTop: 20 }]}>
          {tab === 'ingreso' ? 'Motivo del ingreso' : 'Descripción'}
        </Text>
        <TextInput
          style={styles.textarea}
          placeholder={
            tab === 'ingreso'
              ? 'Ej: salario, freelance, venta... (opcional)'
              : tab === 'deuda'
              ? 'Ej: cuota Bancolombia, deuda con Juan... (opcional)'
              : 'Añade una descripción (opcional)'
          }
          placeholderTextColor={COLORS.textLight}
          value={form.descripcion}
          onChangeText={(v) => setField('descripcion', v)}
          multiline
          numberOfLines={3}
          textAlignVertical="top"
        />

        <TouchableOpacity
          style={[styles.btnPrimary, { backgroundColor: headerColor }]}
          onPress={handleGuardar}
          activeOpacity={0.85}
        >
          <Text style={styles.btnText}>
            {tab === 'gasto' ? 'Registrar gasto' : tab === 'ingreso' ? 'Registrar ingreso' : 'Registrar deuda'}
          </Text>
        </TouchableOpacity>

      </ScrollView>

      {/* ── Modal: Calendario ── */}
      <Modal visible={showCal} transparent animationType="fade">
        <View style={styles.calOverlay}>
          <View style={styles.calSheet}>
            <View style={styles.calHeader}>
              <Text style={styles.calTitle}>Selecciona una fecha</Text>
              <TouchableOpacity onPress={() => setShowCal(false)}>
                <Feather name="x" size={22} color={COLORS.textPrimary} />
              </TouchableOpacity>
            </View>
            <Calendar
              maxDate={hoyISO()}
              onDayPress={(day) => { setField('fechaISO', day.dateString); setShowCal(false); }}
              markedDates={form.fechaISO ? { [form.fechaISO]: { selected: true, selectedColor: headerColor } } : {}}
              theme={{
                todayTextColor: headerColor,
                selectedDayBackgroundColor: headerColor,
                arrowColor: headerColor,
                textSectionTitleColor: COLORS.textSecondary,
                dayTextColor: COLORS.textPrimary,
                textDisabledColor: '#D0D0D0',
                monthTextColor: COLORS.textPrimary,
                textMonthFontWeight: 'bold',
                textDayFontSize: 15,
                textMonthFontSize: 16,
              }}
            />
          </View>
        </View>
      </Modal>

      {/* ── Modal: Categorías / Tipos ── */}
      <Modal visible={showCat} transparent animationType="slide">
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setShowCat(false)} />
        <View style={styles.modalSheet}>
          <View style={styles.modalHandle} />
          <Text style={styles.modalTitle}>
            {tab === 'deuda' ? 'Tipo de deuda' : 'Categoría de gasto'}
          </Text>
          <FlatList
            data={catList}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => {
              const activo = form.categoria?.id === item.id;
              return (
                <TouchableOpacity
                  style={[styles.modalItem, activo && { backgroundColor: '#EEF6FF' }]}
                  onPress={() => { setField('categoria', item); setShowCat(false); }}
                >
                  <Text style={[styles.modalItemText, activo && { color: COLORS.primary, fontWeight: '600' }]}>
                    {item.label}
                  </Text>
                  {activo && <Feather name="check" size={18} color={COLORS.primary} />}
                </TouchableOpacity>
              );
            }}
          />
        </View>
      </Modal>

    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 24, paddingHorizontal: SIZES.padding,
    borderBottomLeftRadius: SIZES.headerRadius,
    borderBottomRightRadius: SIZES.headerRadius,
  },
  headerTitle: { color: '#fff', fontSize: 24, fontWeight: 'bold', marginBottom: 16 },
  tabRow: {
    flexDirection: 'row', gap: 8,
  },
  tabBtn: {
    flex: 1, paddingVertical: 8, borderRadius: 20,
    alignItems: 'center', borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.5)',
  },
  tabBtnActive: { backgroundColor: '#fff' },
  tabBtnText: { fontSize: 14, color: 'rgba(255,255,255,0.85)', fontWeight: '600' },
  tabBtnTextActive: { color: COLORS.primary },
  form: { flex: 1, backgroundColor: COLORS.background },
  formContent: { paddingHorizontal: SIZES.padding, paddingTop: 28, paddingBottom: 40 },
  label: { fontSize: 15, fontWeight: '600', color: COLORS.textPrimary, marginBottom: 8 },
  inputRow: {
    flexDirection: 'row', alignItems: 'center',
    borderWidth: 1, borderColor: '#E0E0E0',
    borderRadius: SIZES.borderRadius, backgroundColor: '#fff', minHeight: 52,
  },
  rowSpace: { justifyContent: 'space-between' },
  inputError: { borderColor: COLORS.danger },
  prefix: { paddingLeft: 16, paddingRight: 4, fontSize: 16, color: COLORS.textSecondary, fontWeight: '500' },
  inputMonto: { flex: 1, paddingVertical: 14, paddingRight: 16, fontSize: 16, color: COLORS.textPrimary },
  inputFecha: { flex: 1, paddingHorizontal: 16, fontSize: 16, color: COLORS.textPrimary },
  placeholder: { color: COLORS.textLight },
  dropdownPlaceholder: { flex: 1, paddingHorizontal: 16, fontSize: 16, color: COLORS.textLight },
  dropdownSelected:    { flex: 1, paddingHorizontal: 16, fontSize: 16, color: COLORS.textPrimary },
  textarea: {
    borderWidth: 1, borderColor: '#E0E0E0',
    borderRadius: SIZES.borderRadius, backgroundColor: '#fff',
    padding: 14, fontSize: 15, color: COLORS.textPrimary, minHeight: 100,
  },
  errorText: { color: COLORS.danger, fontSize: 12, marginTop: 5, marginLeft: 2 },
  btnPrimary: {
    borderRadius: SIZES.borderRadius, paddingVertical: 18,
    alignItems: 'center', marginTop: 32,
    shadowOpacity: 0.3, shadowRadius: 6,
    shadowOffset: { width: 0, height: 4 }, elevation: 5,
  },
  btnText: { color: '#fff', fontSize: 17, fontWeight: 'bold' },
  successContainer: { flex: 1, backgroundColor: COLORS.background, justifyContent: 'center', alignItems: 'center' },
  successIcon: { width: 80, height: 80, borderRadius: 40, justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  successTitle: { fontSize: 24, fontWeight: 'bold', color: COLORS.textPrimary, marginBottom: 8 },
  successSub: { fontSize: 15, color: COLORS.textSecondary },
  calOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', paddingHorizontal: 20 },
  calSheet: { backgroundColor: '#fff', borderRadius: 20, overflow: 'hidden', width: '100%' },
  calHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 20, paddingVertical: 16,
    borderBottomWidth: 1, borderBottomColor: '#F0F0F0',
  },
  calTitle: { fontSize: 17, fontWeight: 'bold', color: COLORS.textPrimary },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)' },
  modalSheet: { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingBottom: 40, maxHeight: '70%' },
  modalHandle: { width: 40, height: 4, borderRadius: 2, backgroundColor: '#E0E0E0', alignSelf: 'center', marginTop: 12, marginBottom: 8 },
  modalTitle: { fontSize: 17, fontWeight: 'bold', color: COLORS.textPrimary, paddingHorizontal: 20, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: '#F0F0F0', marginBottom: 4 },
  modalItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 20, borderBottomWidth: 1, borderBottomColor: '#F8F8F8' },
  modalItemText: { fontSize: 16, color: COLORS.textPrimary },
});