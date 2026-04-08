//FinanzContext.js
// FinanzContext.js
import React, { createContext, useState, useContext, useEffect } from 'react';
import { Alert } from 'react-native';

export const FinanzContext = createContext();

export const FinanzProvider = ({ children }) => {
  const [gastos, setGastos] = useState([]);
  const [ingresos, setIngresos] = useState([]);
  const [deudas, setDeudas] = useState([]);
  const [productos, setProductos] = useState([]); // tarjetas y cuentas

  // ── MOTOR DE RECURRENCIA ──────────────────────────────────────────────────
  useEffect(() => {
    const timer = setTimeout(() => {
      procesarGastosRecurrentes();
    }, 1500);
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
                        agregarGasto({ ...g, recurrente: null, fecha: new Date().toISOString().split('T')[0] }),
                    },
                  ]
                );
              }, 500);
            }
            return {
              ...g,
              recurrente: { ...g.recurrente, proximoCobro: siguienteFecha.toISOString() },
            };
          }
        }
        return g;
      });

      if (huboCambios) return [...nuevosAuto, ...actualizados];
      return prev;
    });
  };

  // ── PRODUCTOS (TARJETAS Y CUENTAS) ───────────────────────────────────────

  /**
   * Agrega un producto bancario.
   * Para tarjetas de crédito crea automáticamente una deuda vinculada.
   *
   * @param {object} producto
   *   tipo:          'credito' | 'debito' | 'efectivo'
   *   nombre:        string   – nombre personalizado
   *   franquicia:    'visa' | 'mastercard' | 'amex' | null
   *   cupoTotal:     number   – solo crédito
   *   diaCorte:      number   – solo crédito
   *   diaPago:       number   – solo crédito
   *   banco:         string   – opcional
   */
  const agregarProducto = (producto) => {
    const id = Date.now().toString();
    const nuevo = {
      ...producto,
      id,
      creadoEn: new Date().toISOString(),
      saldoUsado: 0,
      deudaId: null,
      saldoActual: producto.saldoActual || 0, // 👈 AGREGA ESTO
    };

    // Si es tarjeta de crédito, crea una deuda espejo automáticamente
    if (producto.tipo === 'credito') {
      const deudaId = id + '_deuda';
      nuevo.deudaId = deudaId;

      const deudaEspejo = {
        id: deudaId,
        productoId: id,
        tipo: 'Tarjeta de crédito',
        descripcion: producto.nombre,
        monto: 0,             // se actualiza con cada gasto vinculado
        cupoTotal: producto.cupoTotal || 0,
        diaCorte: producto.diaCorte,
        diaPago: producto.diaPago,
        franquicia: producto.franquicia,
        montoPagado: 0,
        cuotasPagadas: 0,
        cuotas: 1,
        esEspejo: true,       // flag para distinguirla de deudas manuales
        creadoEn: new Date().toISOString(),
        estado: 'pendiente',
        fechaVencimiento: proximaFechaPago(producto.diaPago),
      };

      setDeudas((prev) => [deudaEspejo, ...prev]);
    }

    setProductos((prev) => [nuevo, ...prev]);
    return nuevo;
  };

  const eliminarProducto = (id) => {
    const prod = productos.find((p) => p.id === id);
    if (prod?.deudaId) {
      setDeudas((prev) => prev.filter((d) => d.id !== prod.deudaId));
    }
    setProductos((prev) => prev.filter((p) => p.id !== id));
  };

  /**
   * Actualiza el saldo usado de una tarjeta de crédito
   * y sincroniza el monto de la deuda espejo.
   */
  const cargarGastoATarjeta = (productoId, monto) => {
    const producto = productos.find((p) => p.id === productoId);

    if (!producto) return;

    // VALIDAR CUPO
    if ((producto.saldoUsado || 0) + monto > producto.cupoTotal) {
      Alert.alert(
        'Cupo excedido',
        `Estás superando el límite de ${producto.nombre}`
      );
      return; // CANCELA el registro
    }

    // ACTUALIZAR SALDO USADO
    setProductos((prev) =>
      prev.map((p) => {
        if (p.id !== productoId) return p;
        return { ...p, saldoUsado: (p.saldoUsado || 0) + monto };
      })
    );

    // SINCRONIZAR DEUDA
    if (producto?.deudaId) {
      setDeudas((prev) =>
        prev.map((d) => {
          if (d.id !== producto.deudaId) return d;
          const nuevoMonto = (d.monto || 0) + monto;
          return { ...d, monto: nuevoMonto };
        })
      );
    }
  };

  // ── FUNCIONES DE GASTOS E INGRESOS ───────────────────────────────────────
  const agregarGasto = (gasto) => {
    const monto = parseFloat(gasto.monto || 0);

    // 🔴 VALIDAR ANTES DE TODO
    if (gasto.productoId) {
      const producto = productos.find(p => p.id === gasto.productoId);

      if (producto?.tipo === 'credito') {
        // VALIDAR CUPO
        if ((producto.saldoUsado || 0) + monto > producto.cupoTotal) {
          Alert.alert('Cupo excedido', 'Estás superando el límite de tu tarjeta');
          return null; // 🚫 NO guarda
        }

      } else {
        // VALIDAR SALDO
        if ((producto.saldoActual || 0) < monto) {
          Alert.alert(
            'Saldo insuficiente',
            `No tienes suficiente dinero en ${producto.nombre}`
          );
          return null; // 🚫 NO guarda
        }
      }
    }

    // ✅ SOLO SI PASA VALIDACIONES

    let recurrenteData = gasto.recurrente;

    if (recurrenteData) {
      const fechaBase = gasto.fecha
        ? new Date(gasto.fecha.split('/').reverse().join('-'))
        : new Date();

      const proximo = new Date(fechaBase);

      if (recurrenteData.frecuencia === 'mensual') {
        proximo.setMonth(proximo.getMonth() + 1);
      } else {
        proximo.setDate(proximo.getDate() + 15);
      }

      recurrenteData = {
        ...recurrenteData,
        proximoCobro: proximo.toISOString()
      };
    }

    const nuevo = {
      ...gasto,
      id: Date.now().toString(),
      creadoEn: new Date().toISOString(),
      recurrente: recurrenteData,
    };

    setGastos((prev) => [nuevo, ...prev]);

    // 🔄 ACTUALIZAR PRODUCTO
    if (gasto.productoId) {
      const producto = productos.find(p => p.id === gasto.productoId);

      if (producto?.tipo === 'credito') {
        cargarGastoATarjeta(producto.id, monto);
      } else {
        setProductos(prev =>
          prev.map(p =>
            p.id === producto.id
              ? { ...p, saldoActual: (p.saldoActual || 0) - monto }
              : p
          )
        );
      }
    }

    return nuevo;
  };

  const agregarIngreso = (ingreso) => {
    const nuevo = {
      ...ingreso,
      id: Date.now().toString(),
      creadoEn: new Date().toISOString()
    };

    const monto = parseFloat(ingreso.monto || 0); //AQUÍ SE DEFINE

    setIngresos((prev) => [nuevo, ...prev]);

    // SUMAR SALDO AL PRODUCTO
    if (ingreso.productoId) {
      setProductos(prev =>
        prev.map(p =>
          p.id === ingreso.productoId
            ? { ...p, saldoActual: (p.saldoActual || 0) + monto }
            : p
        )
      );
    } else {
      // fallback: efectivo
      const efectivo = productos.find(p => p.tipo === 'efectivo');

      if (efectivo) {
        setProductos(prev =>
          prev.map(p =>
            p.id === efectivo.id
              ? { ...p, saldoActual: (p.saldoActual || 0) + monto }
              : p
          )
        );
      }
    }

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
      estado: 'pendiente',
    };
    setDeudas((prev) => [nuevo, ...prev]);
    return nuevo;
  };

  const marcarDeudaPagada = (id) => {
    setDeudas((prev) => prev.map((d) => (d.id === id ? { ...d, estado: 'pagada' } : d)));
    // Si es espejo de tarjeta, resetear saldo usado
    const deuda = deudas.find((d) => d.id === id);
    if (deuda?.productoId) {
      setProductos((prev) =>
        prev.map((p) => (p.id === deuda.productoId ? { ...p, saldoUsado: 0 } : p))
      );
    }
  };

  const pagarCuota = (deudaId, productoPagoId) => {
    // ─────────────────────────────────────────
    // 1. BUSCAR DATOS
    // ─────────────────────────────────────────
    const deuda = deudas.find(d => d.id === deudaId);
    const producto = productos.find(p => p.id === productoPagoId);

    if (!deuda || !producto) {
      Alert.alert('Error', 'No se encontró la deuda o la cuenta');
      return;
    }

    // ─────────────────────────────────────────
    // 2. CALCULAR MONTO A PAGAR (SIN MUTAR)
    // ─────────────────────────────────────────
    let montoPagadoAhora = 0;

    if (!deuda.cuotas || deuda.cuotas <= 1) {
      montoPagadoAhora = deuda.monto - (deuda.montoPagado || 0);
    } else {
      montoPagadoAhora = deuda.monto / deuda.cuotas;
    }

    // VALIDAR MONTO
    if (montoPagadoAhora <= 0) {
      Alert.alert('Error', 'No hay nada pendiente por pagar');
      return;
    }

    // ─────────────────────────────────────────
    // 3. VALIDAR SALDO (CRÍTICO)
    // ─────────────────────────────────────────
    if ((producto.saldoActual || 0) < montoPagadoAhora) {
      Alert.alert(
        'Saldo insuficiente',
        `No tienes suficiente dinero en ${producto.nombre}`
      );
      return; // 🚫 CANCELA TODO
    }

    // ─────────────────────────────────────────
    // 4. EJECUTAR TRANSACCIÓN
    // ─────────────────────────────────────────

    // 4.1 ACTUALIZAR DEUDA
    setDeudas(prev =>
      prev.map(d => {
        if (d.id !== deudaId) return d;

        if (!d.cuotas || d.cuotas <= 1) {
          return {
            ...d,
            montoPagado: d.monto,
            estado: 'pagada'
          };
        }

        const valorCuota = d.monto / d.cuotas;
        const nuevasCuotasPagadas = (d.cuotasPagadas || 0) + 1;
        const nuevoMontoPagado = (d.montoPagado || 0) + valorCuota;

        return {
          ...d,
          cuotasPagadas: nuevasCuotasPagadas,
          montoPagado: nuevoMontoPagado,
          estado: nuevasCuotasPagadas >= d.cuotas ? 'pagada' : 'pendiente'
        };
      })
    );

    // 4.2 DESCONTAR SALDO DE CUENTA
    setProductos(prev =>
      prev.map(p =>
        p.id === productoPagoId
          ? { ...p, saldoActual: (p.saldoActual || 0) - montoPagadoAhora }
          : p
      )
    );

    // 4.3 SI ES DEUDA DE TARJETA → LIBERAR CUPO
    if (deuda.productoId) {
      setProductos(prev =>
        prev.map(p => {
          if (p.id !== deuda.productoId) return p;

          return {
            ...p,
            saldoUsado: Math.max(
              (p.saldoUsado || 0) - montoPagadoAhora,
              0
            )
          };
        })
      );
    }

    // ─────────────────────────────────────────
    // 5. FEEDBACK
    // ─────────────────────────────────────────
    Alert.alert(
      'Pago exitoso',
      `Pagaste $${montoPagadoAhora.toLocaleString('es-CO')}`
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

  const balanceMes = () => {
    if (!productos || productos.length === 0) return 0;

    return productos.reduce((acc, p) => acc + (p.saldoActual || 0), 0);
  };

  const movimientosRecientes = () => {
    const todosGastos = gastos.map((g) => ({ ...g, tipo: 'gasto' }));
    const todosIngresos = ingresos.map((i) => ({ ...i, tipo: 'ingreso' }));
    return [...todosGastos, ...todosIngresos]
      .sort((a, b) => new Date(b.creadoEn) - new Date(a.creadoEn))
      .slice(0, 5);
  };

  // ── HELPERS ──────────────────────────────────────────────────────────────
  /** Devuelve tarjetas de crédito activas (para selector al registrar gasto) */
  const tarjetasCredito = () =>
    productos.filter((p) => p.tipo === 'credito');

  return (
    <FinanzContext.Provider
      value={{
        gastos,
        ingresos,
        deudas,
        productos,
        agregarGasto,
        agregarIngreso,
        agregarDeuda,
        agregarProducto,
        eliminarProducto,
        pagarCuota,
        marcarDeudaPagada,
        totalGastosMes,
        totalIngresosMes,
        balanceMes,
        movimientosRecientes,
        tarjetasCredito,
      }}
    >
      {children}
    </FinanzContext.Provider>
  );
};

export const useFinanz = () => useContext(FinanzContext);

// ── UTIL EXPORTADA ────────────────────────────────────────────────────────
/** Calcula la próxima fecha de pago dado el día del mes */
export function proximaFechaPago(diaPago) {
  if (!diaPago) return '';
  const hoy = new Date();
  const fecha = new Date(hoy.getFullYear(), hoy.getMonth(), diaPago);
  if (fecha <= hoy) fecha.setMonth(fecha.getMonth() + 1);
  return fecha.toISOString().split('T')[0].split('-').reverse().join('/');
}