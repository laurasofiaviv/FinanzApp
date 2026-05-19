// src/hooks/useDebt.js
import { useState } from 'react';
import { useDeudas } from '../context/DeudaContext';
import { useProductos } from '../context/ProductContext';
import { fmt, parsear, isoADisplay } from '../utils/formatUtils';

// ── CONFIGURACIÓN POR TIPO ────────────────────────────────────────────────
export const TIPOS_CONFIG = {
  'Tarjeta de crédito': {
    icon: 'credit-card',
    color: '#2D6BE4',
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
  const monto = parseFloat(form.montoNum) || 0;
  const interes = parseFloat(form.interes) || 0;
  const cuotas = parseInt(form.cuotas) || 1;

  if (tipo === 'Tarjeta de crédito') {
    const nuevoSaldo = monto * (1 + interes / 100);
    const pagoMin = parseFloat(form.pagoMinimo) || monto * 0.05;
    return {
      label: 'Saldo próximo mes',
      valor: `$${fmt(Math.round(nuevoSaldo))}`,
      extra: `Pago mínimo: $${fmt(Math.round(pagoMin))}`,
    };
  }

  if (tipo === 'Préstamo bancario' && interes > 0 && cuotas > 0) {
    const r = interes / 100;
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
  descripcion: '',
  montoNum: '',
  montoDisplay: '',
  interes: '',
  cuotas: '',
  fechaVencimiento: '',
  fechaInicio: '',
  diaPago: '',
  pagoMinimo: '',
  pagoMinimoDisplay: '',
  tarjetaId: null,
  tarjetaNombre: null,
  cupoDisponible: 0,
  montoAbono: '',
  montoAbonoDisplay: '',
});

// ── HOOK PRINCIPAL ────────────────────────────────────────────────────────
export function useDebt() {
  const { deudas, agregarDeuda, pagarCuota } = useDeudas();
  const { productos } = useProductos();

  const tarjetas = (productos || []).filter((p) => p.tipo === 'credito');

  const [showForm, setShowForm] = useState(false);
  const [showTipos, setShowTipos] = useState(false);
  const [showModalAbonar, setShowModalAbonar] = useState(false);
  const [tipoSeleccionado, setTipoSeleccionado] = useState(null);
  const [form, setFormState] = useState(formVacio());
  const [errors, setErrors] = useState({});
  const [deudaAbonar, setDeudaAbonar] = useState(null);

  const setField = (k, v) => setFormState((prev) => ({ ...prev, [k]: v }));

  const resetForm = () => {
    setTipoSeleccionado(null);
    setFormState(formVacio());
    setErrors({});
  };

  const seleccionarTipo = (tipo) => {
    setTipoSeleccionado(tipo);
    setFormState({ ...formVacio(), descripcion: form.descripcion });
    setShowTipos(false);
  };

  const validar = () => {
    const e = {};
    if (!form.montoNum || form.montoNum <= 0) e.monto = 'Ingresa un monto';
    if (!tipoSeleccionado) e.tipo = 'Selecciona un tipo';
    if (tipoSeleccionado === 'Tarjeta de crédito' && form.tarjetaId) {
      if (form.cupoDisponible < form.montoNum) {
        e.monto = 'El monto supera el cupo disponible';
      }
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleGuardar = async () => {
    if (!validar()) return;
    const ok = await agregarDeuda({
      tipo: tipoSeleccionado,
      descripcion: form.descripcion || '',
      monto: parseFloat(form.montoNum),
      montoDisplay: '$' + (form.montoDisplay || fmt(form.montoNum)),
      interes: form.interes || '0',
      cuotas: form.cuotas || '1',
      fechaVencimiento: form.fechaVencimiento || '',
      fechaInicio: form.fechaInicio || '',
      diaPago: form.diaPago || '',
      tarjetaId: form.tarjetaId || null,
      tarjetaNombre: form.tarjetaNombre || null,
      pagoMinimo: parseFloat(form.pagoMinimo) || 0,
    });
    if (ok) {
      resetForm();
      setShowForm(false);
    }
  };

  const abrirModalAbonar = (deuda) => {
    setDeudaAbonar(deuda);
    setShowModalAbonar(true);
  };

  const handleAbonar = (productoId) => {
    if (!deudaAbonar) return;
    const monto = parseFloat(form.montoAbono) || 0;
    if (monto <= 0) return;
    pagarCuota(deudaAbonar.id, productoId, monto);
    setShowModalAbonar(false);
    setDeudaAbonar(null);
    setField('montoAbono', '');
    setField('montoAbonoDisplay', '');
  };

  const cancelarAbonar = () => {
    setShowModalAbonar(false);
    setDeudaAbonar(null);
    setField('montoAbono', '');
    setField('montoAbonoDisplay', '');
  };

  const montoCuotaDeuda = (deuda) => {
    if (!deuda) return 0;
    if (!deuda.cuotas || parseInt(deuda.cuotas) <= 1) {
      return deuda.monto - (deuda.montoPagado || 0);
    }
    return deuda.monto / parseInt(deuda.cuotas);
  };

  const handleMontoAbono = (texto) => {
    const num = parsear(texto);
    setField('montoAbono', num === '' ? '' : String(num));
    setField('montoAbonoDisplay', num === '' ? '' : fmt(num));
  };

  const deudasPendientes = deudas.filter((d) => {
    if (d.esEspejo) return (d.monto || 0) > 0 && (d.montoPagado || 0) < d.monto;
    return (d.montoPagado || 0) < (d.monto || 0);
  });

  const deudasPagadas = deudas.filter((d) => {
    if (d.esEspejo) return false;
    return (d.montoPagado || 0) >= (d.monto || 0) && (d.monto || 0) > 0;
  });

  const totalPendiente = deudasPendientes.reduce(
    (acc, d) => acc + parseFloat(d.monto || 0) - parseFloat(d.montoPagado || 0),
    0,
  );

  const resumenFinanciero =
    tipoSeleccionado && form.montoNum
      ? calcularResumen(tipoSeleccionado, form)
      : null;

  return {
    deudasPendientes,
    deudasPagadas,
    totalPendiente,
    tarjetas,
    productos,
    deudaAbonar,
    tipoSeleccionado,
    form,
    errors,
    resumenFinanciero,
    setField,
    showForm,
    showTipos,
    showModalAbonar,
    setShowForm,
    setShowTipos,
    seleccionarTipo,
    handleGuardar,
    resetForm,
    abrirModalAbonar,
    handleAbonar,
    cancelarAbonar,
    montoCuotaDeuda,
    // helpers re-exportados para pantallas que los importen desde aquí
    fmt,
    parsear,
    isoADisplay,
    TIPOS_CONFIG,
    TIPOS_LIST,
    handleMontoAbono,
  };
}