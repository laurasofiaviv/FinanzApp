// src/hooks/useProducts.js
import { useState } from 'react';
import { useProductos } from '../context/ProductContext';
import { fmt, parsear } from '../utils/formatUtils';

// ── CONSTANTES ────────────────────────────────────────────────────────────
export const FRANQUICIAS = [
  { id: 'visa', label: 'Visa', color: '#1A1F71', bg: '#EEF0FF' },
  { id: 'mastercard', label: 'Mastercard', color: '#EB001B', bg: '#FFF0F0' },
  { id: 'amex', label: 'Amex', color: '#007BC1', bg: '#EAF4FF' },
];

export const BANCOS_CO = [
  'Bancolombia', 'Davivienda', 'Banco de Bogotá', 'BBVA', 'Nequi',
  'Daviplata', 'Banco Popular', 'Scotiabank Colpatria', 'Itaú', 'Otro',
];

export const TIPO_ICONS = {
  credito: { name: 'credit-card', color: '#3DA9D9' },
  debito: { name: 'smartphone', color: '#2ECC71' },
  efectivo: { name: 'dollar-sign', color: '#F39C12' },
};

const formVacio = () => ({
  tipo: 'credito',
  franquicia: 'visa',
  nombre: '',
  banco: '',
  cupoTotal: '',
  cupoDisplay: '',
  diaCorte: '',
  diaPago: '',
  saldoActual: '',
  saldoDisplay: '',
  errors: {},
});

// ── HOOK PRINCIPAL ────────────────────────────────────────────────────────
export function useProducts() {
  const { productos, agregarProducto, eliminarProducto } = useProductos();

  const [showForm, setShowForm] = useState(false);
  const [showBancos, setShowBancos] = useState(false);
  const [form, setForm] = useState(formVacio());

  const setField = (k, v) =>
    setForm((p) => ({ ...p, [k]: v, errors: { ...p.errors, [k]: null } }));

  const handleCupo = (t) => {
    const n = parsear(t);
    setForm((p) => ({
      ...p,
      cupoTotal: n,
      cupoDisplay: n === '' ? '' : fmt(n),
      errors: { ...p.errors, cupoTotal: null },
    }));
  };

  const handleSaldo = (t) => {
    const n = parsear(t);
    setForm((p) => ({
      ...p,
      saldoActual: n,
      saldoDisplay: n === '' ? '' : fmt(n),
      errors: { ...p.errors, saldoActual: null },
    }));
  };

  const validar = () => {
    const e = {};
    if (!form.nombre.trim()) e.nombre = 'Ingresa un nombre';
    if (form.tipo === 'credito') {
      if (!form.cupoTotal || form.cupoTotal <= 0) e.cupoTotal = 'Ingresa el cupo';
      if (!form.diaCorte || form.diaCorte < 1 || form.diaCorte > 31) e.diaCorte = 'Día inválido';
      if (!form.diaPago || form.diaPago < 1 || form.diaPago > 31) e.diaPago = 'Día inválido';
    }
    setForm((p) => ({ ...p, errors: e }));
    return Object.keys(e).length === 0;
  };

  const handleGuardar = () => {
    if (!validar()) return;
    agregarProducto({
      tipo: form.tipo,
      nombre: form.nombre.trim(),
      banco: form.banco,
      franquicia: form.tipo === 'credito' ? form.franquicia : null,
      cupoTotal: form.tipo === 'credito' ? form.cupoTotal : null,
      diaCorte: form.tipo === 'credito' ? parseInt(form.diaCorte) : null,
      diaPago: form.tipo === 'credito' ? parseInt(form.diaPago) : null,
      saldoActual:
        form.tipo === 'efectivo' || form.tipo === 'debito'
          ? form.saldoActual
          : null,
    });
    setForm(formVacio());
    setShowForm(false);
  };

  const abrirForm = () => setShowForm(true);
  const cerrarForm = () => { setShowForm(false); setForm(formVacio()); };

  const creditCards = productos.filter((p) => p.tipo === 'credito');
  const otros = productos.filter((p) => p.tipo !== 'credito');
  const cupoLibre = (producto) => (producto.cupoTotal || 0) - (producto.saldoUsado || 0);

  return {
    productos, creditCards, otros,
    form, showForm, showBancos,
    setField, handleCupo, handleSaldo,
    handleGuardar, abrirForm, cerrarForm,
    setShowBancos, eliminarProducto, cupoLibre,
    FRANQUICIAS, BANCOS_CO, TIPO_ICONS,
  };
}