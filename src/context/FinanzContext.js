import React, { createContext, useState, useContext } from 'react';

export const FinanzContext = createContext();

export const FinanzProvider = ({ children }) => {
  const [gastos, setGastos] = useState([]);
  const [ingresos, setIngresos] = useState([]);

  const agregarGasto = (gasto) => {
    const nuevo = {
      ...gasto,
      id: Date.now().toString(),
      creadoEn: new Date().toISOString(),
    };
    setGastos((prev) => [nuevo, ...prev]);
    return nuevo;
  };

  const agregarIngreso = (ingreso) => {
    const nuevo = {
      ...ingreso,
      id: Date.now().toString(),
      creadoEn: new Date().toISOString(),
    };
    setIngresos((prev) => [nuevo, ...prev]);
    return nuevo;
  };

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

  const balanceMes = () => totalIngresosMes() - totalGastosMes();

  return (
    <FinanzContext.Provider
      value={{
        gastos,
        ingresos,
        agregarGasto,
        agregarIngreso,
        totalGastosMes,
        totalIngresosMes,
        balanceMes,
      }}
    >
      {children}
    </FinanzContext.Provider>
  );
};

export const useFinanz = () => useContext(FinanzContext);