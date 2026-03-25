import React, { useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, StatusBar, Platform } from 'react-native';
import { AuthContext } from '../context/AuthContext';
import { useFinanz } from '../context/FinanzContext'; // <-- IMPORTACIÓN AÑADIDA
import { COLORS, SIZES } from '../constants/Colors';
import { Feather, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

// ── Componentes Reutilizables ──

const OutlinedActionIcon = ({ iconName, label, color, onPress, IconComponent = MaterialCommunityIcons }) => (
  <TouchableOpacity style={styles.gridButtonContainer} onPress={onPress}>
    <View style={styles.gridButtonBody}>
      <View style={[styles.circularIconOutline, { borderColor: color }]}>
        <IconComponent name={iconName} size={28} color={color} />
      </View>
      <Text style={[styles.gridButtonText, {color: COLORS.textPrimary}]}>{label}</Text>
    </View>
  </TouchableOpacity>
);

const InfoPlaceholderCard = ({ title, iconName, message, buttonText, onPressButton, IconComponent = Feather }) => (
  <View style={styles.infoCard}>
    <Text style={styles.infoCardTitle}>{title}</Text>
    <View style={styles.infoCardContent}>
      <IconComponent name={iconName} size={32} color={COLORS.textLight} style={styles.infoCardIcon} />
      <Text style={styles.infoCardMessage}>{message}</Text>
      {buttonText && onPressButton && (
        <TouchableOpacity style={styles.infoCardButton} onPress={onPressButton}>
          <Feather name="plus" size={16} color={COLORS.primary} />
          <Text style={styles.infoCardButtonText}>{buttonText}</Text>
        </TouchableOpacity>
      )}
    </View>
  </View>
);

// ── Pantalla Principal ──

export default function DashboardScreen({ navigation }) {
  const { usuario } = useContext(AuthContext);
  
  // <-- CONEXIÓN AL CONTEXTO FINANCIERO -->
  const { balanceMes } = useFinanz(); 

  const userName = usuario?.nombre || 'Juan Pérez';

  // <-- CÁLCULO DINÁMICO DEL BALANCE -->
  // React re-renderizará la pantalla automáticamente cada vez que agregues un gasto o ingreso
  const balanceTotal = balanceMes(); 

  return (
    <ScrollView style={styles.container} bounces={false} showsVerticalScrollIndicator={false}>
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

      {/* 2. Contenido Principal con Superposición */}
      <View style={styles.content}>
        
        {/* SECCIÓN: Balance General */}
        <View style={styles.balanceDisplayCard}>
          <Text style={styles.balanceDisplayLabel}>BALANCE GENERAL</Text>
          <View style={styles.balanceValueRow}>
            <Text style={styles.balanceCurrency}>$ </Text>
            {/* El balance ahora es dinámico */}
            <Text style={styles.balanceValueText}>{balanceTotal.toLocaleString('es-CO')}</Text>
          </View>
          
          <View style={styles.trendLineContainer}>
            <View style={styles.trendLineMain} />
            <View style={styles.trendLineEndDot} />
          </View>
          
          {/* Mensaje dinámico dependiendo de si hay balance o no */}
          <Text style={styles.balanceHelperText}>
            {balanceTotal === 0 
              ? "Registra tu primer movimiento para ver tu balance" 
              : "Balance actualizado de este mes"}
          </Text>
        </View>

        {/* SECCIÓN: Gestión de Deudas */}
        <InfoPlaceholderCard 
          title="GESTIÓN DE DEUDAS"
          iconName="file-text"
          message="No tienes deudas registradas"
          buttonText="Añadir deuda"
          onPressButton={() => console.log('Navegar a Añadir Deuda')}
        />

        {/* Cuadrícula de Botones de Acción */}
        <View style={styles.grid}>
          <OutlinedActionIcon 
            iconName="trending-up"
            label="Reg. Ingreso" 
            color="#2ECC71"
            onPress={() => navigation.navigate('RegisterIngreso')} 
          />
          <OutlinedActionIcon 
            iconName="trending-down" 
            label="Reg. Gasto" 
            color="#0056FF"
            onPress={() => navigation.navigate('RegisterGasto')} 
          />
          <OutlinedActionIcon 
            iconName="plus-box-outline"
            label="Añadir Cuenta" 
            color="#3498DB"
            onPress={() => console.log('Añadir Cuenta')} 
          />
          <OutlinedActionIcon 
            iconName="chart-bar" 
            label="Reportes" 
            color="#2ECC71"
            onPress={() => navigation.navigate('Reportes')}
          />
        </View>

        {/* SECCIÓN: Recordatorios y Alertas */}
        <InfoPlaceholderCard 
          title="RECORDATORIOS Y ALERTAS AUTOMÁTICAS"
          iconName="bell" 
          message="No hay alertas activas"
        />

        {/* SECCIÓN: Resumen de Gastos del Mes */}
        <View style={[styles.infoCard, {marginBottom: 30}]}>
          <Text style={styles.infoCardTitle}>RESUMEN DE GASTOS DEL MES</Text>
          <View style={styles.gastosSummaryContent}>
            <View style={styles.donaChartPlaceholder} />
            <Text style={styles.gastosSummaryText}>Regístrate tus gastos para ver el resumen</Text>
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
    paddingTop: Platform.OS === 'web' ? 40 : 70, 
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
    marginTop: -20,
    borderTopLeftRadius: SIZES.headerRadius,
    borderTopRightRadius: SIZES.headerRadius,
    paddingHorizontal: SIZES.padding,
    paddingTop: 30,
  },

  balanceDisplayCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  balanceDisplayLabel: {
    fontSize: 13,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: 10,
    letterSpacing: 0.5,
  },
  balanceValueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 15,
  },
  balanceCurrency: {
    fontSize: 22,
    fontWeight: 'normal',
    color: COLORS.textPrimary,
  },
  balanceValueText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  trendLineContainer: {
    height: 30,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    marginBottom: 10,
  },
  trendLineMain: {
    height: 1,
    backgroundColor: '#DFE3E8',
    flex: 1,
    borderRadius: 0.5,
  },
  trendLineEndDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.textLight,
    marginLeft: 10,
  },
  balanceHelperText: {
    fontSize: 12,
    color: COLORS.textLight,
  },

  infoCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
  },
  infoCardTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: 15,
    letterSpacing: 0.5,
  },
  infoCardContent: {
    alignItems: 'center',
    gap: 15,
  },
  infoCardIcon: {
    opacity: 0.5,
  },
  infoCardMessage: {
    fontSize: 14,
    color: COLORS.textLight,
    textAlign: 'center',
    lineHeight: 18,
  },
  infoCardButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: SIZES.borderRadius,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#DFE3E8',
  },
  infoCardButtonText: {
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: '600',
  },

  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  gridButtonContainer: {
    width: '47%',
    aspectRatio: 1.1,
    marginBottom: 15,
  },
  gridButtonBody: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  circularIconOutline: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  gridButtonText: {
    fontSize: 13,
    fontWeight: 'bold',
    textAlign: 'center',
  },

  gastosSummaryContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  donaChartPlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 1.5,
    borderColor: '#DFE3E8',
    backgroundColor: '#fff',
  },
  gastosSummaryText: {
    flex: 1,
    fontSize: 14,
    color: COLORS.textLight,
    lineHeight: 18,
  },
});