// src/context/FinanzContext.js
import React, { createContext, useState, useContext, useEffect } from 'react';
import { Alert } from 'react-native';
import { getAuth, onAuthStateChanged } from 'firebase/auth';

import { crearMovimiento, obtenerMovimientos } from '../services/movimientoService';


export const FinanzContext = createContext();

export const FinanzProvider = ({ children, productos, setProductos, cargarGastoATarjeta }) => {
  const [gastos, setGastos] = useState([]);
  const [ingresos, setIngresos] = useState([]);

  // ── CARGA INICIAL DESDE FIRESTORE ────────────────────────────────────────
  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        //setProductos([]);
        setGastos([]);
        setIngresos([]);
        //setDeudas([]);                          // ← limpiar deudas en logout
        return;
      }
      try {
        const [gastosGuardados, ingresosGuardados] =
          await Promise.all([
            obtenerMovimientos('gasto'),
            obtenerMovimientos('ingreso'),
          ]);
        //setProductos(productosGuardados);
        setGastos(gastosGuardados);
        setIngresos(ingresosGuardados);
        //setDeudas(deudasGuardadas);

      } catch (e) {
        console.error('Error cargando datos:', e.message);
      }
    });
    return () => unsubscribe();
  }, []);

  // ── MOTOR DE RECURRENCIA ─────────────────────────────────────────────────
  useEffect(() => {
    const timer = setTimeout(() => procesarGastosRecurrentes(), 1500);
    return () => clearTimeout(timer);
  }, [gastos.length]);

  const procesarGastosRecurrentes = () => {
    setGastos((prev) => {
      const hoy = new Date();
      let nuevosAuto = [];
      let huboCambios = false;
      const actualizados = prev.map((g) => {
        if (g.recurrente && g.recurrente.proximoCobro) {
          const fechaCobro = new Date(g.recurrente.proximoCobro);
          if (hoy >= fechaCobro) {
            huboCambios = true;
            const siguienteFecha = new Date(fechaCobro);
            if (g.recurrente.frecuencia === 'mensual') {
              siguienteFecha.setMonth(siguienteFecha.getMonth() + 1);
            } else {
              siguienteFecha.setDate(siguienteFecha.getDate() + 15);
            }
            if (g.recurrente.modo === 'auto') {
              nuevosAuto.push({
                ...g,
                id: Date.now().toString() + Math.random().toString().substring(2, 6),
                creadoEn: hoy.toISOString(),
                fecha: hoy.toISOString().split('T')[0],
                recurrente: null,
              });
            } else if (g.recurrente.modo === 'preguntar') {
              setTimeout(() => {
                Alert.alert(
                  'Gasto Recurrente Pendiente',
                  `¿Deseas registrar tu gasto de ${g.categoria} por ${g.montoDisplay}?`,
                  [
                    { text: 'Más tarde', style: 'cancel' },
                    {
                      text: 'Registrar',
                      onPress: () =>
                        agregarGasto({ ...g, recurrente: null, fecha: hoy.toISOString().split('T')[0] }),
                    },
                  ]
                );
              }, 500);
            }
            return { ...g, recurrente: { ...g.recurrente, proximoCobro: siguienteFecha.toISOString() } };
          }
        }
        return g;
      });
      if (huboCambios) return [...nuevosAuto, ...actualizados];
      return prev;
    });
  };



  // ── GASTOS E INGRESOS ────────────────────────────────────────────────────
  const agregarGasto = async (gasto) => {
    const monto = parseFloat(gasto.monto || 0);
    if (gasto.productoId) {
      const producto = productos.find(p => p.id === gasto.productoId);
      if (producto?.tipo === 'credito') {
        if ((producto.saldoUsado || 0) + monto > producto.cupoTotal) {
          Alert.alert('Cupo excedido', 'Estás superando el límite de tu tarjeta');
          return null;
        }
      } else {
        if ((producto.saldoActual || 0) < monto) {
          Alert.alert('Saldo insuficiente', `No tienes suficiente dinero en ${producto.nombre}`);
          return null;
        }
      }
    }
    try {
      const guardado = await crearMovimiento({
        tipo: 'gasto',
        monto,
        montoDisplay: '$' + gasto.montoDisplay,
        categoria: gasto.categoria || null,
        descripcion: gasto.descripcion || '',
        fecha: gasto.fecha || '',
        productoId: gasto.productoId || null,
        pagoConTarjeta: gasto.pagoConTarjeta || null,
        recurrente: gasto.recurrente || null,
      });
      setGastos((prev) => [guardado, ...prev]);
      if (gasto.productoId) {
        const producto = productos.find(p => p.id === gasto.productoId);
        if (producto?.tipo === 'credito') {
          cargarGastoATarjeta(producto.id, monto);
        } else {
          setProductos(prev =>
            prev.map(p => p.id === producto.id ? { ...p, saldoActual: (p.saldoActual || 0) - monto } : p)
          );
        }
      }
      return guardado;
    } catch (e) {
      console.error('Error al guardar gasto:', e.message);
      Alert.alert('Error', 'No se pudo guardar el gasto');
      return null;
    }
  };

  const agregarIngreso = async (ingreso) => {
    const monto = parseFloat(ingreso.monto || 0);
    try {
      const guardado = await crearMovimiento({
        tipo: 'ingreso',
        monto,
        montoDisplay: '$' + (ingreso.montoDisplay || monto),
        descripcion: ingreso.motivo || '',
        fecha: ingreso.fecha || '',
        productoId: ingreso.productoId || null,
        recurrente: ingreso.recurrente || null,
      });
      setIngresos((prev) => [guardado, ...prev]);
      if (ingreso.productoId) {
        setProductos(prev =>
          prev.map(p => p.id === ingreso.productoId ? { ...p, saldoActual: (p.saldoActual || 0) + monto } : p)
        );
      } else {
        const efectivo = productos.find(p => p.tipo === 'efectivo');
        if (efectivo) {
          setProductos(prev =>
            prev.map(p => p.id === efectivo.id ? { ...p, saldoActual: (p.saldoActual || 0) + monto } : p)
          );
        }
      }
      return guardado;
    } catch (e) {
      console.error('Error al guardar ingreso:', e.message);
      Alert.alert('Error', 'No se pudo guardar el ingreso');
      return null;
    }
  };



  // ── ESTADÍSTICAS ─────────────────────────────────────────────────────────
  const totalGastosMes = () => {
    const ahora = new Date();
    return gastos
      .filter(g => { const f = new Date(g.creadoEn); return f.getMonth() === ahora.getMonth() && f.getFullYear() === ahora.getFullYear(); })
      .reduce((acc, g) => acc + parseFloat(g.monto || 0), 0);
  };

  const totalIngresosMes = () => {
    const ahora = new Date();
    return ingresos
      .filter(i => { const f = new Date(i.creadoEn); return f.getMonth() === ahora.getMonth() && f.getFullYear() === ahora.getFullYear(); })
      .reduce((acc, i) => acc + parseFloat(i.monto || 0), 0);
  };

  const balanceMes = () =>
    !productos || productos.length === 0 ? 0 : productos.reduce((acc, p) => acc + (p.saldoActual || 0), 0);

  const movimientosRecientes = () =>
    [...gastos.map(g => ({ ...g, tipo: 'gasto' })), ...ingresos.map(i => ({ ...i, tipo: 'ingreso' }))]
      .sort((a, b) => new Date(b.creadoEn) - new Date(a.creadoEn))
      .slice(0, 5);

  const tarjetasCredito = () => (productos || []).filter((p) => p.tipo === 'credito');

  return (
    <FinanzContext.Provider value={{
      gastos, ingresos,
      agregarGasto, agregarIngreso,
      totalGastosMes, totalIngresosMes, balanceMes,
      movimientosRecientes, tarjetasCredito,
    }}>
      {children}
    </FinanzContext.Provider>
  );
};

export const useFinanz = () => useContext(FinanzContext);
