//DashboardScreen.js
import React, { useContext } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  ScrollView, StatusBar, Platform,
} from 'react-native';
import { AuthContext } from '../context/AuthContext';
import { useFinanz }   from '../context/FinanzContext';
import { COLORS, SIZES } from '../constants/Colors';
import { Feather }     from '@expo/vector-icons';

const CATEGORIA_ICON = {
  'Alimentación':   'shopping-cart',
  'Transporte':     'map-pin',
  'Vivienda':       'home',
  'Salud':          'heart',
  'Educación':      'book',
  'Entretenimiento':'music',
  'Ropa':           'tag',
  'Tecnología':     'smartphone',
  'Mascotas':       'feather',
  'Deudas':         'credit-card',
  'Regalos':        'gift',
  'Servicios':      'tool',
  'Otros':          'more-horizontal',
};

export default function DashboardScreen({ navigation }) {
  const { usuario } = useContext(AuthContext);
  const { balanceMes, totalIngresosMes, totalGastosMes, movimientosRecientes } = useFinanz();

  const userName = usuario?.nombre || 'Juan Pérez';
  
  // ✅ CORRECCIÓN 1: Definir la variable initials antes de usarla
  const initials = userName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .substring(0, 2);

  const balance    = balanceMes();
  const ingresos   = totalIngresosMes();
  const gastos     = totalGastosMes();
  const recientes  = movimientosRecientes();

  const fmt = (n) => n.toLocaleString('es-CO');

  return (
    <ScrollView style={styles.container} bounces={false} showsVerticalScrollIndicator={false}>
      <StatusBar barStyle="light-content" />

      {/* ── Cabecera ── */}
      <View style={styles.header}>
        <View style={styles.welcomeRow}>
          <View>
            <Text style={styles.welcomeText}>Bienvenido de nuevo</Text>
            <Text style={styles.userNameText}>{userName}</Text>
          </View>

          <TouchableOpacity 
            style={styles.profileCircle}
            activeOpacity={0.8}
            onPress={() => navigation.navigate('Perfil')}
          >
            <Text style={styles.initialsText}>{initials}</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.content}>
        {/* ── Balance ── */}
        <View style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>BALANCE GENERAL</Text>
          <View style={styles.balanceValueRow}>
            <Text style={styles.balanceCurrency}>$ </Text>
            <Text style={[styles.balanceValueText, { color: balance >= 0 ? COLORS.textPrimary : COLORS.danger }]}>
              {fmt(balance)}
            </Text>
          </View>
          <View style={styles.balanceSubRow}>
            <View style={styles.balanceSubItem}>
              <Feather name="arrow-up-circle" size={14} color={COLORS.secondary} />
              <Text style={styles.balanceSubLabel}>  Ingresos</Text>
              <Text style={[styles.balanceSubValue, { color: COLORS.secondary }]}>
                {'  $' + fmt(ingresos)}
              </Text>
            </View>
            <View style={styles.balanceSubItem}>
              <Feather name="arrow-down-circle" size={14} color={COLORS.danger} />
              <Text style={styles.balanceSubLabel}>  Gastos</Text>
              <Text style={[styles.balanceSubValue, { color: COLORS.danger }]}>
                {'  $' + fmt(gastos)}
              </Text>
            </View>
          </View>
          <Text style={styles.balanceHelper}>
            {balance === 0
              ? 'Registra tu primer movimiento para ver tu balance'
              : 'Balance actualizado de este mes'}
          </Text>
        </View>

        {/* ── Recordatorios ── */}
        <View style={styles.infoCard}>
          <Text style={styles.sectionTitle}>RECORDATORIOS Y ALERTAS</Text>
          <View style={styles.emptyRow}>
            <Feather name="bell" size={28} color={COLORS.textLight} />
            <Text style={styles.emptyText}>No hay alertas activas</Text>
          </View>
        </View>

        {/* ── Movimientos Recientes ── */}
        <View style={[styles.infoCard, { marginBottom: 30 }]}>
          <Text style={styles.sectionTitle}>MOVIMIENTOS RECIENTES</Text>
          {recientes.length === 0 ? (
            <View style={styles.emptyRow}>
              <Feather name="inbox" size={28} color={COLORS.textLight} />
              <Text style={styles.emptyText}>Aún no hay movimientos registrados</Text>
            </View>
          ) : (
            recientes.map((mov) => {
              const esIngreso  = mov.tipo === 'ingreso';
              const iconName   = esIngreso
                ? 'arrow-up-circle'
                : CATEGORIA_ICON[mov.categoria?.replace(/^[\S]+\s/, '')] || 'arrow-down-circle';
              const iconColor  = esIngreso ? COLORS.secondary : COLORS.primary;
              const etiqueta   = esIngreso ? (mov.motivo || 'Ingreso') : (mov.categoria || 'Gasto');
              const signo      = esIngreso ? '+' : '-';
              const montoColor = esIngreso ? COLORS.secondary : COLORS.danger;

              return (
                <View key={mov.id} style={styles.movRow}>
                  <View style={[styles.movIconBox, { borderColor: iconColor }]}>
                    <Feather name={iconName} size={18} color={iconColor} />
                  </View>
                  <View style={styles.movInfo}>
                    <Text style={styles.movNombre} numberOfLines={1}>{etiqueta}</Text>
                    <Text style={styles.movFecha}>{mov.fecha}</Text>
                  </View>
                  <Text style={[styles.movMonto, { color: montoColor }]}>
                    {signo}${mov.montoDisplay?.replace('$', '') || mov.monto?.toLocaleString('es-CO')}
                  </Text>
                </View>
              );
            })
          )}
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
  },
  welcomeText:  { color: COLORS.white, fontSize: 14, opacity: 0.8 },
  userNameText: { color: COLORS.white, fontSize: SIZES.title, fontWeight: 'bold' },
  profileCircle: {
    width: 50, height: 50, borderRadius: 25,
    backgroundColor: COLORS.secondary, // Cambiado a verde como tu diseño
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  // ✅ CORRECCIÓN 2: Agregar estilo para el texto de las iniciales
  initialsText: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: 'bold',
  },
  content: {
    backgroundColor: COLORS.background,
    marginTop: -20,
    borderTopLeftRadius: SIZES.headerRadius,
    borderTopRightRadius: SIZES.headerRadius,
    paddingHorizontal: SIZES.padding,
    paddingTop: 30,
  },
  balanceCard: {
    backgroundColor: '#fff',
    borderRadius: 20, padding: 20, marginBottom: 20,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05, shadowRadius: 8, elevation: 3,
  },
  balanceLabel: {
    fontSize: 13, fontWeight: 'bold', color: COLORS.textPrimary,
    marginBottom: 10, letterSpacing: 0.5,
  },
  balanceValueRow: { flexDirection: 'row', alignItems: 'baseline', marginBottom: 14 },
  balanceCurrency:  { fontSize: 22, color: COLORS.textPrimary },
  balanceValueText: { fontSize: 36, fontWeight: 'bold' },
  balanceSubRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    marginBottom: 12,
  },
  balanceSubItem: { flexDirection: 'row', alignItems: 'center' },
  balanceSubLabel: { fontSize: 12, color: COLORS.textSecondary },
  balanceSubValue: { fontSize: 12, fontWeight: '600' },
  balanceHelper: { fontSize: 12, color: COLORS.textLight },
  infoCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 20, padding: 20, marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 13, fontWeight: 'bold', color: COLORS.textPrimary,
    marginBottom: 14, letterSpacing: 0.5,
  },
  emptyRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 8 },
  emptyText: { fontSize: 14, color: COLORS.textLight },
  movRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1, borderBottomColor: '#F0F0F0',
  },
  movIconBox: {
    width: 38, height: 38, borderRadius: 10,
    borderWidth: 1.5, justifyContent: 'center',
    alignItems: 'center', marginRight: 12,
  },
  movInfo:    { flex: 1 },
  movNombre: { fontSize: 14, fontWeight: '600', color: COLORS.textPrimary },
  movFecha:  { fontSize: 12, color: COLORS.textLight, marginTop: 2 },
  movMonto:  { fontSize: 14, fontWeight: 'bold' },
});