// src/hooks/useProfile.js
import { useContext } from 'react';
import { Alert } from 'react-native';
import { AuthContext } from '../context/AuthContext';
import { useFinanz } from '../context/FinanzContext';

// ── Helpers puros ─────────────────────────────────────────────────────────
export function calcularIniciales(nombre) {
    return nombre
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
}

export function calcularCupoProducto(producto) {
    const cupoTotal  = producto.cupoTotal  || 0;
    const saldoUsado = producto.saldoUsado || 0;
    const disponible = cupoTotal - saldoUsado;
    const pct        = cupoTotal > 0 ? Math.min((saldoUsado / cupoTotal) * 100, 100) : 0;
    const barColor   = pct > 80 ? '#E74C3C' : pct > 50 ? '#F39C12' : '#1A56E8';
    return { disponible, pct, barColor };
}

export function formatCOP(n) {
    if (!n && n !== 0) return '$0';
    return '$' + Number(n).toLocaleString('es-CO');
}

// ── Hook principal ────────────────────────────────────────────────────────
export function useProfile() {
    const { usuario, logout } = useContext(AuthContext);
    const { productos }       = useFinanz();

    const nombre   = usuario?.nombre || 'Juan Pérez';
    const email    = usuario?.email  || 'admin@financify.com';
    const initials = calcularIniciales(nombre);

    const handleLogout = () => {
        Alert.alert(
            'Cerrar sesión',
            '¿Estás seguro de que quieres cerrar sesión?',
            [
                { text: 'Cancelar', style: 'cancel' },
                { text: 'Cerrar sesión', style: 'destructive', onPress: logout },
            ]
        );
    };

    return {
        nombre, email, initials,
        productos,
        handleLogout,
        calcularCupoProducto,
        formatCOP,
    };
}