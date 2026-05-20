//src/utils/dateUtils.js
export function proximaFechaPago(diaPago) {
  if (!diaPago) return '';
  const hoy = new Date();
  const fecha = new Date(hoy.getFullYear(), hoy.getMonth(), diaPago);

  // Si el día de pago ya pasó este mes, avanza al mes siguiente;
// Date maneja automáticamente el desbordamiento (ej: mes 13 → enero del año siguiente)
  if (fecha <= hoy) fecha.setMonth(fecha.getMonth() + 1);

  return fecha
    .toISOString()
    .split('T')[0]
    .split('-')
    .reverse()
    .join('/');
}