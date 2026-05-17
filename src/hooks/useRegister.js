// src/hooks/useRegister.js
import { useState, useRef } from 'react';
import { registerUser } from '../services/authService';

export const PASSWORD_RULES = [
  { id: 'len',     label: 'Mínimo 8 caracteres',                    test: (p) => p.length >= 8 },
  { id: 'upper',   label: 'Al menos una mayúscula',                  test: (p) => /[A-Z]/.test(p) },
  { id: 'number',  label: 'Al menos un número',                      test: (p) => /[0-9]/.test(p) },
  { id: 'special', label: 'Al menos un carácter especial (!@#$...)', test: (p) => /[^A-Za-z0-9]/.test(p) },
];

export function useRegister(navigation) {
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

  const rulesPassed   = PASSWORD_RULES.filter(r => r.test(password)).length;
  const allRulesPassed = rulesPassed === PASSWORD_RULES.length;

  const limpiarError = (campo) => setErrors((p) => ({ ...p, [campo]: null }));

  const validar = () => {
    const e = {};
    if (!nombre.trim())       e.nombre   = 'El nombre es obligatorio';
    if (!email)               e.email    = 'El correo es obligatorio';
    if (!allRulesPassed)      e.password = 'La contraseña no cumple los requisitos';
    if (password !== confirm) e.confirm  = 'Las contraseñas no coinciden';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleRegister = async () => {
    if (!validar()) return;
    setLoading(true);
    try {
      console.log('Intentando registrar...');
      await registerUser({ nombre, email, password });
      console.log('Registro exitoso, navegando...');
      navigation.navigate('EmailSent', { email });
    } catch (e) {
      console.log('ERROR:', e.message); 
      setErrors({ general: e.message || 'Error al registrarse' });
    } finally {
      setLoading(false);
    }
  };

  return {
    nombre, setNombre, email, setEmail,
    password, setPassword, confirm, setConfirm,
    showPass, setShowPass: () => setShowPass(v => !v),
    showConf, setShowConf: () => setShowConf(v => !v),
    loading, errors, showStrength, setShowStrength,
    allRulesPassed, emailRef, passRef, confirmRef,
    limpiarError, handleRegister,
  };
}