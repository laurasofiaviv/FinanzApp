import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { AuthProvider } from './src/context/AuthContext';
import { FinanzProvider } from './src/context/FinanzContext';
import AppNavigator from './src/navigation/AppNavigator';

export default function App() {
  return (
    <AuthProvider>
      <FinanzProvider>
        <NavigationContainer>
          <AppNavigator />
        </NavigationContainer>
      </FinanzProvider>
    </AuthProvider>
  );
}