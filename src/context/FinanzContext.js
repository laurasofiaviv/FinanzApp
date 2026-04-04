import React, { createContext, useState, useContext } from 'react';

export const FinanzContext = createContext();

export const FinanzProvider = ({ children }) => {
  const [gastos, setGastos] = useState([]);
  const [ingresos, setIngresos] = useState([]);
  const [deudas, setDeudas] = useState([]);

  const agregarGasto = (gasto) => {
    const nuevo = { ...gasto, id: Date.now().toString(), creadoEn: new Date().toISOString() };
    setGastos((prev) => [nuevo, ...prev]);
    return nuevo;
  };

  const agregarIngreso = (ingreso) => {
    const nuevo = { ...ingreso, id: Date.now().toString(), creadoEn: new Date().toISOString() };
    setIngresos((prev) => [nuevo, ...prev]);
    return nuevo;
  };

  const agregarDeuda = (deuda) => {
    const nuevo = {
      ...deuda,
      id: Date.now().toString(),
      creadoEn: new Date().toISOString(),
      pagada: false,
    };
    setDeudas((prev) => [nuevo, ...prev]);
    return nuevo;
  };

  const marcarDeudaPagada = (id) => {
    setDeudas((prev) =>
      prev.map((d) => (d.id === id ? { ...d, pagada: true } : d))
    );
  };

  const totalGastosMes = () => {
    const ahora = new Date();
    return gastos
      .filter((g) => {
        const fecha = new Date(g.creadoEn);
        return fecha.getMonth() === ahora.getMonth() && fecha.getFullYear() === ahora.getFullYear();
      })
      .reduce((acc, g) => acc + parseFloat(g.monto || 0), 0);
  };

  const totalIngresosMes = () => {
    const ahora = new Date();
    return ingresos
      .filter((i) => {
        const fecha = new Date(i.creadoEn);
        return fecha.getMonth() === ahora.getMonth() && fecha.getFullYear() === ahora.getFullYear();
      })
      .reduce((acc, i) => acc + parseFloat(i.monto || 0), 0);
  };

  const balanceMes = () => totalIngresosMes() - totalGastosMes();

  const movimientosRecientes = () => {
    const todosGastos = gastos.map((g) => ({ ...g, tipo: 'gasto' }));
    const todosIngresos = ingresos.map((i) => ({ ...i, tipo: 'ingreso' }));
    return [...todosGastos, ...todosIngresos]
      .sort((a, b) => new Date(b.creadoEn) - new Date(a.creadoEn))
      .slice(0, 5);
  };

  return (
    <FinanzContext.Provider
      value={{
        gastos,
        ingresos,
        deudas,
        agregarGasto,
        agregarIngreso,
        agregarDeuda,
        marcarDeudaPagada,
        totalGastosMes,
        totalIngresosMes,
        balanceMes,
        movimientosRecientes,
      }}
    >
      {children}
    </FinanzContext.Provider>
  );
};

export const useFinanz = () => useContext(FinanzContext);