// src/utils/formatUtils.js
// Utilidades de formato compartidas — no importar React ni hooks aquí

export function fmt(n) {
  if (n === '' || n == null) return '';
  if (!n && n !== 0) return '';
  return Number(n).toLocaleString('es-CO');
}

export function parsear(texto) {
  const d = String(texto).replace(/[^0-9]/g, '');
  return d === '' ? '' : parseInt(d, 10);
}

export function isoADisplay(iso) {
  if (!iso) return '';
  const [y, m, d] = iso.split('-');
  return `${d}/${m}/${y}`;
}

export function hoyISO() {
  return new Date().toISOString().split('T')[0];
}