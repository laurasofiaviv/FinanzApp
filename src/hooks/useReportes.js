// src/hooks/useReportes.js
import { useFinanz } from '../context/FinanzContext';

const PALETTE = [
    '#3DA9D9', '#2ECC71', '#E74C3C', '#F39C12',
    '#9B59B6', '#1ABC9C', '#E67E22', '#2C5394',
    '#16A085', '#D35400', '#8E44AD', '#27AE60', '#C0392B',
];

// ── Helpers puros (sin estado, sin React) ─────────────────────────────────

function agruparPorCategoria(gastos) {
    const mapa = {};
    gastos.forEach((g) => {
        const cat = g.categoria || 'Otros';
        mapa[cat] = (mapa[cat] || 0) + parseFloat(g.monto || 0);
    });
    return Object.entries(mapa).map(([name, value], i) => ({
        name:            name.replace(/^\S+\s/, ''),
        fullName:        name,
        value,
        color:           PALETTE[i % PALETTE.length],
        legendFontColor: '#666666',
        legendFontSize:  12,
    }));
}

function ultimos6Meses(ingresos, gastos) {
    const hoy = new Date();
    const meses = [];
    for (let i = 5; i >= 0; i--) {
        const fecha = new Date(hoy.getFullYear(), hoy.getMonth() - i, 1);
        const mes   = fecha.getMonth();
        const año   = fecha.getFullYear();
        const label = fecha.toLocaleString('es-CO', { month: 'short' });
        const sumIn = ingresos
            .filter((x) => { const d = new Date(x.creadoEn); return d.getMonth() === mes && d.getFullYear() === año; })
            .reduce((a, x) => a + parseFloat(x.monto || 0), 0);
        const sumGa = gastos
            .filter((x) => { const d = new Date(x.creadoEn); return d.getMonth() === mes && d.getFullYear() === año; })
            .reduce((a, x) => a + parseFloat(x.monto || 0), 0);
        meses.push({ label, ingreso: sumIn, gasto: sumGa });
    }
    return meses;
}

function mayorGastoDe(gastos) {
    if (!gastos.length) return null;
    return gastos.reduce((a, b) =>
        parseFloat(a.monto) > parseFloat(b.monto) ? a : b
    );
}

function categoriaMasFrecuente(categorias) {
    if (!categorias.length) return null;
    return categorias.reduce((a, b) => (a.value > b.value ? a : b));
}

export function getMesActual() {
    return new Date().toLocaleString('es-CO', { month: 'long', year: 'numeric' });
}

export function formatCOP(num) {
    if (!num) return '$0';
    return '$' + Number(num).toLocaleString('es-CO');
}

// ── Hook principal ────────────────────────────────────────────────────────
export function useReportes() {
    const { gastos, ingresos, totalGastosMes, totalIngresosMes, balanceMes } = useFinanz();

    const categorias   = agruparPorCategoria(gastos);
    const meses        = ultimos6Meses(ingresos, gastos);
    const maxVal       = Math.max(...meses.map((m) => Math.max(m.ingreso, m.gasto)), 1);
    const mayorGasto   = mayorGastoDe(gastos);
    const catFrecuente = categoriaMasFrecuente(categorias);
    const balance      = balanceMes();
    const balancePos   = balance >= 0;
    const mesActual    = getMesActual();

    return {
        // datos para gráficas
        categorias,
        meses,
        maxVal,
        // resumen
        mayorGasto,
        catFrecuente,
        balance,
        balancePos,
        mesActual,
        // totales del mes
        totalIngresos: totalIngresosMes(),
        totalGastos:   totalGastosMes(),
        // helper de formato que la pantalla necesita
        formatCOP,
    };
}