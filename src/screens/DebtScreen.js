import React from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, StatusBar, Platform,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { COLORS, SIZES } from '../constants/Colors';
import { useFinanz } from '../context/FinanzContext';

export default function DebtScreen() {
  const { deudas, marcarDeudaPagada } = useFinanz();

  const pendientes = deudas.filter((d) => !d.pagada);
  const pagadas    = deudas.filter((d) => d.pagada);
  const totalPendiente = pendientes.reduce((acc, d) => acc + parseFloat(d.monto || 0), 0);

  return (
    <ScrollView style={styles.container} bounces={false} showsVerticalScrollIndicator={false}>
      <StatusBar barStyle="light-content" />

      {/* ── Cabecera ── */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Mis Deudas</Text>
        <Text style={styles.headerSub}>
          {pendientes.length === 0
            ? 'No tienes deudas pendientes'
            : `${pendientes.length} deuda${pendientes.length > 1 ? 's' : ''} pendiente${pendientes.length > 1 ? 's' : ''}`}
        </Text>
      </View>

      <View style={styles.content}>

        {/* ── Resumen total ── */}
        {pendientes.length > 0 && (
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>TOTAL PENDIENTE</Text>
            <Text style={styles.summaryAmount}>
              ${totalPendiente.toLocaleString('es-CO')}
            </Text>
          </View>
        )}

        {/* ── Lista pendientes ── */}
        {pendientes.length === 0 ? (
          <View style={styles.emptyCard}>
            <Feather name="check-circle" size={40} color={COLORS.secondary} />
            <Text style={styles.emptyTitle}>¡Todo al día!</Text>
            <Text style={styles.emptyText}>No tienes deudas pendientes registradas.</Text>
          </View>
        ) : (
          <>
            <Text style={styles.sectionTitle}>PENDIENTES</Text>
            {pendientes.map((deuda) => (
              <View key={deuda.id} style={styles.debtCard}>
                <View style={styles.debtLeft}>
                  <Text style={styles.debtTipo}>{deuda.tipo || 'Deuda'}</Text>
                  {deuda.descripcion ? (
                    <Text style={styles.debtDesc} numberOfLines={1}>{deuda.descripcion}</Text>
                  ) : null}
                  <Text style={styles.debtFecha}>{deuda.fecha}</Text>
                </View>
                <View style={styles.debtRight}>
                  <Text style={styles.debtMonto}>
                    ${parseFloat(deuda.monto).toLocaleString('es-CO')}
                  </Text>
                  <TouchableOpacity
                    style={styles.paidBtn}
                    onPress={() => marcarDeudaPagada(deuda.id)}
                  >
                    <Feather name="check" size={13} color={COLORS.secondary} />
                    <Text style={styles.paidBtnText}>Pagar</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </>
        )}

        {/* ── Lista pagadas ── */}
        {pagadas.length > 0 && (
          <>
            <Text style={[styles.sectionTitle, { marginTop: 10 }]}>PAGADAS</Text>
            {pagadas.map((deuda) => (
              <View key={deuda.id} style={[styles.debtCard, styles.debtCardPagada]}>
                <View style={styles.debtLeft}>
                  <Text style={[styles.debtTipo, { color: COLORS.textLight }]}>{deuda.tipo || 'Deuda'}</Text>
                  {deuda.descripcion ? (
                    <Text style={[styles.debtDesc, { color: COLORS.textLight }]} numberOfLines={1}>
                      {deuda.descripcion}
                    </Text>
                  ) : null}
                  <Text style={styles.debtFecha}>{deuda.fecha}</Text>
                </View>
                <View style={styles.debtRight}>
                  <Text style={[styles.debtMonto, { color: COLORS.textLight }]}>
                    ${parseFloat(deuda.monto).toLocaleString('es-CO')}
                  </Text>
                  <View style={styles.paidBadge}>
                    <Feather name="check-circle" size={12} color={COLORS.secondary} />
                    <Text style={styles.paidBadgeText}>Pagada</Text>
                  </View>
                </View>
              </View>
            ))}
          </>
        )}

        <View style={{ height: 30 }} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: {
    backgroundColor: COLORS.primaryDark,
    paddingTop: Platform.OS === 'web' ? 40 : 70,
    paddingHorizontal: SIZES.padding,
    paddingBottom: 40,
    borderBottomLeftRadius: SIZES.headerRadius,
    borderBottomRightRadius: SIZES.headerRadius,
  },
  headerTitle: { color: '#fff', fontSize: SIZES.title, fontWeight: 'bold', marginBottom: 4 },
  headerSub:   { color: 'rgba(255,255,255,0.75)', fontSize: 14 },
  content: {
    marginTop: -20,
    borderTopLeftRadius: SIZES.headerRadius,
    borderTopRightRadius: SIZES.headerRadius,
    backgroundColor: COLORS.background,
    paddingHorizontal: SIZES.padding,
    paddingTop: 28,
  },
  summaryCard: {
    backgroundColor: COLORS.primaryDark,
    borderRadius: 16, padding: 20, marginBottom: 22,
    alignItems: 'center',
  },
  summaryLabel:  { color: 'rgba(255,255,255,0.7)', fontSize: 12, letterSpacing: 0.5, marginBottom: 6 },
  summaryAmount: { color: '#fff', fontSize: 32, fontWeight: 'bold' },
  emptyCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 20, padding: 32,
    alignItems: 'center', gap: 12, marginTop: 10,
  },
  emptyTitle: { fontSize: 18, fontWeight: 'bold', color: COLORS.textPrimary },
  emptyText:  { fontSize: 14, color: COLORS.textLight, textAlign: 'center' },
  sectionTitle: {
    fontSize: 12, fontWeight: 'bold', color: COLORS.textSecondary,
    letterSpacing: 0.5, marginBottom: 10,
  },
  debtCard: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 14, padding: 16, marginBottom: 10,
    borderWidth: 1, borderColor: '#F0F0F0',
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04, shadowRadius: 4, elevation: 2,
  },
  debtCardPagada: { backgroundColor: COLORS.surface, borderColor: '#E8E8E8' },
  debtLeft:  { flex: 1, marginRight: 12 },
  debtTipo:  { fontSize: 14, fontWeight: '600', color: COLORS.textPrimary, marginBottom: 2 },
  debtDesc:  { fontSize: 12, color: COLORS.textSecondary, marginBottom: 4 },
  debtFecha: { fontSize: 11, color: COLORS.textLight },
  debtRight: { alignItems: 'flex-end', gap: 8 },
  debtMonto: { fontSize: 16, fontWeight: 'bold', color: COLORS.danger },
  paidBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingVertical: 5, paddingHorizontal: 10,
    borderRadius: 8, borderWidth: 1, borderColor: COLORS.secondary,
  },
  paidBtnText: { fontSize: 11, color: COLORS.secondary, fontWeight: '600' },
  paidBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingVertical: 4, paddingHorizontal: 8,
    borderRadius: 8, backgroundColor: '#F0FBF4',
  },
  paidBadgeText: { fontSize: 11, color: COLORS.secondary, fontWeight: '600' },
});