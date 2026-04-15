//hooks/useFinanzStats.js
import { useFinanz } from "../context/FinanzContext";

export const useFinanzStats = () => {
  const { gastos, ingresos, productos } = useFinanz();

  const totalGastosMes = () => {
    const ahora = new Date();

    return gastos
      .filter((g) => {
        const fecha = new Date(g.creadoEn);
        return (
          fecha.getMonth() === ahora.getMonth() &&
          fecha.getFullYear() === ahora.getFullYear()
        );
      })
      .reduce((acc, g) => acc + parseFloat(g.monto || 0), 0);
  };

  const totalIngresosMes = () => {
    const ahora = new Date();

    return ingresos
      .filter((i) => {
        const fecha = new Date(i.creadoEn);
        return (
          fecha.getMonth() === ahora.getMonth() &&
          fecha.getFullYear() === ahora.getFullYear()
        );
      })
      .reduce((acc, i) => acc + parseFloat(i.monto || 0), 0);
  };

  const balanceMes = () => {
    return productos.reduce((acc, p) => acc + (p.saldoActual || 0), 0);
  };

  const movimientosRecientes = () => {
    const todosGastos = gastos.map((g) => ({ ...g, tipo: "gasto" }));
    const todosIngresos = ingresos.map((i) => ({ ...i, tipo: "ingreso" }));

    return [...todosGastos, ...todosIngresos]
      .sort((a, b) => new Date(b.creadoEn) - new Date(a.creadoEn))
      .slice(0, 5);
  };

  return {
    totalGastosMes,
    totalIngresosMes,
    balanceMes,
    movimientosRecientes,
  };
};