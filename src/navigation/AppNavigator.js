//AppNtivgator.js
import React, { useContext } from 'react';
import { TouchableOpacity, StyleSheet, View } from 'react-native';
import { createStackNavigator }      from '@react-navigation/stack';
import { createBottomTabNavigator }  from '@react-navigation/bottom-tabs';
import { Ionicons }                  from '@expo/vector-icons';
 
import { AuthContext }               from '../context/AuthContext';
import { COLORS }                    from '../constants/Colors';
 
// Auth
import WelcomeScreen         from '../screens/WelcomeScreen';
import LoginScreen           from '../screens/LoginScreen';
import LoginFormScreen       from '../screens/LoginFormScreen';
import RegisterScreen        from '../screens/RegisterScreen';
import ForgotPasswordScreen  from '../screens/ForgotPasswordScreen';
import EmailSentScreen       from '../screens/EmailSentScreen';
 
// Main
import DashboardScreen    from '../screens/DashboardScreen';
import DebtScreen         from '../screens/DebtScreen';
import RegisterMovScreen  from '../screens/RegisterMovScreen';
import ReportesScreen     from '../screens/ReportesScreen';
import ProfileScreen      from '../screens/ProfileScreen';
import ProductosScreen    from '../screens/ProductosScreen'; // ← NUEVO
 
const Stack = createStackNavigator();
const Tab   = createBottomTabNavigator();
 
function AuthStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Welcome"        component={WelcomeScreen} />
      <Stack.Screen name="AuthOptions"    component={LoginScreen} />
      <Stack.Screen name="Login"          component={LoginScreen} />
      <Stack.Screen name="LoginForm"      component={LoginFormScreen} />
      <Stack.Screen name="Register"       component={RegisterScreen} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
      <Stack.Screen name="EmailSent"      component={EmailSentScreen} />
    </Stack.Navigator>
  );
}
 
function AddButton({ onPress }) {
  return (
    <View style={styles.addButtonWrapper}>
      <TouchableOpacity onPress={onPress} style={styles.addButton} activeOpacity={0.85}>
        <Ionicons name="add" size={32} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}
 
function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarShowLabel: true,
        tabBarActiveTintColor:   COLORS.primary,
        tabBarInactiveTintColor: '#AAAAAA',
        tabBarStyle: {
          height: 64, paddingBottom: 8, paddingTop: 6,
          borderTopWidth: 0.5, borderTopColor: '#E0E0E0',
          backgroundColor: '#fff',
        },
        tabBarIcon: ({ focused, color }) => {
          const icons = {
            Inicio:    focused ? 'home'      : 'home-outline',
            Deudas:    focused ? 'wallet'    : 'wallet-outline',
            Registrar: 'add',
            Reportes:  focused ? 'bar-chart' : 'bar-chart-outline',
            Perfil:    focused ? 'person'    : 'person-outline',
          };
          return <Ionicons name={icons[route.name]} size={22} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Inicio"    component={DashboardScreen} />
      <Tab.Screen name="Deudas"    component={DebtScreen} />
      <Tab.Screen
        name="Registrar"
        component={RegisterMovScreen}
        options={{
          tabBarLabel: 'Registrar',
          tabBarButton: (props) => <AddButton {...props} />,
        }}
      />
      <Tab.Screen name="Reportes"  component={ReportesScreen} />
      <Tab.Screen name="Perfil"    component={ProfileScreen} />
    </Tab.Navigator>
  );
}
 
// ── STACK PRINCIPAL que envuelve los tabs ─────────────────────────────────
// ProductosScreen se abre como pantalla "push" sobre cualquier tab,
// sin romper la barra inferior (simplemente la oculta al navegar).
function MainStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Tabs"      component={MainTabs} />
      <Stack.Screen
        name="Productos"
        component={ProductosScreen}
        options={{ presentation: 'card' }} // o 'modal' si prefieres slide-up
      />
    </Stack.Navigator>
  );
}
 
export default function AppNavigator() {
  const { usuario } = useContext(AuthContext);
  return usuario ? <MainStack /> : <AuthStack />;
}
 
const styles = StyleSheet.create({
  addButtonWrapper: { top: -20, justifyContent: 'center', alignItems: 'center' },
  addButton: {
    width: 60, height: 60, borderRadius: 30,
    backgroundColor: COLORS.primary,
    justifyContent: 'center', alignItems: 'center',
    shadowColor: COLORS.primary, shadowOpacity: 0.35,
    shadowRadius: 10, shadowOffset: { width: 0, height: 5 }, elevation: 8,
  },
});