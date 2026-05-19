//context/ProductContext.js
import React, { createContext, useState, useContext, useEffect } from 'react';
import { Alert } from 'react-native';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import {
  crearProducto,
  obtenerProductos,
  eliminarProducto as eliminarProductoAPI,
  editarProducto as editarProductoAPI,
} from '../services/productService';
import {
  crearDeuda as crearDeudaAPI,
  actualizarDeuda as actualizarDeudaAPI,
} from '../services/deudaService';

export const ProductContext = createContext();

export function proximaFechaPago(diaPago) {
  if (!diaPago) return '';
  const hoy = new Date();
  const fecha = new Date(hoy.getFullYear(), hoy.getMonth(), diaPago);
  if (fecha <= hoy) fecha.setMonth(fecha.getMonth() + 1);
  return fecha.toISOString().split('T')[0].split('-').reverse().join('/');
}

export const ProductProvider = ({ children, onDeudaEspejoCreada, onDeudaEspejoEliminada, deudas, setDeudas }) => {
  const [productos, setProductos] = useState([]);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) { setProductos([]); return; }
      try {
        const productosGuardados = await obtenerProductos();
        setProductos(productosGuardados);
      } catch (e) {
        console.error('Error cargando productos:', e.message);
      }
    });
    return () => unsubscribe();
  }, []);

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
        interesMensual: producto.interesMensual || 0,
      });
      const nuevo = { ...productoGuardado, saldoUsado: 0, deudaId: null };
      if (producto.tipo === 'credito') {
        const deudaEspejoData = {
          productoId: productoGuardado.id,
          tipo: 'Tarjeta de crédito',
          descripcion: producto.nombre,
          monto: 0, montoDisplay: '$0',
          cupoTotal: producto.cupoTotal || 0,
          diaCorte: String(producto.diaCorte || ''),
          diaPago: String(producto.diaPago || ''),
          franquicia: producto.franquicia || '',
          montoPagado: 0, cuotasPagadas: 0,
          cuotas: '1', interes: '0', pagoMinimo: 0,
          esEspejo: true, estado: 'pendiente',
          fechaVencimiento: proximaFechaPago(producto.diaPago),
          interes: String(producto.interesMensual || '0'),
        };
        const deudaGuardada = await crearDeudaAPI(deudaEspejoData);
        nuevo.deudaId = deudaGuardada.id;
        onDeudaEspejoCreada?.(deudaGuardada);
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
      if (prod?.deudaId) onDeudaEspejoEliminada?.(prod.deudaId);
      setProductos((prev) => prev.filter((p) => p.id !== id));
      return true;
    } catch (e) {
      console.error('Error al eliminar producto:', e.message);
      Alert.alert('Error', 'No se pudo eliminar el producto');
      return false;
    }
  };

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

  const cargarGastoATarjeta = async (productoId, monto) => {
    const producto = productos.find((p) => p.id === productoId);
    if (!producto) return;
    if ((producto.saldoUsado || 0) + monto > producto.cupoTotal) {
      Alert.alert('Cupo excedido', `Estás superando el límite de ${producto.nombre}`);
      return;
    }
    await editarProductoAPI(productoId, { saldoUsado: (producto.saldoUsado || 0) + monto });
    setProductos((prev) =>
      prev.map((p) => p.id !== productoId ? p : { ...p, saldoUsado: (p.saldoUsado || 0) + monto })
    );
    if (producto?.deudaId) {
      const deudaEspejo = deudas?.find(d => d.id === producto.deudaId);
      if (deudaEspejo) {
        const nuevoMonto = (deudaEspejo.monto || 0) + monto;
        await actualizarDeudaAPI(producto.deudaId, { monto: nuevoMonto });
        setDeudas?.((prev) =>
          prev.map((d) => d.id !== producto.deudaId ? d : { ...d, monto: nuevoMonto })
        );
      }
    }
  };

  const tarjetasCredito = () => productos.filter((p) => p.tipo === 'credito');

  return (
    <ProductContext.Provider value={{
      productos, setProductos,
      agregarProducto, eliminarProducto, editarProducto,
      cargarGastoATarjeta, tarjetasCredito,
    }}>
      {children}
    </ProductContext.Provider>
  );
};

export const useProductos = () => useContext(ProductContext);