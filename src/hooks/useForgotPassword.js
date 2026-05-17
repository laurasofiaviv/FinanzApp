// src/hooks/useForgotPassword.js
import { useState } from 'react';
import { forgotPassword } from '../services/authService';

function esEmailValido(email) {
  return /\S+@\S+\.\S+/.test(email);
}

export function useForgotPassword() {
  const [email,   setEmail]   = useState('');
  const [loading, setLoading] = useState(false);
  const [sent,    setSent]    = useState(false);
  const [error,   setError]   = useState('');

  const handleSend = async () => {
    if (!email || !esEmailValido(email)) {
      setError('Ingresa un correo válido');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await forgotPassword(email);
      setSent(true);
    } catch {
      setError('No se pudo enviar el correo. Verifica la dirección.');
    } finally {
      setLoading(false);
    }
  };

  return {
    email, handleEmailChange: (v) => { setEmail(v); setError(''); },
    loading, sent, error,
    handleSend,
  };
}