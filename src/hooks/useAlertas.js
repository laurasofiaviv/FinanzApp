// src/hooks/useAlertas.js
import { useFinanz } from '../context/FinanzContext';
import { useProductos } from '../context/ProductContext';
import { useDeudas } from '../context/DeudaContext';

// Calcula cuántos días faltan desde hoy hasta un día del mes
function diasHastaElDia(diaMes) {
    if (!diaMes) return null;
    const hoy = new Date();
    const diaNum = parseInt(diaMes);
    let fecha = new Date(hoy.getFullYear(), hoy.getMonth(), diaNum);
    // Si ya pasó este mes, calcular para el próximo mes
    if (fecha <= hoy) fecha = new Date(hoy.getFullYear(), hoy.getMonth() + 1, diaNum);
    return Math.ceil((fecha - hoy) / (1000 * 60 * 60 * 24));
}

// Calcula días hasta una fecha en formato dd/mm/yyyy
function diasHastaFecha(fechaStr) {
    if (!fechaStr) return null;
    const partes = fechaStr.split('/');
    if (partes.length !== 3) return null;
    const [d, m, y] = partes;
    const fecha = new Date(parseInt(y), parseInt(m) - 1, parseInt(d));
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    return Math.ceil((fecha - hoy) / (1000 * 60 * 60 * 24));
}

export function useAlertas() {
    const { productos } = useProductos();
    const { deudas } = useDeudas();
    const { gastos } = useFinanz();
    const alertas = [];

    // ── 1. FECHAS DE CORTE Y PAGO DE TARJETAS ──────────────────────────────
    const tarjetas = productos.filter(p => p.tipo === 'credito');

    tarjetas.forEach(tarjeta => {
        const diasCorte = diasHastaElDia(tarjeta.diaCorte);
        const diasPago = diasHastaElDia(tarjeta.diaPago);
        const saldoUsado = tarjeta.saldoUsado || 0;
        const cupoTotal = tarjeta.cupoTotal || 0;
        const pctUso = cupoTotal > 0 ? (saldoUsado / cupoTotal) * 100 : 0;

        // Alerta de fecha de corte (7 días antes)
        if (diasCorte !== null && diasCorte <= 7) {
            alertas.push({
                id: `corte-${tarjeta.id}`,
                tipo: diasCorte <= 2 ? 'urgente' : 'advertencia',
                icono: 'scissors',
                titulo: `Corte próximo — ${tarjeta.nombre}`,
                descripcion: diasCorte === 0
                    ? 'Tu tarjeta corta HOY'
                    : diasCorte === 1
                        ? 'Tu tarjeta corta mañana'
                        : `Corte en ${diasCorte} días`,
                detalle: `Saldo usado: $${saldoUsado.toLocaleString('es-CO')}`,
                color: diasCorte <= 2 ? '#E74C3C' : '#F39C12',
            });
        }

        // Alerta de fecha de pago (10 días antes)
        if (diasPago !== null && diasPago <= 10) {
            alertas.push({
                id: `pago-${tarjeta.id}`,
                tipo: diasPago <= 3 ? 'urgente' : 'recordatorio',
                icono: 'credit-card',
                titulo: `Pago próximo — ${tarjeta.nombre}`,
                descripcion: diasPago === 0
                    ? 'Tu pago vence HOY'
                    : diasPago === 1
                        ? 'Tu pago vence mañana'
                        : `Pago en ${diasPago} días`,
                detalle: `Monto a pagar: $${saldoUsado.toLocaleString('es-CO')}`,
                color: diasPago <= 3 ? '#E74C3C' : '#2D6BE4',
                navegarA: 'Deudas',
            });
        }

        // Alerta de cupo alto (más del 80%)
        if (pctUso >= 80) {
            alertas.push({
                id: `cupo-${tarjeta.id}`,
                tipo: 'advertencia',
                icono: 'alert-triangle',
                titulo: `Cupo alto — ${tarjeta.nombre}`,
                descripcion: `Has usado el ${Math.round(pctUso)}% de tu cupo`,
                detalle: `Disponible: $${(cupoTotal - saldoUsado).toLocaleString('es-CO')}`,
                color: '#F39C12',
            });
        }
    });

    // ── 2. DEUDAS CON VENCIMIENTO PRÓXIMO ──────────────────────────────────
    const deudasPendientes = deudas.filter(d =>
        d.estado === 'pendiente' && !d.esEspejo && d.fechaVencimiento
    );

    deudasPendientes.forEach(deuda => {
        const dias = diasHastaFecha(deuda.fechaVencimiento);
        if (dias !== null && dias <= 10) {
            const restante = (deuda.monto || 0) - (deuda.montoPagado || 0);
            alertas.push({
                id: `deuda-${deuda.id}`,
                tipo: dias < 0 ? 'urgente' : dias <= 3 ? 'urgente' : 'recordatorio',
                icono: dias < 0 ? 'alert-circle' : 'clock',
                titulo: dias < 0
                    ? `Deuda vencida — ${deuda.tipo}`
                    : `Deuda por vencer — ${deuda.tipo}`,
                descripcion: dias < 0
                    ? `Venció hace ${Math.abs(dias)} día(s)`
                    : dias === 0
                        ? 'Vence hoy'
                        : `Vence en ${dias} días`,
                detalle: deuda.descripcion
                    ? `${deuda.descripcion} · $${restante.toLocaleString('es-CO')}`
                    : `$${restante.toLocaleString('es-CO')} pendientes`,
                color: dias <= 0 ? '#E74C3C' : dias <= 3 ? '#E74C3C' : '#F39C12',
            });
        }
    });

    // ── 3. GASTOS RECURRENTES PRÓXIMOS ────────────────────────────────────
    const gastosRecurrentes = gastos.filter(g => g.recurrente?.proximoCobro);

    gastosRecurrentes.forEach(gasto => {
        const fecha = new Date(gasto.recurrente.proximoCobro);
        const hoy = new Date();
        hoy.setHours(0, 0, 0, 0);
        const dias = Math.ceil((fecha - hoy) / (1000 * 60 * 60 * 24));
        const frecuencia = gasto.recurrente.frecuencia; // 'mensual' | 'quincenal'
        const modo = gasto.recurrente.modo;

        // Mensual: alerta 5 días antes
        // Quincenal: alerta 7 días antes (más anticipación porque es más frecuente)
        const umbral = frecuencia === 'quincenal' ? 7 : 5;

        if (dias <= umbral && dias >= 0) {
            const esHoy = dias === 0;
            const esMañana = dias === 1;

            alertas.push({
                id: `recurrente-${gasto.id}`,
                tipo: modo === 'preguntar' && esHoy ? 'accion' : dias <= 2 ? 'recordatorio' : 'info',
                icono: modo === 'preguntar' ? 'bell' : 'refresh-cw',
                titulo: `${gasto.categoria || 'Gasto'} recurrente · ${frecuencia === 'quincenal' ? 'Quincenal' : 'Mensual'
                    }`,
                descripcion: esHoy
                    ? modo === 'preguntar'
                        ? '¿Deseas registrar este gasto hoy?'
                        : 'Se registrará automáticamente hoy'
                    : esMañana
                        ? 'Se aplica mañana'
                        : `Se aplica en ${dias} días`,
                detalle: `$${(gasto.monto || 0).toLocaleString('es-CO')}${gasto.descripcion ? ` · ${gasto.descripcion}` : ''
                    }`,
                color: esHoy
                    ? modo === 'preguntar' ? '#8E44AD' : '#27AE60'
                    : dias <= 2 ? '#F39C12' : '#27AE60',
                accionRegistrar: modo === 'preguntar' && esHoy ? {
                    gastoId: gasto.id,
                    monto: gasto.monto,
                    montoDisplay: gasto.montoDisplay,
                    categoria: gasto.categoria,
                    descripcion: gasto.descripcion,
                    productoId: gasto.productoId,
                } : null,
            });
        }
    });

    // Ordenar: urgentes primero
    const orden = { urgente: 0, advertencia: 1, accion: 2, recordatorio: 3, info: 4 };
    alertas.sort((a, b) => (orden[a.tipo] ?? 5) - (orden[b.tipo] ?? 5));

    return {
        alertas,
        totalAlertas: alertas.length,
        hayUrgentes: alertas.some(a => a.tipo === 'urgente'),
    };
}