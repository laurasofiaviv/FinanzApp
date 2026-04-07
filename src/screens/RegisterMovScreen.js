import React, { useState } from 'react';
import {
  View, Text, TextInput, StyleSheet, TouchableOpacity,
  ScrollView, StatusBar, Platform, Modal, FlatList, KeyboardAvoidingView,
} from 'react-native';
import { Calendar } from 'react-native-calendars';
import { Feather } from '@expo/vector-icons';
import { COLORS, SIZES } from '../constants/Colors';
import { useFinanz } from '../context/FinanzContext';

const CATEGORIAS_GASTO = [
  { id: '1', label: 'Alimentación' },
  { id: '2', label: 'Transporte' },
  { id: '3', label: 'Vivienda' },
  { id: '4', label: 'Salud' },
  { id: '5', label: 'Educación' },
  { id: '6', label: 'Entretenimiento' },
  { id: '7', label: 'Ropa' },
  { id: '8', label: 'Tecnología' },
  { id: '9', label: 'Mascotas' },
  { id: '10', label: 'Deudas' },
  { id: '11', label: 'Regalos' },
  { id: '12', label: 'Servicios' },
  { id: '13', label: 'Otros' },
];

const TIPOS_DEUDA = [
  { id: '1', label: 'Tarjeta de crédito' },
  { id: '2', label: 'Préstamo bancario' },
  { id: '3', label: 'Deuda personal' },
  { id: '4', label: 'Arriendo / hipoteca' },
  { id: '5', label: 'Servicio / suscripción' },
  { id: '6', label: 'Otro' },
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

const estadoVacio = () => ({
  montoNum: '',
  montoDisplay: '',
  fechaISO: hoyISO(),
  descripcion: '',
  categoria: null,
  cuotas: '1',
  fechaVencimientoISO: '',
  errors: {},
});

export default function RegisterMovScreen({ navigation }) {
  const { agregarGasto, agregarIngreso, agregarDeuda } = useFinanz();

  const [tab, setTab] = useState('gasto'); 
  const [form, setForm] = useState(estadoVacio());
  const [showCal, setShowCal] = useState(false);
  const [showCalVence, setShowCalVence] = useState(false);
  const [showCat, setShowCat] = useState(false);
  const [guardado, setGuardado] = useState(false);

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

  const validar = () => {
    const e = {};
    if (!form.montoNum || form.montoNum <= 0) e.monto = 'Ingresa un monto válido';
    if (!form.fechaISO) e.fecha = 'Selecciona una fecha';
    if (tab !== 'ingreso' && !form.categoria) e.categoria = 'Selecciona una opción';
    
    if (tab === 'deuda' && !form.fechaVencimientoISO) {
        e.vencimiento = 'Selecciona fecha de pago';
    }

    setForm((prev) => ({ ...prev, errors: e }));
    return Object.keys(e).length === 0;
  };

  const handleGuardar = () => {
    if (!validar()) return;
    const base = {
      monto: form.montoNum,
      montoDisplay: '$' + form.montoDisplay,
      fecha: isoADisplay(form.fechaISO),
    };

    if (tab === 'gasto') agregarGasto({ ...base, categoria: form.categoria?.label, descripcion: form.descripcion });
    if (tab === 'ingreso') agregarIngreso({ ...base, motivo: form.descripcion });
    if (tab === 'deuda') {
      agregarDeuda({ 
        ...base, 
        tipo: form.categoria?.label, 
        descripcion: form.descripcion,
        cuotas: form.cuotas,
        fechaVencimiento: isoADisplay(form.fechaVencimientoISO)
      });
    }

    setGuardado(true);
    setTimeout(() => { setGuardado(false); setForm(estadoVacio()); }, 1400);
  };

  const headerColor = tab === 'ingreso' ? '#2ECC71' : COLORS.primary;
  const catList = tab === 'deuda' ? TIPOS_DEUDA : CATEGORIAS_GASTO;
  const catLabel = tab === 'deuda' ? 'Tipo de deuda' : 'Categoría';

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

      <View style={[styles.header, { backgroundColor: headerColor }]}>
        <Text style={styles.headerTitle}>Nuevo registro</Text>
        <View style={styles.tabRow}>
          {['gasto', 'ingreso', 'deuda'].map((t) => (
            <TouchableOpacity
              key={t}
              style={[styles.tabBtn, tab === t && styles.tabBtnActive]}
              onPress={() => cambiarTab(t)}
            >
              <Text style={[styles.tabBtnText, tab === t && styles.tabBtnTextActive]}>
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <ScrollView style={styles.form} contentContainerStyle={styles.formContent} keyboardShouldPersistTaps="handled">
        
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

        <Text style={[styles.label, { marginTop: 20 }]}>Fecha</Text>
        <TouchableOpacity style={styles.inputRow} onPress={() => setShowCal(true)}>
          <Text style={styles.inputFecha}>{isoADisplay(form.fechaISO)}</Text>
          <Feather name="calendar" size={18} color={COLORS.textLight} style={{ marginRight: 14 }} />
        </TouchableOpacity>

        {tab !== 'ingreso' && (
          <>
            <Text style={[styles.label, { marginTop: 20 }]}>{catLabel}</Text>
            <TouchableOpacity style={[styles.inputRow, form.errors.categoria && styles.inputError]} onPress={() => setShowCat(true)}>
              <Text style={form.categoria ? styles.dropdownSelected : styles.dropdownPlaceholder}>
                {form.categoria ? form.categoria.label : `Selecciona ${catLabel.toLowerCase()}`}
              </Text>
              <Feather name="chevron-down" size={18} color={COLORS.textLight} style={{ marginRight: 14 }} />
            </TouchableOpacity>
          </>
        )}

        {tab === 'deuda' && (
          <View style={{ marginTop: 20 }}>
            <View style={{ flexDirection: 'row', gap: 15 }}>
              <View style={{ flex: 1 }}>
                <Text style={styles.label}>Cuotas</Text>
                <TextInput
                  style={[styles.inputRow, { paddingHorizontal: 16 }]}
                  keyboardType="number-pad"
                  value={form.cuotas}
                  onChangeText={(v) => setField('cuotas', v)}
                />
              </View>
              <View style={{ flex: 2 }}>
                <Text style={styles.label}>Fecha de pago</Text>
                <TouchableOpacity 
                    style={[styles.inputRow, form.errors.vencimiento && styles.inputError]} 
                    onPress={() => setShowCalVence(true)}
                >
                  <Text style={styles.inputFecha}>
                    {form.fechaVencimientoISO ? isoADisplay(form.fechaVencimientoISO) : 'Seleccionar'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}

        <Text style={[styles.label, { marginTop: 20 }]}>Descripción</Text>
        <TextInput
          style={styles.textarea}
          placeholder="Añade una descripción..."
          placeholderTextColor={COLORS.textLight}
          value={form.descripcion}
          onChangeText={(v) => setField('descripcion', v)}
          multiline
        />

        <TouchableOpacity style={[styles.btnPrimary, { backgroundColor: headerColor }]} onPress={handleGuardar}>
          <Text style={styles.btnText}>Registrar {tab}</Text>
        </TouchableOpacity>

      </ScrollView>

      {/* MODAL CALENDARIO */}
      <Modal visible={showCal || showCalVence} transparent animationType="fade">
        <View style={styles.calOverlay}>
          <View style={styles.calSheet}>
            <Calendar
              onDayPress={(day) => {
                if (showCalVence) setField('fechaVencimientoISO', day.dateString);
                else setField('fechaISO', day.dateString);
                setShowCal(false);
                setShowCalVence(false);
              }}
              markedDates={{
                [showCalVence ? form.fechaVencimientoISO : form.fechaISO]: { selected: true, selectedColor: headerColor }
              }}
            />
            <TouchableOpacity onPress={() => { setShowCal(false); setShowCalVence(false); }} style={{ padding: 15, alignItems: 'center' }}>
                <Text style={{ color: COLORS.primary, fontWeight: 'bold' }}>Cerrar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* MODAL CATEGORÍAS */}
      <Modal visible={showCat} transparent animationType="slide">
        <TouchableOpacity style={styles.modalOverlay} onPress={() => setShowCat(false)} />
        <View style={styles.modalSheet}>
          <FlatList
            data={catList}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity 
                style={styles.modalItem} 
                onPress={() => { setField('categoria', item); setShowCat(false); }}
              >
                <Text style={styles.modalItemText}>{item.label}</Text>
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
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 24, paddingHorizontal: SIZES.padding,
    borderBottomLeftRadius: SIZES.headerRadius,
    borderBottomRightRadius: SIZES.headerRadius,
  },
  headerTitle: { color: '#fff', fontSize: 24, fontWeight: 'bold', marginBottom: 16 },
  tabRow: { flexDirection: 'row', gap: 8 },
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
  inputError: { borderColor: COLORS.danger },
  prefix: { paddingLeft: 16, paddingRight: 4, fontSize: 16, color: COLORS.textSecondary },
  inputMonto: { flex: 1, paddingVertical: 14, paddingRight: 16, fontSize: 16, color: COLORS.textPrimary },
  inputFecha: { flex: 1, paddingHorizontal: 16, fontSize: 16, color: COLORS.textPrimary },
  placeholder: { color: COLORS.textLight },
  dropdownPlaceholder: { flex: 1, paddingHorizontal: 16, fontSize: 16, color: COLORS.textLight },
  dropdownSelected: { flex: 1, paddingHorizontal: 16, fontSize: 16, color: COLORS.textPrimary },
  textarea: {
    borderWidth: 1, borderColor: '#E0E0E0',
    borderRadius: SIZES.borderRadius, backgroundColor: '#fff',
    padding: 14, fontSize: 15, color: COLORS.textPrimary, minHeight: 100,
  },
  btnPrimary: {
    borderRadius: SIZES.borderRadius, paddingVertical: 18,
    alignItems: 'center', marginTop: 32, elevation: 5,
  },
  btnText: { color: '#fff', fontSize: 17, fontWeight: 'bold' },
  successContainer: { flex: 1, backgroundColor: COLORS.background, justifyContent: 'center', alignItems: 'center' },
  successIcon: { width: 80, height: 80, borderRadius: 40, justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  successTitle: { fontSize: 24, fontWeight: 'bold' },
  successSub: { fontSize: 15, color: COLORS.textSecondary },
  calOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 },
  calSheet: { backgroundColor: '#fff', borderRadius: 20, overflow: 'hidden' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)' },
  modalSheet: { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, maxHeight: '50%' },
  modalItem: { paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
  modalItemText: { fontSize: 16, color: COLORS.textPrimary }
});