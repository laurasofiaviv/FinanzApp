// src/hooks/useForgotPassword.js
import { useState } from 'react';
import { forgotPassword } from '../services/authService';

// Valida formato básico de email con regex
function esEmailValido(email) {
  return /\S+@\S+\.\S+/.test(email);
}

export function useForgotPassword() {
  const [email,   setEmail]   = useState('');
  const [loading, setLoading] = useState(false);
  const [sent,    setSent]    = useState(false);// true cuando el correo fue enviado con éxito
  const [error,   setError]   = useState('');

  // Valida el email y llama al servicio; marca sent=true si Firebase responde OK
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

  // Limpia el error al editar el campo
  return {
    email, handleEmailChange: (v) => { setEmail(v); setError(''); },
    loading, sent, error,
    handleSend,
  };
}