// src/hooks/useForgotPassword.js
import { useState } from 'react';

function esEmailValido(email) {
    return /\S+@\S+\.\S+/.test(email);
}

export function useForgotPassword() {
    const [email,   setEmail]   = useState('');
    const [loading, setLoading] = useState(false);
    const [sent,    setSent]    = useState(false);
    const [error,   setError]   = useState('');

    const handleSend = () => {
        if (!email || !esEmailValido(email)) {
            setError('Ingresa un correo válido');
            return;
        }
        setLoading(true);
        setError('');
        setTimeout(() => {
            setLoading(false);
            setSent(true);
            // ── Cuando conectes el backend, reemplaza esto
            // por una llamada a tu API de recuperación ──────
        }, 1200);
    };

    const handleEmailChange = (v) => {
        setEmail(v);
        setError('');
    };

    return {
        email, handleEmailChange,
        loading, sent, error,
        handleSend,
    };
}