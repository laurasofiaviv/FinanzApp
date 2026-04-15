// navigation/MainTabs.js
import React from 'react';
import { TouchableOpacity, StyleSheet, View } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import { COLORS } from '../constants/Colors';

import DashboardScreen  from '../screens/DashboardScreen';
import DebtScreen       from '../screens/DebtScreen';
import RegisterMovScreen from '../screens/RegisterMovScreen';
import ReportesScreen   from '../screens/ReportesScreen';
import ProfileScreen    from '../screens/ProfileScreen';

const Tab = createBottomTabNavigator();

function AddButton({ onPress }) {
  return (
    <View style={styles.addButtonWrapper}>
      <TouchableOpacity onPress={onPress} style={styles.addButton} activeOpacity={0.85}>
        <Ionicons name="add" size={32} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}

export default function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarShowLabel: true,
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: '#AAAAAA',
        tabBarStyle: {
          height: 64, paddingBottom: 8, paddingTop: 6,
          borderTopWidth: 0.5, borderTopColor: '#E0E0E0',
          backgroundColor: '#fff',
        },
        tabBarIcon: ({ focused, color }) => {
          const icons = {
            Inicio:    focused ? 'home'       : 'home-outline',
            Deudas:    focused ? 'wallet'     : 'wallet-outline',
            Registrar: 'add',
            Reportes:  focused ? 'bar-chart'  : 'bar-chart-outline',
            Perfil:    focused ? 'person'     : 'person-outline',
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
      <Tab.Screen name="Reportes" component={ReportesScreen} />
      <Tab.Screen name="Perfil"   component={ProfileScreen} />
    </Tab.Navigator>
  );
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