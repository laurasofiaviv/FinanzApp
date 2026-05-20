//context/DeudaContext.js
import React, { createContext, useState, useContext, useEffect } from 'react';
import { Alert } from 'react-native';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import {
    crearDeuda as crearDeudaAPI,
    obtenerDeudas,
    abonarDeuda as abonarDeudaAPI,
} from '../services/deudaService';
import { useProductos } from './ProductContext';

export const DeudaContext = createContext();

export const DeudaProvider = ({ children }) => {
    // Necesita setProductos para actualizar saldos cuando se paga una cuota
    const { setProductos } = useProductos();
    const [deudas, setDeudas] = useState([]);

    useEffect(() => {
        const auth = getAuth();
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (!user) { setDeudas([]); return; }
            try {
                const deudasGuardadas = await obtenerDeudas();
                setDeudas(deudasGuardadas);
            } catch (e) {
                console.error('Error cargando deudas:', e.message);
            }
        });
        return () => unsubscribe();
    }, []);

    // Persiste una nueva deuda en Firestore y la agrega al estado local
    const agregarDeuda = async (deuda) => {
        try {
            const guardada = await crearDeudaAPI(deuda);
            setDeudas((prev) => [guardada, ...prev]);
            return guardada;
        } catch (e) {
            console.error('Error al guardar deuda:', e.message);
            Alert.alert('Error', 'No se pudo guardar la deuda');
            return null;
        }
    };

    // Marca una deuda como pagada en memoria y resetea el saldoUsado del producto vinculado
    const marcarDeudaPagada = (id) => {
        setDeudas((prev) => prev.map((d) => d.id === id ? { ...d, estado: 'pagada' } : d));
        const deuda = deudas.find((d) => d.id === id);
        if (deuda?.productoId) {
            setProductos?.((prev) =>
                prev.map((p) => p.id === deuda.productoId ? { ...p, saldoUsado: 0 } : p)
            );
        }
    };

    // Registra un abono en el backend, actualiza la deuda y descuenta el saldo del producto usado para pagar
    const pagarCuota = async (deudaId, productoPagoId, montoAbono) => {
        try {
            const { deuda: deudaActualizada, montoPago } = await abonarDeudaAPI(deudaId, productoPagoId, montoAbono);
            setDeudas((prev) => prev.map((d) => (d.id === deudaId ? deudaActualizada : d)));
            // Descuenta del producto con el que se realizó el pago
            setProductos?.((prev) =>
                prev.map((p) =>
                    p.id === productoPagoId
                        ? { ...p, saldoActual: (p.saldoActual || 0) - montoPago }
                        : p
                )
            );
            Alert.alert('Pago exitoso', `Pagaste $${montoPago.toLocaleString('es-CO')}`);
        } catch (e) {
            Alert.alert('Error', e.message || 'No se pudo registrar el pago');
        }
    };

    return (
        <DeudaContext.Provider value={{
            deudas, setDeudas,
            agregarDeuda, marcarDeudaPagada, pagarCuota,
        }}>
            {children}
        </DeudaContext.Provider>
    );
};
// Hook de acceso directo al contexto de deudas
export const useDeudas = () => useContext(DeudaContext);