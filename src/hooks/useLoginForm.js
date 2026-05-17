// src/hooks/useLoginForm.js
import { useState, useRef, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { loginUser } from '../services/authService';

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
    if (!email || !validarEmail(email)) e.email    = 'Ingresa un correo válido';
    if (!password)                       e.password = 'La contraseña es obligatoria';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleLogin = async () => {
    if (!validar()) return;
    setLoading(true);
    try {
      const userData = await loginUser({ email, password });
      login(userData);  // guarda en AuthContext → navega al Main
    } catch (e) {
      setErrors({ general: e.message || 'Correo o contraseña incorrectos' });
    } finally {
      setLoading(false);
    }
  };

  return {
    email, setEmail,
    password, setPassword,
    showPass, setShowPass: () => setShowPass((v) => !v),
    loading, errors, passRef,
    limpiarError, handleLogin,
  };
}