export const calcularTotalMes = (items) => {
  const ahora = new Date();

  return items
    .filter((i) => {
      const fecha = new Date(i.creadoEn);
      return (
        fecha.getMonth() === ahora.getMonth() &&
        fecha.getFullYear() === ahora.getFullYear()
      );
    })
    .reduce((acc, i) => acc + parseFloat(i.monto || 0), 0);
};