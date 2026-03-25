import React, { useContext } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthContext } from '../context/AuthContext';

import WelcomeScreen       from '../screens/WelcomeScreen';
import AuthOptionsScreen   from '../screens/LoginScreen';       // botones Iniciar/Registro
import LoginFormScreen     from '../screens/LoginFormScreen';   // formulario real
import RegisterScreen      from '../screens/RegisterScreen';
import EmailSentScreen     from '../screens/EmailSentScreen';  
import ForgotPasswordScreen from '../screens/ForgotPasswordScreen';
import DashboardScreen        from '../screens/DashboardScreen';
import RegisterGastoScreen   from '../screens/RegisterGastoScreen';
import RegisterIngresoScreen from '../screens/RegisterIngresoScreen';
import ReportesScreen from '../screens/ReportesScreen';

//Inicialización del Stack
const Stack = createNativeStackNavigator();
//Este objeto contiene dos propiedades fundamentales: Stack.Navigator (el contenedor) y 
// Stack.Screen (cada una de las páginas).
export default function AppNavigator() {
  const { usuario } = useContext(AuthContext); //Extraemos el objeto 'usuario' del estado global.

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}> 
    //Por defecto, eliminamos la barra de título header de todas las pantallas
      {usuario ? (
        //Usuario Autenticado (usuario !== null)
        <>
          <Stack.Screen name="Dashboard"        component={DashboardScreen} />
          <Stack.Screen name="RegisterGasto"    component={RegisterGastoScreen} />
          <Stack.Screen name="RegisterIngreso"  component={RegisterIngresoScreen} />
          <Stack.Screen name="Reportes"         component={ReportesScreen} />
        </>
      ) : (
        <>
          <Stack.Screen name="Welcome"       component={WelcomeScreen} />
          <Stack.Screen name="AuthOptions"   component={AuthOptionsScreen} />
          <Stack.Screen name="LoginForm"     component={LoginFormScreen} />
          <Stack.Screen name="Register"      component={RegisterScreen}
          //título y un botón de "atrás" automático que nos da la librería
            options={{ headerShown: true, title: 'Crear cuenta' }} />
          <Stack.Screen name="EmailSent"     component={EmailSentScreen}
          //bloqueamos que el usuario pueda volver atrás manualmente, forzándolo a seguir el flujo de verificación.
            options={{ headerShown: true, title: 'Verifica tu correo', headerBackVisible: false }} />
          <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen}
            options={{ headerShown: true, title: 'Recuperar contraseña' }} />
        </>
      )}
    </Stack.Navigator>
  );
}