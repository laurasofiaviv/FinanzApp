import React, { useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, StatusBar, Dimensions } from 'react-native';
import { AuthContext } from '../context/AuthContext';
import { COLORS, SIZES } from '../constants/Colors';
import { Feather, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

// Componente para los botones de la cuadrícula
// Esto nos ayuda a mantener el código limpio y a reutilizar el diseño
const ActionButton = ({ iconName, label, color, onPress, IconComponent = MaterialCommunityIcons }) => (
  <TouchableOpacity style={[styles.gridButton, { backgroundColor: color }]} onPress={onPress}>
    <IconComponent name={iconName} size={30} color="white" />
    <Text style={styles.gridButtonText}>{label}</Text>
  </TouchableOpacity>
);

export default function DashboardScreen({ navigation }) {
  const { usuario } = useContext(AuthContext);

  // Usamos el nombre del usuario logueado, o uno por defecto si no lo tenemos
  const userName = usuario?.nombre || 'Juan Pérez';

  return (
    <ScrollView style={styles.container} bounces={false}>
      <StatusBar barStyle="light-content" />
      
      {/* 1. Cabecera Azul */}
      <View style={styles.header}>
        <View style={styles.welcomeRow}>
          <View>
            <Text style={styles.welcomeText}>Bienvenido de nuevo</Text>
            <Text style={styles.userNameText}>{userName}</Text>
          </View>
          <TouchableOpacity style={styles.profileCircle} onPress={() => console.log('Abrir perfil')}>
            <Feather name="user" size={26} color={COLORS.primary} />
          </TouchableOpacity>
        </View>
        <Text style={styles.questionText}>¿Qué quieres hacer hoy?</Text>
      </View>

      {/* 2. Contenido Principal */}
      <View style={styles.content}>
        {/* Cuadrícula de Botones */}
        <View style={styles.grid}>
          <ActionButton 
            iconName="trending-up" 
            label="Registrar Ingreso" 
            color="#2ECC71" // Verde para ingreso
            onPress={() => console.log('Ingreso')} 
          />
          <ActionButton 
            iconName="trending-down" 
            label="Registrar Gasto" 
            color="#0056FF" // Azul para gasto
            onPress={() => navigation.navigate('RegisterGasto')} 
          />
          <ActionButton 
            iconName="hand-holding-usd" 
            label="Generar Deuda" 
            color="#3498DB" // Azul más claro para deuda
            onPress={() => console.log('Deuda')} 
          />
          <ActionButton 
            iconName="chart-bar" 
            label="Ver Reportes" 
            color="#2ECC71" // Verde para reportes
            onPress={() => console.log('Reportes')} 
          />
        </View>

        {/* 3. Panel de Balance del Mes */}
        <View style={styles.balanceCard}>
          <Text style={styles.balanceCardTitle}>Balance del Mes</Text>
          <View style={styles.balanceRow}>
            <View>
              <Text style={styles.balanceLabelText}>Total</Text>
              <Text style={styles.balanceValueText}>$2,450,000</Text>
            </View>
            <View style={styles.statRow}>
              <View style={styles.statIconCircle}>
                <Feather name="trending-up" size={14} color="#2ECC71" />
              </View>
              <Text style={styles.statText}>+12%</Text>
              <Text style={styles.statSubText}>vs. mes anterior</Text>
            </View>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: {
    backgroundColor: COLORS.primary,
    paddingTop: 70, // Espacio para la barra de estado
    paddingHorizontal: SIZES.padding,
    paddingBottom: 40,
    borderBottomLeftRadius: SIZES.headerRadius,
    borderBottomRightRadius: SIZES.headerRadius,
  },
  welcomeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  welcomeText: { color: COLORS.white, fontSize: 14, opacity: 0.8 },
  userNameText: { color: COLORS.white, fontSize: SIZES.title, fontWeight: 'bold' },
  profileCircle: {
    width: 55,
    height: 55,
    borderRadius: 27.5,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  questionText: { color: COLORS.white, fontSize: 22, fontWeight: 'bold', marginTop: 10 },
  content: {
    backgroundColor: COLORS.background,
    marginTop: -20, // Efecto de superposición
    borderTopLeftRadius: SIZES.headerRadius,
    borderTopRightRadius: SIZES.headerRadius,
    paddingHorizontal: SIZES.padding,
    paddingTop: 30,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  gridButton: {
    width: '47%', // Ajuste para dejar espacio en el medio
    aspectRatio: 1, // Botones cuadrados
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  gridButtonText: { color: COLORS.white, fontSize: 16, fontWeight: 'bold', marginTop: 10, textAlign: 'center' },
  balanceCard: {
    backgroundColor: '#F5F7FA', // Usamos el color de fondo de tarjeta del diseño
    borderRadius: 20,
    padding: 20,
    marginBottom: 30,
  },
  balanceCardTitle: { fontSize: 16, color: COLORS.textSecondary, marginBottom: 15 },
  balanceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  balanceLabelText: { fontSize: 12, color: COLORS.textLight, textTransform: 'uppercase' },
  balanceValueText: { fontSize: 32, fontWeight: 'bold', color: COLORS.textPrimary },
  statRow: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-end',
  },
  statIconCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#E8F6EF', // Verde muy claro
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 6,
  },
  statText: { fontSize: 14, color: '#2ECC71', fontWeight: 'bold', marginRight: 6 },
  statSubText: { fontSize: 12, color: COLORS.textLight },
});