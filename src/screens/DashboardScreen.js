import React, { useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { AuthContext } from '../context/AuthContext';
import { COLORS, SIZES } from '../constants/Colors';

export default function DashboardScreen() {
  const { usuario, logout } = useContext(AuthContext);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>¡Bienvenido, {usuario?.nombre}!</Text>
      </View>
      
      <View style={{ padding: 20 }}>
        <Text>Sesión iniciada con: {usuario?.email}</Text>
        <TouchableOpacity 
          style={{ backgroundColor: COLORS.danger, padding: 15, marginTop: 20, borderRadius: 10 }} 
          onPress={logout}
        >
          <Text style={{ color: 'white', textAlign: 'center' }}>Cerrar Sesión</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    backgroundColor: COLORS.primary,
    padding: SIZES.padding,
    paddingTop: 50,
    borderBottomRightRadius: SIZES.headerRadius,
  },
  title: {
    color: COLORS.white,
    fontSize: SIZES.title,
    fontWeight: 'bold',
  }
});