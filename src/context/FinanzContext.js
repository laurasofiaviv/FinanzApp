// src/context/FinanzContext.js
import React, { createContext, useState, useContext, useEffect } from 'react';
import { Alert } from 'react-native';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import {
  crearProducto,
  obtenerProductos,
  eliminarProducto as eliminarProductoAPI,
  editarProducto as editarProductoAPI,          // ← nuevo import
} from '../services/productService';
import { crearMovimiento, obtenerMovimientos } from '../services/movimientoService';

export const FinanzContext = createContext();

export const FinanzProvider = ({ children }) => {
  const [gastos, setGastos] = useState([]);
  const [ingresos, setIngresos] = useState([]);
  const [deudas, setDeudas] = useState([]);
  const [productos, setProductos] = useState([]);

  // ── CARGA INICIAL DESDE FIRESTORE ────────────────────────────────────────
  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setProductos([]);
        setGastos([]);
        setIngresos([]);
        setDeudas([]);                          // ← limpiar deudas en logout
        return;
      }
      try {
        const [productosGuardados, gastosGuardados, ingresosGuardados] = await Promise.all([
          obtenerProductos(),
          obtenerMovimientos('gasto'),
          obtenerMovimientos('ingreso'),
        ]);
        setProductos(productosGuardados);
        setGastos(gastosGuardados);
        setIngresos(ingresosGuardados);
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

  // ── PRODUCTOS ────────────────────────────────────────────────────────────
  const agregarProducto = async (producto) => {
    try {
      const productoGuardado = await crearProducto({
        tipo: producto.tipo,
        nombre: producto.nombre,
        banco: producto.banco || '',
        franquicia: producto.franquicia || null,
        cupoTotal: producto.cupoTotal || null,
        diaCorte: producto.diaCorte || null,
        diaPago: producto.diaPago || null,
        saldoActual: producto.saldoActual || 0,
      });

      const nuevo = { ...productoGuardado, saldoUsado: 0, deudaId: null };

      if (producto.tipo === 'credito') {
        const deudaId = productoGuardado.id + '_deuda';
        nuevo.deudaId = deudaId;
        setDeudas((prev) => [{
          id: deudaId,
          productoId: productoGuardado.id,
          tipo: 'Tarjeta de crédito',
          descripcion: producto.nombre,
          monto: 0,
          cupoTotal: producto.cupoTotal || 0,
          diaCorte: producto.diaCorte,
          diaPago: producto.diaPago,
          franquicia: producto.franquicia,
          montoPagado: 0,
          cuotasPagadas: 0,
          cuotas: 1,
          esEspejo: true,
          creadoEn: new Date().toISOString(),
          estado: 'pendiente',
          fechaVencimiento: proximaFechaPago(producto.diaPago),
        }, ...prev]);
      }

      setProductos((prev) => [nuevo, ...prev]);
      return nuevo;
    } catch (e) {
      console.error('Error al guardar producto:', e.message);
      Alert.alert('Error', 'No se pudo guardar el producto');
    }
  };

  const eliminarProducto = async (id) => {
    try {
      await eliminarProductoAPI(id);
      const prod = productos.find((p) => p.id === id);
      if (prod?.deudaId) setDeudas((prev) => prev.filter((d) => d.id !== prod.deudaId));
      setProductos((prev) => prev.filter((p) => p.id !== id));
      return true;                                              // ← agrega
    } catch (e) {
      console.error('Error al eliminar producto:', e.message);
      Alert.alert('Error', 'No se pudo eliminar el producto');
      return false;
    }
  };

  // ── EDITAR PRODUCTO ──────────────────────────────────────────────────────
  const editarProducto = async (productoId, datos) => {
    try {
      const actualizado = await editarProductoAPI(productoId, datos);
      setProductos((prev) =>
        prev.map((p) => (p.id === productoId ? { ...p, ...actualizado } : p))
      );
      return actualizado;
    } catch (e) {
      console.error('Error al editar producto:', e.message);
      Alert.alert('Error', 'No se pudo actualizar el producto');
      return null;
    }
  };

  // ── GASTO EN TARJETA ─────────────────────────────────────────────────────
  const cargarGastoATarjeta = (productoId, monto) => {
    const producto = productos.find((p) => p.id === productoId);
    if (!producto) return;
    if ((producto.saldoUsado || 0) + monto > producto.cupoTotal) {
      Alert.alert('Cupo excedido', `Estás superando el límite de ${producto.nombre}`);
      return;
    }
    setProductos((prev) =>
      prev.map((p) => p.id !== productoId ? p : { ...p, saldoUsado: (p.saldoUsado || 0) + monto })
    );
    if (producto?.deudaId) {
      setDeudas((prev) =>
        prev.map((d) => d.id !== producto.deudaId ? d : { ...d, monto: (d.monto || 0) + monto })
      );
    }
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

  // ── DEUDAS ───────────────────────────────────────────────────────────────
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
    setDeudas((prev) => prev.map((d) => d.id === id ? { ...d, estado: 'pagada' } : d));
    const deuda = deudas.find((d) => d.id === id);
    if (deuda?.productoId) {
      setProductos((prev) =>
        prev.map((p) => p.id === deuda.productoId ? { ...p, saldoUsado: 0 } : p)
      );
    }
  };

  const pagarCuota = (deudaId, productoPagoId) => {
    const deuda = deudas.find(d => d.id === deudaId);
    const producto = productos.find(p => p.id === productoPagoId);
    if (!deuda || !producto) { Alert.alert('Error', 'No se encontró la deuda o la cuenta'); return; }

    const montoPagadoAhora = (!deuda.cuotas || deuda.cuotas <= 1)
      ? deuda.monto - (deuda.montoPagado || 0)
      : deuda.monto / deuda.cuotas;

    if (montoPagadoAhora <= 0) { Alert.alert('Error', 'No hay nada pendiente por pagar'); return; }
    if ((producto.saldoActual || 0) < montoPagadoAhora) {
      Alert.alert('Saldo insuficiente', `No tienes suficiente dinero en ${producto.nombre}`);
      return;
    }

    setDeudas(prev => prev.map(d => {
      if (d.id !== deudaId) return d;
      if (!d.cuotas || d.cuotas <= 1) return { ...d, montoPagado: d.monto, estado: 'pagada' };
      const nuevasCuotasPagadas = (d.cuotasPagadas || 0) + 1;
      return {
        ...d,
        cuotasPagadas: nuevasCuotasPagadas,
        montoPagado: (d.montoPagado || 0) + d.monto / d.cuotas,
        estado: nuevasCuotasPagadas >= d.cuotas ? 'pagada' : 'pendiente',
      };
    }));
    setProductos(prev =>
      prev.map(p => p.id === productoPagoId ? { ...p, saldoActual: (p.saldoActual || 0) - montoPagadoAhora } : p)
    );
    if (deuda.productoId) {
      setProductos(prev =>
        prev.map(p => p.id !== deuda.productoId ? p : { ...p, saldoUsado: Math.max((p.saldoUsado || 0) - montoPagadoAhora, 0) })
      );
    }
    Alert.alert('Pago exitoso', `Pagaste $${montoPagadoAhora.toLocaleString('es-CO')}`);
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
    productos.length === 0 ? 0 : productos.reduce((acc, p) => acc + (p.saldoActual || 0), 0);

  const movimientosRecientes = () =>
    [...gastos.map(g => ({ ...g, tipo: 'gasto' })), ...ingresos.map(i => ({ ...i, tipo: 'ingreso' }))]
      .sort((a, b) => new Date(b.creadoEn) - new Date(a.creadoEn))
      .slice(0, 5);

  const tarjetasCredito = () => productos.filter((p) => p.tipo === 'credito');

  return (
    <FinanzContext.Provider value={{
      gastos, ingresos, deudas, productos,
      agregarGasto, agregarIngreso,
      agregarDeuda, agregarProducto, eliminarProducto,
      editarProducto,                                   // ← expuesto
      pagarCuota, marcarDeudaPagada,
      totalGastosMes, totalIngresosMes, balanceMes,
      movimientosRecientes, tarjetasCredito,
    }}>
      {children}
    </FinanzContext.Provider>
  );
};

export const useFinanz = () => useContext(FinanzContext);

export function proximaFechaPago(diaPago) {
  if (!diaPago) return '';
  const hoy = new Date();
  const fecha = new Date(hoy.getFullYear(), hoy.getMonth(), diaPago);
  if (fecha <= hoy) fecha.setMonth(fecha.getMonth() + 1);
  return fecha.toISOString().split('T')[0].split('-').reverse().join('/');
}