// navigation/AppNavigator.js
import React, { useContext } from 'react';
import { createStackNavigator } from '@react-navigation/stack';

import { AuthContext } from '../context/AuthContext';

import AuthStack from './AuthStack';
import MainTabs  from './MainTabs';

import ProductsScreen      from '../screens/ProductsScreen';
import ProductDetailScreen from '../screens/ProductDetailScreen';
import EditProductScreen   from '../screens/EditProductScreen';
import EmailSentScreen     from '../screens/EmailSentScreen';

const Stack = createStackNavigator();

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

// Stack mínimo para mostrar EmailSent mientras espera verificación
function VerificationStack({ email }) {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen
                name="EmailSent"
                component={EmailSentScreen}
                initialParams={{ email }}
            />
        </Stack.Navigator>
    );
}

export default function AppNavigator() {
    const { usuario } = useContext(AuthContext);

    // Sin sesión → pantallas de auth
    if (!usuario) return <AuthStack />;

    // Con sesión pero sin verificar correo → pantalla de verificación
    if (!usuario.emailVerified) {
        return <VerificationStack email={usuario.email} />;
    }

    // Sesión activa y verificada → app principal
    return <MainStack />;
}