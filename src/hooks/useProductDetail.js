// src/hooks/useProductDetail.js
import { useFinanz } from '../context/FinanzContext';

function fmt(n) {
    if (!n && n !== 0) return '$0';
    return '$' + Number(n).toLocaleString('es-CO');
}

export function useProductDetail(productoId) {
    const { productos, gastos, ingresos, eliminarProducto } = useFinanz();

    // ── Producto activo ────────────────────────────────────────────────────
    const producto = productos.find((p) => p.id === productoId) || null;

    if (!producto) {
        return { producto: null };
    }

    // ── Cálculo de uso de cupo (sale de ProductDetailScreen) ──────────────
    const cupoTotal  = producto.cupoTotal  || 0;
    const saldoUsado = producto.saldoUsado || 0;
    const disponible = cupoTotal - saldoUsado;
    const pct        = cupoTotal > 0 ? Math.min((saldoUsado / cupoTotal) * 100, 100) : 0;
    const barColor   = pct > 80 ? '#E74C3C' : pct > 50 ? '#F39C12' : '#1A56E8';

    // ── Historial de movimientos vinculados al productoId ─────────────────
    // (sale de ProductDetailScreen — antes no existía, ahora lo centralizamos)
    const gastosDelProducto = gastos
        .filter((g) => g.productoId === productoId)
        .sort((a, b) => new Date(b.creadoEn) - new Date(a.creadoEn));

    const ingresosDelProducto = ingresos
        .filter((i) => i.productoId === productoId)
        .sort((a, b) => new Date(b.creadoEn) - new Date(a.creadoEn));

    // ── Formato de fecha legible ───────────────────────────────────────────
    const formatearFecha = (isoString) =>
        new Date(isoString).toLocaleDateString('es-CO', {
            day: '2-digit', month: 'long', year: 'numeric',
        });

    // ── Mapa de íconos y etiquetas ─────────────────────────────────────────
    const iconMap = {
        credito:  { name: 'card-outline',          bg: '#E6F1FB', color: '#185FA5' },
        debito:   { name: 'phone-portrait-outline', bg: '#EAF3DE', color: '#3B6D11' },
        efectivo: { name: 'cash-outline',           bg: '#FAEEDA', color: '#854F0B' },
    };

    const tipoLabel = {
        credito:  'Tarjeta de crédito',
        debito:   'Cuenta débito',
        efectivo: 'Efectivo',
    };

    // ── Todo lo que la pantalla necesita ──────────────────────────────────
    return {
        producto,
        // cupo
        cupoTotal,
        saldoUsado,
        disponible,
        pct,
        barColor,
        // historial
        gastosDelProducto,
        ingresosDelProducto,
        // helpers de formato
        fmt,
        formatearFecha,
        // mapas de presentación
        iconMap,
        tipoLabel,
        // acciones
        eliminarProducto,
    };
}