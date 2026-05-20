// src/utils/formatUtils.js
// Utilidades de formato compartidas — no importar React ni hooks aquí

export function fmt(n) {
  if (n === '' || n == null) return '';
  if (!n && n !== 0) return '';
  return Number(n).toLocaleString('es-CO');
}

export function parsear(texto) {
  // parsear elimina todo carácter no numérico antes de convertir a int,
  // lo que permite que el usuario escriba "1.500" o "1,500" y se interprete como 1500
  const d = String(texto).replace(/[^0-9]/g, '');
  return d === '' ? '' : parseInt(d, 10);
}

export function isoADisplay(iso) {
  if (!iso) return '';
  // Convierte ISO (YYYY-MM-DD) a display (DD/MM/YYYY) desestructurando
  // el split y revirtiendo el orden, más legible que manipular índices manualmente
  const [y, m, d] = iso.split('-');
  return `${d}/${m}/${y}`;
}

export function hoyISO() {
  // hoyISO trunca el ISO string en la T para obtener solo YYYY-MM-DD,
  // descartando hora y zona horaria que toISOString() incluye
  return new Date().toISOString().split('T')[0];
}