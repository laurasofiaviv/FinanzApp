// src/hooks/useEditProduct.js
import { useState } from 'react';
import { Alert } from 'react-native';
import { useFinanz } from '../context/FinanzContext';

function fmt(n) {
    if (!n && n !== 0) return '';
    return Number(n).toLocaleString('es-CO');
}

function parsear(t) {
    const d = String(t).replace(/[^0-9]/g, '');
    return d === '' ? '' : parseInt(d, 10);
}

export function useEditProduct(productoId, navigation) {
    const { productos, eliminarProducto } = useFinanz();

    // ── Producto original (la pantalla no lo conoce directamente) ─────────
    const original = productos.find((p) => p.id === productoId) || null;

    // ── Estado del formulario inicializado con datos reales ───────────────
    const [nombre,     setNombre]     = useState(original?.nombre      || '');
    const [saldoDisp,  setSaldoDisp]  = useState(fmt(original?.saldoActual || 0));
    const [cupoDisp,   setCupoDisp]   = useState(fmt(original?.cupoTotal   || 0));
    const [diaCorte,   setDiaCorte]   = useState(String(original?.diaCorte || ''));
    const [diaPago,    setDiaPago]    = useState(String(original?.diaPago  || ''));
    const [errors,     setErrors]     = useState({});

    // ── Derivados del tipo (la pantalla no pregunta el tipo directamente) ──
    const esCredito = original?.tipo === 'credito';
    const esSaldo   = original?.tipo === 'debito' || original?.tipo === 'efectivo';
    const tipoLabel = {
        credito:  'Tarjeta de crédito',
        efectivo: 'Efectivo',
        debito:   'Cuenta débito',
    }[original?.tipo] || '';

    // ── Validación (sale de EditProductScreen) ────────────────────────────
    const validar = () => {
        const e = {};
        if (!nombre.trim()) e.nombre = 'El nombre no puede estar vacío.';
        if (esCredito) {
            const cupo  = parsear(cupoDisp);
            const corte = parseInt(diaCorte);
            const pago  = parseInt(diaPago);
            if (!cupo  || cupo  <= 0)              e.cupo     = 'Ingresa un cupo válido.';
            if (!corte || corte < 1 || corte > 31) e.diaCorte = 'Ingresa un día entre 1 y 31.';
            if (!pago  || pago  < 1 || pago  > 31) e.diaPago  = 'Ingresa un día entre 1 y 31.';
        }
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    // ── Guardar (llama a editarProducto del contexto cuando exista) ────────
    const handleGuardar = () => {
        if (!validar()) return;
        // Cuando implementes editarProducto() en FinanzContext,
        // reemplaza el Alert por:
        // editarProducto(productoId, { nombre, saldoActual: parsear(saldoDisp), ... })
        Alert.alert(
            'Cambios guardados',
            'Reemplaza este Alert por editarProducto() en FinanzContext.',
            [{ text: 'Entendido', onPress: () => navigation.goBack() }]
        );
    };

    // ── Eliminar (sale de EditProductScreen) ──────────────────────────────
    const handleEliminar = () => {
        Alert.alert(
            'Eliminar producto',
            `¿Seguro que deseas eliminar "${original?.nombre}"?`,
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Eliminar',
                    style: 'destructive',
                    onPress: () => {
                        eliminarProducto(productoId);
                        navigation.popToTop();
                    },
                },
            ]
        );
    };

    // ── Handlers de campos ─────────────────────────────────────────────────
    const handleNombre = (v) => {
        setNombre(v);
        setErrors((p) => ({ ...p, nombre: null }));
    };

    const handleCupo = (t) => {
        const n = parsear(t);
        setCupoDisp(n === '' ? '' : fmt(n));
        setErrors((p) => ({ ...p, cupo: null }));
    };

    const handleSaldo = (t) => {
        const n = parsear(t);
        setSaldoDisp(n === '' ? '' : fmt(n));
    };

    const handleDiaCorte = (v) => {
        setDiaCorte(v.replace(/[^0-9]/g, ''));
        setErrors((p) => ({ ...p, diaCorte: null }));
    };

    const handleDiaPago = (v) => {
        setDiaPago(v.replace(/[^0-9]/g, ''));
        setErrors((p) => ({ ...p, diaPago: null }));
    };

    // ── Todo lo que la pantalla necesita ──────────────────────────────────
    return {
        // datos de solo lectura del producto original
        original,
        tipoLabel,
        esCredito,
        esSaldo,
        saldoUsadoFmt: fmt(original?.saldoUsado || 0),
        // estado del formulario
        nombre,
        saldoDisp,
        cupoDisp,
        diaCorte,
        diaPago,
        errors,
        // handlers
        handleNombre,
        handleCupo,
        handleSaldo,
        handleDiaCorte,
        handleDiaPago,
        // acciones
        handleGuardar,
        handleEliminar,
    };
}