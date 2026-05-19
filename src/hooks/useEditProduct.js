// src/hooks/useEditProduct.js
import { useState } from 'react';
import { useProductos } from '../context/ProductContext';
import { fmt, parsear } from '../utils/formatUtils';

export function useEditProduct(productoId, navigation) {
  const { productos, eliminarProducto, editarProducto } = useProductos();

  const original = productos.find((p) => p.id === productoId) || null;

  const [nombre, setNombre] = useState(original?.nombre || '');
  const [saldoDisp, setSaldoDisp] = useState(fmt(original?.saldoActual || 0));
  const [cupoDisp, setCupoDisp] = useState(fmt(original?.cupoTotal || 0));
  const [diaCorte, setDiaCorte] = useState(String(original?.diaCorte || ''));
  const [diaPago, setDiaPago] = useState(String(original?.diaPago || ''));
  const [errors, setErrors] = useState({});
  const [guardando, setGuardando] = useState(false);
  const [showConfirmEliminar, setShowConfirmEliminar] = useState(false);

  const esCredito = original?.tipo === 'credito';
  const esSaldo = original?.tipo === 'debito' || original?.tipo === 'efectivo';

  const tipoLabel = {
    credito: 'Tarjeta de crédito',
    efectivo: 'Efectivo',
    debito: 'Cuenta débito',
  }[original?.tipo] || '';

  const validar = () => {
    const e = {};
    if (!nombre.trim()) e.nombre = 'El nombre no puede estar vacío.';
    if (esCredito) {
      const cupo = parsear(cupoDisp);
      const corte = parseInt(diaCorte);
      const pago = parseInt(diaPago);
      if (!cupo || cupo <= 0) e.cupo = 'Ingresa un cupo válido.';
      if (!corte || corte < 1 || corte > 31) e.diaCorte = 'Ingresa un día entre 1 y 31.';
      if (!pago || pago < 1 || pago > 31) e.diaPago = 'Ingresa un día entre 1 y 31.';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleGuardar = async () => {
    if (!validar()) return;
    setGuardando(true);
    const datos = {
      nombre: nombre.trim(),
      ...(esCredito && {
        cupoTotal: parsear(cupoDisp),
        diaCorte: parseInt(diaCorte),
        diaPago: parseInt(diaPago),
      }),
      ...(esSaldo && {
        saldoActual: parsear(saldoDisp),
      }),
    };
    const ok = await editarProducto(original.id, datos);
    setGuardando(false);
    if (ok) navigation.goBack();
  };

  const handleEliminar = () => setShowConfirmEliminar(true);

  const confirmarEliminar = () => {
    setShowConfirmEliminar(false);
    eliminarProducto(productoId).then((ok) => {
      if (ok) navigation.popToTop();
    });
  };

  const handleNombre = (v) => { setNombre(v); setErrors(p => ({ ...p, nombre: null })); };
  const handleCupo = (t) => { setCupoDisp(fmt(parsear(t)) || ''); setErrors(p => ({ ...p, cupo: null })); };
  const handleSaldo = (t) => { setSaldoDisp(fmt(parsear(t)) || ''); };
  const handleDiaCorte = (v) => { setDiaCorte(v.replace(/[^0-9]/g, '')); setErrors(p => ({ ...p, diaCorte: null })); };
  const handleDiaPago = (v) => { setDiaPago(v.replace(/[^0-9]/g, '')); setErrors(p => ({ ...p, diaPago: null })); };

  return {
    original, tipoLabel, esCredito, esSaldo,
    saldoUsadoFmt: fmt(original?.saldoUsado || 0),
    nombre, saldoDisp, cupoDisp, diaCorte, diaPago,
    errors, guardando,
    showConfirmEliminar, setShowConfirmEliminar, confirmarEliminar,
    handleNombre, handleCupo, handleSaldo, handleDiaCorte, handleDiaPago,
    handleGuardar, handleEliminar,
  };
}