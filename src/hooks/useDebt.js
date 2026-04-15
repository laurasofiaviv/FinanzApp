// hooks/useDebt.js
import { useState } from 'react';
import { useFinanz } from '../context/FinanzContext';

// ── HELPERS PUROS ─────────────────────────────────────────────────────────
export function fmt(n) {
  if (!n && n !== 0) return '0';
  return Number(n).toLocaleString('es-CO');
}
export function parsear(t) {
  const d = String(t).replace(/[^0-9]/g, '');
  return d === '' ? '' : parseInt(d, 10);
}
export function hoyISO() {
  return new Date().toISOString().split('T')[0];
}
export function isoADisplay(iso) {
  if (!iso) return '';
  const [y, m, d] = iso.split('-');
  return `${d}/${m}/${y}`;
}

// ── CONFIGURACIÓN POR TIPO ────────────────────────────────────────────────
export const TIPOS_CONFIG = {
  'Tarjeta de crédito': {
    icon: 'credit-card',
    color: '#2D6BE4',           // COLORS.primary — ajustá si usás token
    campos: ['tarjeta', 'interes', 'pagoMinimo'],
    desc: 'Interés rotativo mensual',
  },
  'Préstamo bancario': {
    icon: 'home',
    color: '#8E44AD',
    campos: ['interes', 'cuotas', 'fechaInicio'],
    desc: 'Cuota fija calculada',
  },
  'Deuda personal': {
    icon: 'user',
    color: '#E67E22',
    campos: ['interes', 'fechaVencimiento'],
    desc: 'Sin interés o configurable',
  },
  'Arriendo / hipoteca': {
    icon: 'home',
    color: '#27AE60',
    campos: ['valorMensual', 'diaPago'],
    desc: 'Pago periódico fijo',
  },
  'Servicio / suscripción': {
    icon: 'refresh-cw',
    color: '#E74C3C',
    campos: ['diaPago'],
    desc: 'Recurrente sin interés',
  },
  Otro: {
    icon: 'more-horizontal',
    color: '#999',
    campos: ['interes', 'fechaVencimiento'],
    desc: 'Configurable',
  },
};

export const TIPOS_LIST = Object.keys(TIPOS_CONFIG);

// ── CÁLCULO FINANCIERO (puro — sin estado) ────────────────────────────────
export function calcularResumen(tipo, form) {
  const monto   = parseFloat(form.montoNum)   || 0;
  const interes = parseFloat(form.interes)    || 0;
  const cuotas  = parseInt(form.cuotas)       || 1;

  if (tipo === 'Tarjeta de crédito') {
    const nuevoSaldo = monto * (1 + interes / 100);
    const pagoMin    = parseFloat(form.pagoMinimo) || monto * 0.05;
    return {
      label: 'Saldo próximo mes',
      valor: `$${fmt(Math.round(nuevoSaldo))}`,
      extra: `Pago mínimo: $${fmt(Math.round(pagoMin))}`,
    };
  }
  if (tipo === 'Préstamo bancario' && interes > 0 && cuotas > 0) {
    const r     = interes / 100;
    const cuota = monto * (r * Math.pow(1 + r, cuotas)) / (Math.pow(1 + r, cuotas) - 1);
    return {
      label: 'Cuota mensual estimada',
      valor: `$${fmt(Math.round(cuota))}`,
      extra: `Total a pagar: $${fmt(Math.round(cuota * cuotas))}`,
    };
  }
  if (tipo === 'Arriendo / hipoteca') {
    return {
      label: 'Pago mensual',
      valor: `$${fmt(monto)}`,
      extra: `Día de pago: ${form.diaPago || '—'}`,
    };
  }
  return null;
}

// ── ESTADO INICIAL DEL FORMULARIO ─────────────────────────────────────────
const formVacio = () => ({
  descripcion:      '',
  montoNum:         '',
  montoDisplay:     '',
  interes:          '',
  cuotas:           '',
  fechaVencimiento: '',
  fechaInicio:      '',
  diaPago:          '',
  pagoMinimo:       '',
  pagoMinimoDisplay:'',
  tarjetaId:        null,
  tarjetaNombre:    null,
  cupoDisponible:   0,
});

// ── HOOK PRINCIPAL ────────────────────────────────────────────────────────
export function useDebt() {
  const { deudas, agregarDeuda, pagarCuota, productos } = useFinanz();

  // Lista de tarjetas de crédito disponibles en Productos
  const tarjetas = (productos || []).filter((p) => p.tipo === 'credito');

  // ── Estado de UI ──────────────────────────────────────────────────────
  const [showForm,        setShowForm]        = useState(false);
  const [showTipos,       setShowTipos]       = useState(false);
  const [showModalAbonar, setShowModalAbonar] = useState(false);

  const [tipoSeleccionado, setTipoSeleccionado] = useState(null);
  const [form,             setFormState]         = useState(formVacio());
  const [errors,           setErrors]            = useState({});
  const [deudaAbonar,      setDeudaAbonar]       = useState(null);

  // ── Helpers de form ───────────────────────────────────────────────────
  const setField = (k, v) => setFormState((prev) => ({ ...prev, [k]: v }));

  const resetForm = () => {
    setTipoSeleccionado(null);
    setFormState(formVacio());
    setErrors({});
  };

  // ── Selección de tipo ─────────────────────────────────────────────────
  const seleccionarTipo = (tipo) => {
    setTipoSeleccionado(tipo);
    // Conservamos solo la descripción al cambiar tipo
    setFormState({ ...formVacio(), descripcion: form.descripcion });
    setShowTipos(false);
  };

  // ── Validación ────────────────────────────────────────────────────────
  const validar = () => {
    const e = {};
    if (!form.montoNum || form.montoNum <= 0) e.monto = 'Ingresa un monto';
    if (!tipoSeleccionado)                    e.tipo  = 'Selecciona un tipo';

    if (tipoSeleccionado === 'Tarjeta de crédito' && form.tarjetaId) {
      if (form.cupoDisponible < form.montoNum) {
        e.monto = 'El monto supera el cupo disponible';
      }
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // ── Guardar deuda ─────────────────────────────────────────────────────
  const handleGuardar = () => {
    if (!validar()) return;

    agregarDeuda({
      tipo:            tipoSeleccionado,
      descripcion:     form.descripcion || '',
      monto:           form.montoNum,
      montoDisplay:    '$' + (form.montoDisplay || fmt(form.montoNum)),
      fecha:           isoADisplay(hoyISO()),
      interes:         form.interes      || '0',
      cuotas:          form.cuotas       || '1',
      fechaVencimiento:form.fechaVencimiento || '',
      diaPago:         form.diaPago      || '',
      tarjetaId:       form.tarjetaId    || null,
      tarjetaNombre:   form.tarjetaNombre|| null,
      pagoMinimo:      form.pagoMinimo   || 0,
    });

    resetForm();
    setShowForm(false);
  };

  // ── Abonar ────────────────────────────────────────────────────────────
  const abrirModalAbonar = (deuda) => {
    setDeudaAbonar(deuda);
    setShowModalAbonar(true);
  };

  const handleAbonar = (productoId) => {
    if (!deudaAbonar) return;
    pagarCuota(deudaAbonar.id, productoId);
    setShowModalAbonar(false);
    setDeudaAbonar(null);
  };

  const cancelarAbonar = () => {
    setShowModalAbonar(false);
    setDeudaAbonar(null);
  };

  // ── Montos para modal de abono ────────────────────────────────────────
  const montoCuotaDeuda = (deuda) => {
    if (!deuda) return 0;
    if (!deuda.cuotas || parseInt(deuda.cuotas) <= 1) {
      return deuda.monto - (deuda.montoPagado || 0);
    }
    return deuda.monto / parseInt(deuda.cuotas);
  };

  // ── Derivaciones de deudas ────────────────────────────────────────────
  const deudasPendientes = deudas.filter((d) => (d.montoPagado || 0) < d.monto);
  const deudasPagadas    = deudas.filter((d) => (d.montoPagado || 0) >= d.monto);
  const totalPendiente   = deudasPendientes.reduce(
    (acc, d) => acc + parseFloat(d.monto || 0) - parseFloat(d.montoPagado || 0),
    0,
  );

  // Resumen financiero para el formulario activo
  const resumenFinanciero =
    tipoSeleccionado && form.montoNum
      ? calcularResumen(tipoSeleccionado, form)
      : null;

  return {
    // ── datos ──────────────────────────────────────────────────────────
    deudasPendientes,
    deudasPagadas,
    totalPendiente,
    tarjetas,
    productos,
    deudaAbonar,

    // ── formulario ─────────────────────────────────────────────────────
    tipoSeleccionado,
    form,
    errors,
    resumenFinanciero,
    setField,

    // ── visibilidad de modales ──────────────────────────────────────────
    showForm,
    showTipos,
    showModalAbonar,
    setShowForm,
    setShowTipos,

    // ── acciones ───────────────────────────────────────────────────────
    seleccionarTipo,
    handleGuardar,
    resetForm,
    abrirModalAbonar,
    handleAbonar,
    cancelarAbonar,
    montoCuotaDeuda,

    // ── helpers de display ─────────────────────────────────────────────
    fmt,
    isoADisplay,
    TIPOS_CONFIG,
    TIPOS_LIST,
  };
}