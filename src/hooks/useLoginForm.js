// src/hooks/useLoginForm.js
import { useState, useRef, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { loginUser } from '../services/authService';
import { getAuth } from 'firebase/auth';

// Valida formato básico de email con regex
function validarEmail(email) {
  return /\S+@\S+\.\S+/.test(email);
}

export function useLoginForm(navigation) {
  const { login } = useContext(AuthContext);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const passRef = useRef(null);// ref para enfocar el campo de contraseña al avanzar con el teclado

  // Limpia el error de un campo específico y el error general
  const limpiarError = (campo) =>
    setErrors((p) => ({ ...p, [campo]: null, general: null }));

  // Valida email y contraseña antes de enviar
  const validar = () => {
    const e = {};
    if (!email || !validarEmail(email)) e.email = 'Ingresa un correo válido';
    if (!password) e.password = 'La contraseña es obligatoria';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  /**
   * Autentica con Firebase a través del backend.
   * Después del login agrega emailVerified al estado del contexto
   * para que AppNavigator decida si mostrar la pantalla de verificación.
   */
  const handleLogin = async () => {
    if (!validar()) return;
    setLoading(true);
    try {
      const userData = await loginUser({ email, password });
      const firebaseUser = getAuth().currentUser;
      login({
        ...userData,
        emailVerified: firebaseUser?.emailVerified ?? false,
      });
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