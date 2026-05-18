//hooks/useProfile
import { useState, useEffect } from 'react';
import { Alert } from 'react-native';
import { getAuth, updatePassword, reauthenticateWithCredential, EmailAuthProvider } from 'firebase/auth';
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
    // ── nuevo: estado para cambio de contraseña ──
    const [passActual, setPassActual] = useState('');
    const [passNueva, setPassNueva] = useState('');
    const [passConfirm, setPassConfirm] = useState('');
    const [passError, setPassError] = useState('');
    const [passExito, setPassExito] = useState('');
    const [guardandoPass, setGuardandoPass] = useState(false);

    const initials = nombre
        ? nombre.trim().split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
        : (usuario?.email?.[0]?.toUpperCase() || '?');

    useEffect(() => {
        (async () => {
            try {
                const perfil = await obtenerPerfil();
                setNombre(perfil.nombre || '');
                setEmail(perfil.email || usuario?.email || '');
            } catch (e) {
                setEmail(usuario?.email || '');
                console.error('Error al cargar perfil:', e.message);
            } finally {
                setCargando(false);
            }
        })();
    }, []);

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

    // ── nuevo: cambiar contraseña ────────────────────────────────────────
    const handleCambiarPassword = async () => {
        setPassError('');
        setPassExito('');

        if (!passActual.trim()) {
            setPassError('Ingresa tu contraseña actual');  // ← setPassError, no Alert
            return;
        }
        if (passNueva.length < 6) {
            setPassError('La nueva contraseña debe tener al menos 6 caracteres');
            return;
        }
        if (passNueva !== passConfirm) {
            setPassError('Las contraseñas nuevas no coinciden');
            return;
        }
        
        setGuardandoPass(true);
        try {
            const auth = getAuth();
            const user = auth.currentUser;
            const credential = EmailAuthProvider.credential(user.email, passActual);
            await reauthenticateWithCredential(user, credential);
            await updatePassword(user, passNueva);
            // limpiar campos
            setPassActual('');
            setPassNueva('');
            setPassConfirm('');
            setPassExito('✓ Contraseña actualizada correctamente');
        } catch (e) {
            setPassError(
                e.code === 'auth/wrong-password' || e.code === 'auth/invalid-credential'
                    ? 'La contraseña actual es incorrecta'
                    : 'No se pudo cambiar la contraseña'
            );
        } finally {
            setGuardandoPass(false);
        }
    };

    const handleLogout = () => logout();

    return {
        nombre, email, initials, productos,
        cargando, guardando, editando,
        setNombre, setEditando,
        handleGuardar, handleLogout,
        // contraseña
        passActual, setPassActual,
        passNueva, setPassNueva,
        passConfirm, setPassConfirm,
        guardandoPass, handleCambiarPassword,
        passError, setPassError, passExito,
    };
}