// src/hooks/useProfile.js
import { useState, useEffect } from 'react';
import { Alert } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useFinanz } from '../context/FinanzContext';
import { obtenerPerfil, actualizarPerfil } from '../services/userService';

export function useProfile() {
    const { usuario, logout } = useAuth();
    const { productos } = useFinanz();

    const [nombre, setNombre] = useState('');
    const [email, setEmail] = useState('');
    const [cargando, setCargando] = useState(true);
    const [guardando, setGuardando] = useState(false);
    const [editando, setEditando] = useState(false);

    // Iniciales para el avatar (ej: "Juan Pérez" → "JP")
    const initials = nombre
        ? nombre.trim().split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
        : (usuario?.email?.[0]?.toUpperCase() || '?');

    // ── Carga inicial ────────────────────────────────────────────────────────
    useEffect(() => {
        (async () => {
            try {
                const perfil = await obtenerPerfil();
                setNombre(perfil.nombre || '');
                setEmail(perfil.email || usuario?.email || '');
            } catch (e) {
                // Si falla el backend usamos lo que ya tenemos en AuthContext
                setEmail(usuario?.email || '');
                console.error('Error al cargar perfil:', e.message);
            } finally {
                setCargando(false);
            }
        })();
    }, []);

    // ── Guardar nombre ───────────────────────────────────────────────────────
    const handleGuardar = async () => {
        if (!nombre.trim()) {
            Alert.alert('Error', 'El nombre no puede estar vacío');
            return;
        }
        setGuardando(true);
        try {
            await actualizarPerfil(nombre.trim());
            setEditando(false);
            Alert.alert('Listo', 'Perfil actualizado correctamente');
        } catch (e) {
            Alert.alert('Error', 'No se pudo actualizar el perfil');
        } finally {
            setGuardando(false);
        }
    };

    // ── Logout ───────────────────────────────────────────────────────────────
    const handleLogout = () => {
        if (window.confirm('¿Seguro que deseas cerrar sesión?')) {
            logout();
        }
    };

    return {
        // datos
        nombre, email, initials, productos,
        // estado UI
        cargando, guardando, editando,
        // acciones
        setNombre, setEditando,
        handleGuardar, handleLogout,
    };
}