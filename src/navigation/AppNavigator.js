// navigation/AppNavigator.js
import React, { useContext } from 'react';
import { StyleSheet } from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';

import { AuthContext } from '../context/AuthContext';

// Sub-navigators
import AuthStack from './AuthStack';
import MainTabs  from './MainTabs';

// Pantallas "push" sobre los tabs (sin romper la barra inferior)
import ProductsScreen      from '../screens/ProductsScreen';
import ProductDetailScreen from '../screens/ProductDetailScreen';
import EditProductScreen   from '../screens/EditProductScreen';

const Stack = createStackNavigator();

// ── STACK PRINCIPAL que envuelve los tabs ─────────────────────────────────
function MainStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Tabs"          component={MainTabs} />
      <Stack.Screen name="Productos"     component={ProductsScreen}      options={{ presentation: 'card' }} />
      <Stack.Screen name="ProductDetail" component={ProductDetailScreen} />
      <Stack.Screen name="EditProduct"   component={EditProductScreen} />
    </Stack.Navigator>
  );
}

export default function AppNavigator() {
  const { usuario } = useContext(AuthContext);
  return usuario ? <MainStack /> : <AuthStack />;
}

const styles = StyleSheet.create({
  // Estilos del AddButton ahora viven en MainTabs.js
});