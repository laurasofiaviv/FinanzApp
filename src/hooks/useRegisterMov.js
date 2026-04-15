//hooks/useTegisterMov.js
import { useState } from 'react';
import { Animated } from 'react-native';
import { useFinanz } from '../context/FinanzContext';

// ── Helpers puros (sin dependencias de React) ─────────────────────────────
export function fmt(num) {
  if (num === '' || num == null) return '';
  return Number(num).toLocaleString('es-CO');
}
export function parsear(texto) {
  const d = texto.replace(/[^0-9]/g, '');
  return d === '' ? '' : parseInt(d, 10);
}
export function isoADisplay(iso) {
  if (!iso) return '';
  const [y, m, d] = iso.split('-');
  return `${d}/${m}/${y}`;
}
export function hoyISO() {
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

// ── Hook principal ────────────────────────────────────────────────────────
export function useRegisterMov() {
  const { agregarGasto, agregarIngreso, agregarDeuda, productos } = useFinanz();

  const [tab, setTab] = useState('gasto');
  const [form, setForm] = useState(estadoVacio());
  const [esRecurrente, setEsRecurrente] = useState(false);
  const [frecuencia, setFrecuencia] = useState('mensual');
  const [modo, setModo] = useState('auto');
  const [tarjetaSeleccionada, setTarjetaSeleccionada] = useState(null);
  const [guardado, setGuardado] = useState(false);
  const [toast, setToast] = useState(null);
  const [shakeAnim] = useState(new Animated.Value(0));

  const setField = (key, val) =>
    setForm(prev => ({ ...prev, [key]: val, errors: { ...prev.errors, [key]: null } }));

  const handleMonto = (texto) => {
    const num = parsear(texto);
    setForm(prev => ({
      ...prev,
      montoNum: num,
      montoDisplay: num === '' ? '' : fmt(num),
      errors: { ...prev.errors, monto: null },
    }));
  };

  const cambiarTab = (t) => {
    setTab(t);
    setForm(estadoVacio());
    setTarjetaSeleccionada(null);
  };

  const validar = () => {
    const e = {};
    if (!form.montoNum || form.montoNum <= 0) e.monto = 'Ingresa un monto válido';
    if (!form.fechaISO) e.fecha = 'Selecciona una fecha';
    if (tab !== 'ingreso' && !form.categoria) e.categoria = 'Selecciona una opción';
    if (tab === 'deuda' && !form.fechaVencimientoISO) e.vencimiento = 'Selecciona fecha de pago';
    setForm(prev => ({ ...prev, errors: e }));
    return Object.keys(e).length === 0;
  };

  const triggerShake = () => {
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 10,  duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 6,   duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -6,  duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0,   duration: 50, useNativeDriver: true }),
    ]).start();
  };

  const handleGuardar = () => {
    if (!validar()) return;

    const base = {
      monto: form.montoNum,
      montoDisplay: '$' + form.montoDisplay,
      fecha: isoADisplay(form.fechaISO),
    };
    const recurrenteData = esRecurrente ? { frecuencia, modo } : null;
    let resultado = true;

    if (tab === 'gasto') {
      resultado = agregarGasto({
        ...base,
        categoria: form.categoria?.label,
        descripcion: form.descripcion,
        recurrente: recurrenteData,
        productoId: tarjetaSeleccionada?.id ?? null,
        pagoConTarjeta: tarjetaSeleccionada?.nombre ?? null,
      });
    } else if (tab === 'ingreso') {
      agregarIngreso({
        ...base,
        motivo: form.descripcion,
        recurrente: recurrenteData,
        productoId: tarjetaSeleccionada?.id ?? null,
      });
    } else if (tab === 'deuda') {
      agregarDeuda({
        ...base,
        tipo: form.categoria?.label,
        descripcion: form.descripcion,
        cuotas: form.cuotas,
        fechaVencimiento: isoADisplay(form.fechaVencimientoISO),
      });
    }

    if (!resultado) {
      setToast('Transacción rechazada: saldo insuficiente');
      triggerShake();
      setTimeout(() => setToast(null), 2500);
      return;
    }

    setGuardado(true);
    setTimeout(() => {
      setGuardado(false);
      setForm(estadoVacio());
      setTarjetaSeleccionada(null);
    }, 1400);
  };

  return {
    // estado
    tab, form, esRecurrente, frecuencia, modo,
    tarjetaSeleccionada, guardado, toast, shakeAnim,
    productos,
    // setters
    setField, handleMonto, cambiarTab,
    setEsRecurrente, setFrecuencia, setModo,
    setTarjetaSeleccionada,
    // acciones
    handleGuardar,
    // helpers de display (los necesita la UI)
    isoADisplay,
  };
}