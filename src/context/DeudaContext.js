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

    const marcarDeudaPagada = (id) => {
        setDeudas((prev) => prev.map((d) => d.id === id ? { ...d, estado: 'pagada' } : d));
        const deuda = deudas.find((d) => d.id === id);
        if (deuda?.productoId) {
            setProductos?.((prev) =>
                prev.map((p) => p.id === deuda.productoId ? { ...p, saldoUsado: 0 } : p)
            );
        }
    };

    const pagarCuota = async (deudaId, productoPagoId, montoAbono) => {
        try {
            const { deuda: deudaActualizada, montoPago } = await abonarDeudaAPI(deudaId, productoPagoId, montoAbono);
            setDeudas((prev) => prev.map((d) => (d.id === deudaId ? deudaActualizada : d)));
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

export const useDeudas = () => useContext(DeudaContext);