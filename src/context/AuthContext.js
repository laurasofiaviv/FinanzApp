// src/context/AuthContext.js
import React, { createContext, useState, useContext, useEffect } from 'react';
import { getAuth, onAuthStateChanged, signOut } from 'firebase/auth';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  //const [usuario, setUsuario] = useState(undefined);
  const [usuario, setUsuario] = useState(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUsuario({
          uid:           user.uid,
          email:         user.email,
          emailVerified: user.emailVerified, 
        });
      } else {
        setUsuario(null);
      }
      setCargando(false);
    });
    return unsubscribe;
  }, []);

  const login = (datosUsuario) => setUsuario(datosUsuario);

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

export const useAuth = () => useContext(AuthContext);