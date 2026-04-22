// src/hooks/useProducts.js
import { useState } from 'react';
import { useFinanz } from '../context/FinanzContext';

// ── CONSTANTES (salen de ProductsScreen) ─────────────────────────────────
export const FRANQUICIAS = [
    { id: 'visa',       label: 'Visa',       color: '#1A1F71', bg: '#EEF0FF' },
    { id: 'mastercard', label: 'Mastercard', color: '#EB001B', bg: '#FFF0F0' },
    { id: 'amex',       label: 'Amex',       color: '#007BC1', bg: '#EAF4FF' },
];

export const BANCOS_CO = [
    'Bancolombia', 'Davivienda', 'Banco de Bogotá', 'BBVA', 'Nequi',
    'Daviplata', 'Banco Popular', 'Scotiabank Colpatria', 'Itaú', 'Otro',
];

export const TIPO_ICONS = {
    credito:  { name: 'credit-card',  color: '#3DA9D9' },
    debito:   { name: 'smartphone',   color: '#2ECC71' },
    efectivo: { name: 'dollar-sign',  color: '#F39C12' },
};

// ── HELPERS (salen de ProductsScreen) ────────────────────────────────────
export function fmt(n) {
    if (!n && n !== 0) return '';
    return Number(n).toLocaleString('es-CO');
}

function parsear(t) {
    const d = String(t).replace(/[^0-9]/g, '');
    return d === '' ? '' : parseInt(d, 10);
}

const formVacio = () => ({
    tipo:        'credito',
    franquicia:  'visa',
    nombre:      '',
    banco:       '',
    cupoTotal:   '',
    cupoDisplay: '',
    diaCorte:    '',
    diaPago:     '',
    saldoActual: '',
    saldoDisplay:'',
    errors:      {},
});

// ── HOOK PRINCIPAL ────────────────────────────────────────────────────────
export function useProducts() {
    const { productos, agregarProducto, eliminarProducto } = useFinanz();

    // ── Estado del formulario ──────────────────────────────────────────────
    const [showForm,   setShowForm]   = useState(false);
    const [showBancos, setShowBancos] = useState(false);
    const [form,       setForm]       = useState(formVacio());

    // ── Helpers de campo ───────────────────────────────────────────────────
    const setField = (k, v) =>
        setForm((p) => ({ ...p, [k]: v, errors: { ...p.errors, [k]: null } }));

    const handleCupo = (t) => {
        const n = parsear(t);
        setForm((p) => ({
            ...p,
            cupoTotal:   n,
            cupoDisplay: n === '' ? '' : fmt(n),
            errors:      { ...p.errors, cupoTotal: null },
        }));
    };

    const handleSaldo = (t) => {
        const n = parsear(t);
        setForm((p) => ({
            ...p,
            saldoActual:  n,
            saldoDisplay: n === '' ? '' : fmt(n),
            errors:       { ...p.errors, saldoActual: null },
        }));
    };

    // ── Validación (sale de ProductsScreen) ───────────────────────────────
    const validar = () => {
        const e = {};
        if (!form.nombre.trim()) e.nombre = 'Ingresa un nombre';
        if (form.tipo === 'credito') {
            if (!form.cupoTotal || form.cupoTotal <= 0)
                e.cupoTotal = 'Ingresa el cupo';
            if (!form.diaCorte || form.diaCorte < 1 || form.diaCorte > 31)
                e.diaCorte = 'Día inválido';
            if (!form.diaPago || form.diaPago < 1 || form.diaPago > 31)
                e.diaPago = 'Día inválido';
        }
        setForm((p) => ({ ...p, errors: e }));
        return Object.keys(e).length === 0;
    };

    // ── Guardar (sale de ProductsScreen) ──────────────────────────────────
    const handleGuardar = () => {
        if (!validar()) return;
        agregarProducto({
            tipo:       form.tipo,
            nombre:     form.nombre.trim(),
            banco:      form.banco,
            franquicia: form.tipo === 'credito' ? form.franquicia : null,
            cupoTotal:  form.tipo === 'credito' ? form.cupoTotal  : null,
            diaCorte:   form.tipo === 'credito' ? parseInt(form.diaCorte) : null,
            diaPago:    form.tipo === 'credito' ? parseInt(form.diaPago)  : null,
            saldoActual:
                form.tipo === 'efectivo' || form.tipo === 'debito'
                    ? form.saldoActual
                    : null,
        });
        setForm(formVacio());
        setShowForm(false);
    };

    const abrirForm  = () => setShowForm(true);
    const cerrarForm = () => { setShowForm(false); setForm(formVacio()); };

    // ── Filtrado de productos por tipo (sale de ProductsScreen) ───────────
    const creditCards = productos.filter((p) => p.tipo === 'credito');
    const otros       = productos.filter((p) => p.tipo !== 'credito');

    // ── Cálculo de cupo libre por tarjeta ─────────────────────────────────
    const cupoLibre = (producto) =>
        (producto.cupoTotal || 0) - (producto.saldoUsado || 0);

    // ── Todo lo que la pantalla necesita ──────────────────────────────────
    return {
        // datos
        productos,
        creditCards,
        otros,
        // form
        form,
        showForm,
        showBancos,
        // acciones
        setField,
        handleCupo,
        handleSaldo,
        handleGuardar,
        abrirForm,
        cerrarForm,
        setShowBancos,
        eliminarProducto,
        cupoLibre,
        // constantes que la pantalla usa para renderizar
        FRANQUICIAS,
        BANCOS_CO,
        TIPO_ICONS,
    };
}