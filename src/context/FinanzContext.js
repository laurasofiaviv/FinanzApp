import React, { createContext, useState, useContext, useEffect } from 'react';
import { Alert } from 'react-native';

export const FinanzContext = createContext();

export const FinanzProvider = ({ children }) => {
  const [gastos, setGastos] = useState([]);
  const [ingresos, setIngresos] = useState([]);
  const [deudas, setDeudas] = useState([]);

  // ── MOTOR DE RECURRENCIA ──────────────────────────────────────────────────
  // Se ejecuta al cargar la app para revisar si hay gastos pendientes
  useEffect(() => {
    // Damos un pequeño respiro para que el estado se inicialice
    const timer = setTimeout(() => {
      procesarGastosRecurrentes();
    }, 1500);
    return () => clearTimeout(timer);
  }, [gastos.length]); // Solo re-evaluamos si cambia la cantidad de gastos

  const procesarGastosRecurrentes = () => {
    setGastos((prev) => {
      const hoy = new Date();
      let nuevosAuto = [];
      let huboCambios = false;

      const actualizados = prev.map((g) => {
        // Buscamos gastos que tengan configuración recurrente y una fecha próxima
        if (g.recurrente && g.recurrente.proximoCobro) {
          const fechaCobro = new Date(g.recurrente.proximoCobro);
          
          if (hoy >= fechaCobro) {
            huboCambios = true;
            
            // 1. Calculamos la nueva fecha de cobro para el gasto "padre"
            const siguienteFecha = new Date(fechaCobro);
            if (g.recurrente.frecuencia === 'mensual') {
              siguienteFecha.setMonth(siguienteFecha.getMonth() + 1);
            } else {
              siguienteFecha.setDate(siguienteFecha.getDate() + 15);
            }

            // 2. Dependiendo del modo, actuamos
            if (g.recurrente.modo === 'auto') {
              // Lo registramos silenciosamente
              nuevosAuto.push({
                ...g,
                id: Date.now().toString() + Math.random().toString().substring(2, 6),
                creadoEn: hoy.toISOString(),
                fecha: hoy.toISOString().split('T')[0],
                recurrente: null // El hijo ya no es recurrente, solo es un registro normal
              });
            } else if (g.recurrente.modo === 'preguntar') {
              // Lanzamos la notificación
              setTimeout(() => {
                Alert.alert(
                  "Gasto Recurrente Pendiente",
                  `¿Deseas registrar tu gasto de ${g.categoria} por ${g.montoDisplay}?`,
                  [
                    { text: "Más tarde", style: "cancel" },
                    { 
                      text: "Registrar", 
                      onPress: () => agregarGasto({ ...g, recurrente: null, fecha: new Date().toISOString().split('T')[0] }) 
                    }
                  ]
                );
              }, 500);
            }

            // Actualizamos el padre con la nueva fecha
            return {
              ...g,
              recurrente: { ...g.recurrente, proximoCobro: siguienteFecha.toISOString() }
            };
          }
        }
        return g;
      });

      // Si se generaron gastos automáticos, los unimos al historial
      if (huboCambios) {
        return [...nuevosAuto, ...actualizados];
      }
      return prev;
    });
  };

  // ── FUNCIONES DE GASTOS E INGRESOS ───────────────────────────────────────
  const agregarGasto = (gasto) => {
    let recurrenteData = gasto.recurrente;
    
    // Si el usuario activó la recurrencia, calculamos cuándo será el primer cobro automático
    if (recurrenteData) {
      // Usamos la fecha que eligió en el calendario o la de hoy
      const fechaBase = gasto.fecha ? new Date(gasto.fecha.split('/').reverse().join('-')) : new Date();
      const proximo = new Date(fechaBase);
      
      if (recurrenteData.frecuencia === 'mensual') {
        proximo.setMonth(proximo.getMonth() + 1);
      } else {
        proximo.setDate(proximo.getDate() + 15);
      }
      // Guardamos la fecha calculada dentro del objeto recurrente
      recurrenteData = { ...recurrenteData, proximoCobro: proximo.toISOString() };
    }

    const nuevo = { 
      ...gasto, 
      id: Date.now().toString(), 
      creadoEn: new Date().toISOString(),
      recurrente: recurrenteData
    };
    
    setGastos((prev) => [nuevo, ...prev]);
    return nuevo;
  };

  const agregarIngreso = (ingreso) => {
    const nuevo = { ...ingreso, id: Date.now().toString(), creadoEn: new Date().toISOString() };
    setIngresos((prev) => [nuevo, ...prev]);
    return nuevo;
  };

  // ── FUNCIONES DE DEUDAS ──────────────────────────────────────────────────
  const agregarDeuda = (deuda) => {
    const nuevo = {
      ...deuda,
      id: Date.now().toString(),
      creadoEn: new Date().toISOString(),
      montoPagado: 0,
      cuotasPagadas: 0,
      estado: 'pendiente', // pendiente | pagada | vencida
    };
    setDeudas((prev) => [nuevo, ...prev]);
    return nuevo;
  };

  const marcarDeudaPagada = (id) => {
    setDeudas((prev) =>
      prev.map((d) => (d.id === id ? { ...d, estado: 'pagada' } : d))
    );
  };

  const pagarCuota = (id) => {
    setDeudas((prev) =>
      prev.map((d) => {
        if (d.id !== id) return d;

        // Si no tiene cuotas → pago total
        if (!d.cuotas || d.cuotas <= 1) {
          return {
            ...d,
            montoPagado: d.monto,
            estado: 'pagada',
          };
        }

        // Pago por cuotas
        const valorCuota = d.monto / d.cuotas;
        const nuevasCuotasPagadas = (d.cuotasPagadas || 0) + 1;
        const nuevoMontoPagado = (d.montoPagado || 0) + valorCuota;
        const deudaPagada = nuevasCuotasPagadas >= d.cuotas;

        return {
          ...d,
          cuotasPagadas: nuevasCuotasPagadas,
          montoPagado: nuevoMontoPagado,
          estado: deudaPagada ? 'pagada' : 'pendiente',
        };
      })
    );
  };

  // ── ESTADÍSTICAS Y RESUMEN ───────────────────────────────────────────────
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
        pagarCuota,
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