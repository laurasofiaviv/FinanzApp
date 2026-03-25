import React, { useContext } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthContext } from '../context/AuthContext';

import WelcomeScreen       from '../screens/WelcomeScreen';
import AuthOptionsScreen   from '../screens/LoginScreen';       // botones Iniciar/Registro
import LoginFormScreen     from '../screens/LoginFormScreen';   // formulario real ← NUEVO
import RegisterScreen      from '../screens/RegisterScreen';
import EmailSentScreen     from '../screens/EmailSentScreen';   // ← NUEVO
import ForgotPasswordScreen from '../screens/ForgotPasswordScreen'; // ← NUEVO
import DashboardScreen        from '../screens/DashboardScreen';
import RegisterGastoScreen   from '../screens/RegisterGastoScreen';
import RegisterIngresoScreen from '../screens/RegisterIngresoScreen';
import ReportesScreen from '../screens/ReportesScreen';


const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  const { usuario } = useContext(AuthContext);

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {usuario ? (
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
            options={{ headerShown: true, title: 'Crear cuenta' }} />
          <Stack.Screen name="EmailSent"     component={EmailSentScreen}
            options={{ headerShown: true, title: 'Verifica tu correo', headerBackVisible: false }} />
          <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen}
            options={{ headerShown: true, title: 'Recuperar contraseña' }} />
        </>
      )}
    </Stack.Navigator>
  );
}