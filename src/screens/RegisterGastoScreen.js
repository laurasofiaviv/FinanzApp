import React, { useState } from 'react';
import {
  View, Text, TextInput, StyleSheet, TouchableOpacity,
  ScrollView, StatusBar, Platform, Modal, FlatList, KeyboardAvoidingView,
} from 'react-native';
import { Calendar } from 'react-native-calendars';
import { Feather } from '@expo/vector-icons';
import { COLORS, SIZES } from '../constants/Colors';
import { useFinanz } from '../context/FinanzContext';

const CATEGORIAS = [
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

// ── Formato de moneda ───────────────────────────────────────────────────────
function formatearMoneda(num) {
  if (num === '' || num === null || num === undefined) return '';
  return Number(num).toLocaleString('es-CO');
}
function parsearMonto(texto) {
  const d = texto.replace(/[^0-9]/g, '');
  return d === '' ? '' : parseInt(d, 10);
}

// ── Fecha: de 'YYYY-MM-DD' a 'DD/MM/YYYY' ──────────────────────────────────
function isoADisplay(isoStr) {
  if (!isoStr) return '';
  const [yyyy, mm, dd] = isoStr.split('-');
  return `${dd}/${mm}/${yyyy}`;
}

// hoy como string ISO para limitar el calendario
function hoyISO() {
  return new Date().toISOString().split('T')[0];
}

// ── Componente principal ─────────────────────────────────────────────────────
export default function RegisterGastoScreen({ navigation }) {
  const { agregarGasto } = useFinanz();

  const [montoNum, setMontoNum]         = useState('');
  const [montoDisplay, setMontoDisplay] = useState('');
  const [fechaISO, setFechaISO]         = useState('');       // 'YYYY-MM-DD'
  const [showCal, setShowCal]           = useState(false);
  const [categoria, setCategoria]       = useState(null);
  const [descripcion, setDescripcion]   = useState('');
  const [modalCat, setModalCat]         = useState(false);
  const [errors, setErrors]             = useState({});
  const [guardado, setGuardado]         = useState(false);

  const handleMontoChange = (texto) => {
    const num = parsearMonto(texto);
    setMontoNum(num);
    setMontoDisplay(num === '' ? '' : formatearMoneda(num));
    setErrors((e) => ({ ...e, monto: null }));
  };

  const onDayPress = (day) => {
    setFechaISO(day.dateString);
    setShowCal(false);
    setErrors((e) => ({ ...e, fecha: null }));
  };

  const validar = () => {
    const e = {};
    if (!montoNum || montoNum <= 0) e.monto     = 'Ingresa un monto válido';
    if (!fechaISO)                  e.fecha     = 'Selecciona una fecha';
    if (!categoria)                 e.categoria = 'Selecciona una categoría';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleGuardar = () => {
    if (!validar()) return;
    agregarGasto({
      monto: montoNum,
      montoDisplay: '$' + montoDisplay,
      fecha: isoADisplay(fechaISO),
      categoria: categoria.label,
      descripcion,
    });
    setGuardado(true);
    setTimeout(() => navigation.goBack(), 1200);
  };

  // ── Pantalla de éxito ───────────────────────────────────────────────────
  if (guardado) {
    return (
      <View style={styles.successContainer}>
        <View style={styles.successIcon}>
          <Feather name="check" size={40} color="#fff" />
        </View>
        <Text style={styles.successTitle}>¡Gasto registrado!</Text>
        <Text style={styles.successSub}>Volviendo al inicio...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <StatusBar barStyle="light-content" />

      {/* ── Header azul ─────────────────────────────────────────────── */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Feather name="arrow-left" size={22} color="#fff" />
        </TouchableOpacity>
        <View style={styles.headerText}>
          <Text style={styles.headerTitle}>Registro de Gastos</Text>
          <Text style={styles.headerSubtitle}>Completa los campos para{'\n'}registrar tu gasto</Text>
        </View>
      </View>

      {/* ── Formulario ──────────────────────────────────────────────── */}
      <ScrollView style={styles.form} contentContainerStyle={styles.formContent} keyboardShouldPersistTaps="handled">

        {/* MONTO */}
        <Text style={styles.label}>Monto</Text>
        <View style={[styles.inputRow, errors.monto && styles.inputError]}>
          <Text style={styles.prefix}>$</Text>
          <TextInput
            style={styles.inputMonto}
            placeholder="0"
            placeholderTextColor={COLORS.textLight}
            keyboardType="number-pad"
            value={montoDisplay}
            onChangeText={handleMontoChange}
          />
        </View>
        {errors.monto ? <Text style={styles.errorText}>{errors.monto}</Text> : null}

        {/* FECHA */}
        <Text style={[styles.label, { marginTop: 20 }]}>Fecha</Text>
        <TouchableOpacity
          style={[styles.inputRow, errors.fecha && styles.inputError]}
          onPress={() => setShowCal(true)}
          activeOpacity={0.8}
        >
          <Text style={[styles.inputFechaText, !fechaISO && styles.placeholder]}>
            {fechaISO ? isoADisplay(fechaISO) : 'dd / mm / aaaa'}
          </Text>
          <Feather name="calendar" size={18} color={COLORS.textLight} style={{ marginRight: 14 }} />
        </TouchableOpacity>
        {errors.fecha ? <Text style={styles.errorText}>{errors.fecha}</Text> : null}

        {/* CATEGORÍA */}
        <Text style={[styles.label, { marginTop: 20 }]}>Categoría</Text>
        <TouchableOpacity
          style={[styles.inputRow, styles.dropdownRow, errors.categoria && styles.inputError]}
          onPress={() => setModalCat(true)}
          activeOpacity={0.8}
        >
          <Text style={categoria ? styles.dropdownSelected : styles.dropdownPlaceholder}>
            {categoria ? categoria.label : 'Selecciona una categoría'}
          </Text>
          <Feather name="chevron-down" size={18} color={COLORS.textLight} style={{ marginRight: 14 }} />
        </TouchableOpacity>
        {errors.categoria ? <Text style={styles.errorText}>{errors.categoria}</Text> : null}

        {/* DESCRIPCIÓN */}
        <Text style={[styles.label, { marginTop: 20 }]}>Descripción</Text>
        <TextInput
          style={styles.textarea}
          placeholder="Añade una descripción (opcional)"
          placeholderTextColor={COLORS.textLight}
          value={descripcion}
          onChangeText={setDescripcion}
          multiline
          numberOfLines={4}
          textAlignVertical="top"
        />

        <TouchableOpacity style={styles.btnPrimary} onPress={handleGuardar} activeOpacity={0.85}>
          <Text style={styles.btnText}>Crear gasto</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* ── Modal: Calendario ────────────────────────────────────────── */}
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
              onDayPress={onDayPress}
              markedDates={fechaISO ? { [fechaISO]: { selected: true, selectedColor: COLORS.primary } } : {}}
              theme={{
                todayTextColor: COLORS.primary,
                selectedDayBackgroundColor: COLORS.primary,
                arrowColor: COLORS.primary,
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

      {/* ── Modal: Categorías ────────────────────────────────────────── */}
      <Modal visible={modalCat} transparent animationType="slide">
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setModalCat(false)} />
        <View style={styles.modalSheet}>
          <View style={styles.modalHandle} />
          <Text style={styles.modalTitle}>Selecciona una categoría</Text>
          <FlatList
            data={CATEGORIAS}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[styles.modalItem, categoria?.id === item.id && styles.modalItemActive]}
                onPress={() => { setCategoria(item); setErrors((e) => ({ ...e, categoria: null })); setModalCat(false); }}
              >
                <Text style={[styles.modalItemText, categoria?.id === item.id && styles.modalItemTextActive]}>
                  {item.label}
                </Text>
                {categoria?.id === item.id && <Feather name="check" size={18} color={COLORS.primary} />}
              </TouchableOpacity>
            )}
          />
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: COLORS.primary,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 30, paddingHorizontal: SIZES.padding,
    borderBottomLeftRadius: SIZES.headerRadius, borderBottomRightRadius: SIZES.headerRadius,
    flexDirection: 'row', alignItems: 'flex-start',
  },
  backBtn: {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center', alignItems: 'center',
    marginTop: 4, marginRight: 14,
  },
  headerText: { flex: 1 },
  headerTitle: { color: '#fff', fontSize: 24, fontWeight: 'bold', marginBottom: 6 },
  headerSubtitle: { color: 'rgba(255,255,255,0.85)', fontSize: 14, lineHeight: 20 },
  form: { flex: 1, backgroundColor: COLORS.background },
  formContent: { paddingHorizontal: SIZES.padding, paddingTop: 28, paddingBottom: 40 },
  label: { fontSize: 15, fontWeight: '600', color: COLORS.textPrimary, marginBottom: 8 },
  inputRow: {
    flexDirection: 'row', alignItems: 'center',
    borderWidth: 1, borderColor: '#E0E0E0',
    borderRadius: SIZES.borderRadius, backgroundColor: '#fff', minHeight: 52,
  },
  inputError: { borderColor: COLORS.danger },
  prefix: { paddingLeft: 16, paddingRight: 4, fontSize: 16, color: COLORS.textSecondary, fontWeight: '500' },
  inputMonto: { flex: 1, paddingVertical: 14, paddingRight: 16, fontSize: 16, color: COLORS.textPrimary },
  inputFechaText: { flex: 1, paddingHorizontal: 16, fontSize: 16, color: COLORS.textPrimary },
  placeholder: { color: COLORS.textLight },
  dropdownRow: { justifyContent: 'space-between' },
  dropdownPlaceholder: { flex: 1, paddingHorizontal: 16, fontSize: 16, color: COLORS.textLight },
  dropdownSelected:    { flex: 1, paddingHorizontal: 16, fontSize: 16, color: COLORS.textPrimary },
  textarea: {
    borderWidth: 1, borderColor: '#E0E0E0',
    borderRadius: SIZES.borderRadius, backgroundColor: '#fff',
    padding: 14, fontSize: 15, color: COLORS.textPrimary, minHeight: 110,
  },
  errorText: { color: COLORS.danger, fontSize: 12, marginTop: 5, marginLeft: 2 },
  btnPrimary: {
    backgroundColor: COLORS.primary, borderRadius: SIZES.borderRadius,
    paddingVertical: 18, alignItems: 'center', marginTop: 32,
    shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 6, elevation: 5,
  },
  btnText: { color: '#fff', fontSize: 17, fontWeight: 'bold' },
  successContainer: { flex: 1, backgroundColor: COLORS.background, justifyContent: 'center', alignItems: 'center' },
  successIcon: {
    width: 80, height: 80, borderRadius: 40, backgroundColor: COLORS.secondary,
    justifyContent: 'center', alignItems: 'center', marginBottom: 20,
  },
  successTitle: { fontSize: 24, fontWeight: 'bold', color: COLORS.textPrimary, marginBottom: 8 },
  successSub: { fontSize: 15, color: COLORS.textSecondary },
  // Calendario
  calOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center', alignItems: 'center', paddingHorizontal: 20,
  },
  calSheet: {
    backgroundColor: '#fff', borderRadius: 20,
    overflow: 'hidden', width: '100%',
    shadowColor: '#000', shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15, shadowRadius: 12, elevation: 10,
  },
  calHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 20, paddingVertical: 16,
    borderBottomWidth: 1, borderBottomColor: '#F0F0F0',
  },
  calTitle: { fontSize: 17, fontWeight: 'bold', color: COLORS.textPrimary },
  // Modal categorías
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)' },
  modalSheet: {
    backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24,
    paddingBottom: 40, maxHeight: '70%',
  },
  modalHandle: {
    width: 40, height: 4, borderRadius: 2, backgroundColor: '#E0E0E0',
    alignSelf: 'center', marginTop: 12, marginBottom: 8,
  },
  modalTitle: {
    fontSize: 17, fontWeight: 'bold', color: COLORS.textPrimary,
    paddingHorizontal: 20, paddingBottom: 12,
    borderBottomWidth: 1, borderBottomColor: '#F0F0F0', marginBottom: 4,
  },
  modalItem: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: 14, paddingHorizontal: 20,
    borderBottomWidth: 1, borderBottomColor: '#F8F8F8',
  },
  modalItemActive: { backgroundColor: '#EEF6FF' },
  modalItemText: { fontSize: 16, color: COLORS.textPrimary },
  modalItemTextActive: { color: COLORS.primary, fontWeight: '600' },
});