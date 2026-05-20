//services/finanzService.js
export const calcularTotalMes = (items) => {
  const ahora = new Date();

  // Filtra solo los items del mes y año actual (no acumula histórico),
  // comparando mes Y año para evitar sumar el mismo mes de años anteriores
  return items
    .filter((i) => {
      const fecha = new Date(i.creadoEn);
      return (
        fecha.getMonth() === ahora.getMonth() &&
        fecha.getFullYear() === ahora.getFullYear()
      );
    })
    // Suma los montos con parseFloat para manejar valores que vengan
    // como string desde el backend, el || 0 evita NaN si monto es undefined
    .reduce((acc, i) => acc + parseFloat(i.monto || 0), 0);
};