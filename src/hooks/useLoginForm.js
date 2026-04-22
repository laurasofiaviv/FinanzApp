// src/hooks/useLoginForm.js
import { useState, useRef, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

function validarEmail(email) {
    return /\S+@\S+\.\S+/.test(email);
}

export function useLoginForm(navigation) {
    const { login } = useContext(AuthContext);

    const [email,    setEmail]    = useState('');
    const [password, setPassword] = useState('');
    const [showPass, setShowPass] = useState(false);
    const [loading,  setLoading]  = useState(false);
    const [errors,   setErrors]   = useState({});
    const passRef = useRef(null);

    const limpiarError = (campo) =>
        setErrors((p) => ({ ...p, [campo]: null, general: null }));

    const validar = () => {
        const e = {};
        if (!email)               e.email    = 'El correo es obligatorio';
        if (!validarEmail(email)) e.email    = 'Ingresa un correo válido';
        if (!password)            e.password = 'La contraseña es obligatoria';
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const handleLogin = () => {
        if (!validar()) return;
        setLoading(true);
        setTimeout(() => {
            setLoading(false);
            // ── Cuando conectes el backend, reemplaza este bloque
            // por una llamada a tu API de autenticación ──────────
            if (email === 'admin@financify.com' && password === 'Admin123!') {
                login({ email, nombre: 'Juan Pérez', verificado: true });
            } else {
                setErrors({ general: 'Correo o contraseña incorrectos' });
            }
        }, 1200);
    };

    return {
        email,    setEmail,
        password, setPassword,
        showPass, setShowPass: () => setShowPass((v) => !v),
        loading,
        errors,
        passRef,
        limpiarError,
        handleLogin,
    };
}