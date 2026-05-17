// src/context/AuthContext.js
import React, { createContext, useState, useContext, useEffect } from 'react';
import { getAuth, onAuthStateChanged, signOut } from 'firebase/auth';


export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [usuario, setUsuario] = useState(null);
  const [cargando, setCargando] = useState(true); // evita flash de AuthStack

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        // Solo guardamos lo que necesitamos en el contexto
        setUsuario({ uid: user.uid, email: user.email });
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
    // onAuthStateChanged se dispara solo → setUsuario(null)
  } catch (e) {
    console.error('Error al cerrar sesión:', e.message);
    // Forzar limpieza local aunque falle Firebase
    setUsuario(null);
  }
  };

  // Mientras Firebase verifica la sesión, no renderizamos nada
  // para evitar que AppNavigator mande al stack de auth por un frame
  if (cargando) return null;

  return (
    <AuthContext.Provider value={{ usuario, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);