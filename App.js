// App.js
import React, { useContext } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// 1. Importamos el proveedor y el contexto
import { AuthProvider, AuthContext } from './src/context/AuthContext';

// 2. Importamos tus pantallas
// IMPORTAMOS LA NUEVA PANTALLA DE BIENVENIDA
import WelcomeScreen from './src/screens/WelcomeScreen';
import AuthOptionsScreen from './src/screens/LoginScreen'; // Renombrado por claridad
import RegisterScreen from './src/screens/RegisterScreen';
import DashboardScreen from './src/screens/DashboardScreen'; 

const Stack = createNativeStackNavigator();

function Rutas() {
  const { usuario } = useContext(AuthContext);

  return (
    // Ocultamos el header por defecto para todas las pantallas
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {usuario ? (
        // Flujo Autenticado
        <Stack.Screen name="Dashboard" component={DashboardScreen} />
      ) : (
        // Flujo No Autenticado
        <>
          {/* NUEVA: Esta será la primera pantalla en aparecer */}
          <Stack.Screen name="Welcome" component={WelcomeScreen} />
          
          {/* Esta es tu antigua LoginScreen, ahora renombrada como AuthOptions */}
          <Stack.Screen name="AuthOptions" component={AuthOptionsScreen} />
          
          {/* Mantenemos tu pantalla de Registro */}
          <Stack.Screen 
            name="Register" 
            component={RegisterScreen} 
            options={{ headerShown: true, title: 'Crear Cuenta' }} 
          />
        </>
      )}
    </Stack.Navigator>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <NavigationContainer>
        <Rutas />
      </NavigationContainer>
    </AuthProvider>
  );
}