// src/services/userService.js
import { getAuth } from 'firebase/auth';
import API_URL from '../config/api';
import * as XLSX from 'xlsx';

async function getToken() {
    const user = getAuth().currentUser;
    if (!user) throw new Error('No hay sesión activa');
    return user.getIdToken();
}

// ── GET /usuarios/perfil ──────────────────────────────────────────────────────
export async function obtenerPerfil() {
    const token = await getToken();
    const res = await fetch(`${API_URL}/usuarios/perfil`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error('Error al obtener perfil');
    return res.json();
}

// ── PUT /usuarios/perfil ──────────────────────────────────────────────────────
export async function actualizarPerfil(nombre) {
    const token = await getToken();
    const res = await fetch(`${API_URL}/usuarios/perfil`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ nombre }),
    });
    if (!res.ok) throw new Error('Error al actualizar perfil');
    return res.json();
}

// ── GET /reportes/exportar → descarga el CSV ──────────────────────────────────
export async function exportarExcel() {
    const token = await getToken();
    const res = await fetch(`${API_URL}/reportes/exportar`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error('Error al exportar datos');

    const csv = await res.text();

    
    const csvLimpio = csv.replace(/^\uFEFF/, '');

    // Parsear CSV respetando campos entre comillas
    const filas = csvLimpio.trim().split('\n').map(f => {
        const cols = [];
        let actual = '';
        let dentro = false;
        for (const ch of f) {
            if (ch === '"') { dentro = !dentro; }
            else if (ch === ',' && !dentro) { cols.push(actual.trim()); actual = ''; }
            else { actual += ch; }
        }
        cols.push(actual.trim());
        return cols;
    });

    const encabezados = filas[0];
    const datos = filas.slice(1)
        .filter(f => f.length > 1)
        .map(fila => Object.fromEntries(encabezados.map((h, i) => [h, fila[i] || ''])));

    const gastos = datos.filter(d => d['Tipo'] === 'Gasto');
    const ingresos = datos.filter(d => d['Tipo'] === 'Ingreso');

    const sumar = arr => arr.reduce((acc, d) => acc + (parseFloat(d['Monto']) || 0), 0);
    const fmt = n => n.toLocaleString('es-CO');

    const wb = XLSX.utils.book_new();

    // ── Hoja 1: Movimientos ──────────────────────────────────────────────
    const ws1 = XLSX.utils.json_to_sheet(datos);
    ws1['!cols'] = encabezados.map(h => ({
        wch: Math.max(h.length, ...datos.map(r => String(r[h] || '').length)) + 4
    }));
    XLSX.utils.book_append_sheet(wb, ws1, 'Movimientos');

    // ── Hoja 2: Resumen ──────────────────────────────────────────────────
    const resumenData = [
        ['FinanzApp — Reporte Financiero'],
        ['Exportado el', new Date().toLocaleDateString('es-CO', {
            day: '2-digit', month: 'long', year: 'numeric'
        })],
        [],
        ['RESUMEN GENERAL'],
        ['Total ingresos', `$${fmt(sumar(ingresos))}`],
        ['Total gastos', `$${fmt(sumar(gastos))}`],
        ['Balance', `$${fmt(sumar(ingresos) - sumar(gastos))}`],
        [],
        ['DETALLE'],
        ['Registros totales', datos.length],
        ['Transacciones ingreso', ingresos.length],
        ['Transacciones gasto', gastos.length],
    ];

    // Categorías agrupadas
    const porCat = {};
    gastos.forEach(g => {
        const c = g['Categoría'] || 'Sin categoría';
        porCat[c] = (porCat[c] || 0) + (parseFloat(g['Monto']) || 0);
    });
    if (Object.keys(porCat).length) {
        resumenData.push([], ['GASTOS POR CATEGORÍA'], ['Categoría', 'Total']);
        Object.entries(porCat)
            .sort((a, b) => b[1] - a[1])
            .forEach(([cat, total]) => resumenData.push([cat, `$${fmt(total)}`]));
    }

    const ws2 = XLSX.utils.aoa_to_sheet(resumenData);
    ws2['!cols'] = [{ wch: 30 }, { wch: 22 }];
    XLSX.utils.book_append_sheet(wb, ws2, 'Resumen');

    XLSX.writeFile(wb, `FinanzApp_${new Date().toISOString().slice(0, 10)}.xlsx`);
}