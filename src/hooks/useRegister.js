// src/hooks/useRegister.js
import { useState, useRef, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

export const PASSWORD_RULES = [
    { id: 'len',     label: 'Mínimo 8 caracteres',                    test: (p) => p.length >= 8 },
    { id: 'upper',   label: 'Al menos una mayúscula',                  test: (p) => /[A-Z]/.test(p) },
    { id: 'number',  label: 'Al menos un número',                      test: (p) => /[0-9]/.test(p) },
    { id: 'special', label: 'Al menos un carácter especial (!@#$...)', test: (p) => /[^A-Za-z0-9]/.test(p) },
];

export function calcularFuerzaPassword(password) {
    const passed = PASSWORD_RULES.filter((r) => r.test(password)).length;
    const colors  = ['#E74C3C', '#E74C3C', '#F39C12', '#F39C12', '#2ECC71'];
    const labels  = ['', 'Muy débil', 'Débil', 'Regular', 'Fuerte'];
    return { passed, color: colors[passed], label: labels[passed] };
}

export function useRegister(navigation) {
    const { simulateEmailVerification } = useContext(AuthContext);

    const [nombre,       setNombre]       = useState('');
    const [email,        setEmail]        = useState('');
    const [password,     setPassword]     = useState('');
    const [confirm,      setConfirm]      = useState('');
    const [showPass,     setShowPass]     = useState(false);
    const [showConf,     setShowConf]     = useState(false);
    const [loading,      setLoading]      = useState(false);
    const [errors,       setErrors]       = useState({});
    const [showStrength, setShowStrength] = useState(false);

    const emailRef   = useRef(null);
    const passRef    = useRef(null);
    const confirmRef = useRef(null);

    const { passed: rulesPassed } = calcularFuerzaPassword(password);
    const allRulesPassed = rulesPassed === PASSWORD_RULES.length;

    const limpiarError = (campo) =>
        setErrors((p) => ({ ...p, [campo]: null }));

    const validar = () => {
        const e = {};
        if (!nombre.trim())         e.nombre   = 'El nombre es obligatorio';
        if (!email)                 e.email    = 'El correo es obligatorio';
        if (!allRulesPassed)        e.password = 'La contraseña no cumple los requisitos';
        if (password !== confirm)   e.confirm  = 'Las contraseñas no coinciden';
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const handleRegister = () => {
        if (!validar()) return;
        setLoading(true);
        setTimeout(() => {
            setLoading(false);
            // ── Cuando conectes el backend, reemplaza esto
            // por una llamada a tu API de registro ──────────
            simulateEmailVerification(email);
            navigation.navigate('EmailSent', { email });
        }, 1200);
    };

    return {
        nombre,   setNombre,
        email,    setEmail,
        password, setPassword,
        confirm,  setConfirm,
        showPass, setShowPass: () => setShowPass((v) => !v),
        showConf, setShowConf: () => setShowConf((v) => !v),
        loading,
        errors,
        showStrength, setShowStrength,
        allRulesPassed,
        emailRef, passRef, confirmRef,
        limpiarError,
        handleRegister,
    };
}