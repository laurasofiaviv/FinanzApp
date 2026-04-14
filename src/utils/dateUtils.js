export function proximaFechaPago(diaPago) {
  if (!diaPago) return '';
  const hoy = new Date();
  const fecha = new Date(hoy.getFullYear(), hoy.getMonth(), diaPago);

  if (fecha <= hoy) fecha.setMonth(fecha.getMonth() + 1);

  return fecha
    .toISOString()
    .split('T')[0]
    .split('-')
    .reverse()
    .join('/');
}