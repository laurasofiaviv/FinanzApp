import React, { useContext } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// 1. Importamos el proveedor y el contexto
import { AuthProvider, AuthContext } from './src/context/AuthContext';

// 2. Importamos tus pantallas (Verifica que DashboardScreen.js exista en esa carpeta)
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
// Nota: Asegúrate de haber creado el archivo DashboardScreen.js en src/screens
import DashboardScreen from './src/screens/DashboardScreen'; 

const Stack = createNativeStackNavigator();

function Rutas() {
  const { usuario } = useContext(AuthContext);

  return (
    <Stack.Navigator>
      {usuario ? (
        // Flujo Autenticado
        <Stack.Screen 
          name="Dashboard" 
          component={DashboardScreen} 
          options={{ headerShown: true, title: 'Mi Dashboard' }} 
        />
      ) : (
        // Flujo No Autenticado
        <>
          <Stack.Screen 
            name="Login" 
            component={LoginScreen} 
            options={{ headerShown: false }} 
          />
          <Stack.Screen 
            name="Register" 
            component={RegisterScreen} 
            options={{ title: 'Crear Cuenta' }} 
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