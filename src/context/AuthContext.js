import React, { createContext, useState } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [usuario, setUsuario] = useState(null);
  const [pendingVerification, setPending] = useState(null);

  const login = (datosUsuario) => setUsuario(datosUsuario);
  const logout = () => setUsuario(null);

  // Simula guardar usuario pendiente de verificación
  // Reemplaza esto con tu llamada a Firebase Auth o API real
  const simulateEmailVerification = (datos) => {
    setPending(datos);
    console.log(`[EMAIL SIMULADO] Enviando verificación a: ${datos.email}`);
    // Con Firebase sería: createUserWithEmailAndPassword() + sendEmailVerification()
  };

  return (
    <AuthContext.Provider value={{ usuario, login, logout, simulateEmailVerification }}>
      {children}
    </AuthContext.Provider>
  );
};