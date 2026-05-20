// src/context/AuthContext.js
import React, { createContext, useState, useContext, useEffect } from 'react';
import { getAuth, onAuthStateChanged, signOut } from 'firebase/auth';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  // Estado del usuario autenticado (null = sin sesión)
  const [usuario, setUsuario] = useState(null);
  // true mientras Firebase resuelve si hay sesión activa al arrancar
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const auth = getAuth();
    // Suscripción reactiva a cambios de sesión Firebase
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        // Solo guarda los campos necesarios, no el objeto completo de Firebase
        setUsuario({
          uid: user.uid,
          email: user.email,
          emailVerified: user.emailVerified,
        });
      } else {
        setUsuario(null);
      }
      setCargando(false);
    });
    // Limpia la suscripción al desmontar
    return unsubscribe;
  }, []);
  // Guarda manualmente los datos del usuario (usado tras login en authService)
  const login = (datosUsuario) => setUsuario(datosUsuario);

  // Cierra sesión en Firebase y limpia el estado local
  const logout = async () => {
    try {
      await signOut(getAuth());
    } catch (e) {
      console.error('Error al cerrar sesión:', e.message);
      setUsuario(null);
    }
  };


  return (
    <AuthContext.Provider value={{ usuario, login, logout, cargando }}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook de acceso directo al contexto de autenticación
export const useAuth = () => useContext(AuthContext);