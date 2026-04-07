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
  const pagadas = deudas.filter((d) => d.pagada);
  
  // Cálculo del total basado en el monto pendiente
  const totalPendiente = pendientes.reduce((acc, d) => acc + parseFloat(d.monto || 0), 0);

  // Función para determinar la urgencia de la fecha
  const obtenerColorUrgencia = (fechaVencimiento) => {
    if (!fechaVencimiento) return COLORS.textLight;
    
    const [d, m, y] = fechaVencimiento.split('/');
    const fechaVence = new Date(y, m - 1, d);
    const hoy = new Date();
    const diffTime = fechaVence - hoy;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return COLORS.danger; // Vencida
    if (diffDays <= 3) return '#E67E22'; // Vence pronto (Naranja)
    return COLORS.textLight;
  };

  return (
    <ScrollView style={styles.container} bounces={false} showsVerticalScrollIndicator={false}>
      <StatusBar barStyle="light-content" />

      <View style={styles.header}>
        <Text style={styles.headerTitle}>Mis Deudas</Text>
        <Text style={styles.headerSub}>
          {pendientes.length === 0
            ? 'No tienes deudas pendientes'
            : `${pendientes.length} ${pendientes.length > 1 ? 'deudas pendientes' : 'deuda pendiente'}`}
        </Text>
      </View>

      <View style={styles.content}>
        {pendientes.length > 0 && (
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>TOTAL PENDIENTE</Text>
            <Text style={styles.summaryAmount}>
              ${totalPendiente.toLocaleString('es-CO')}
            </Text>
          </View>
        )}

        {pendientes.length === 0 ? (
          <View style={styles.emptyCard}>
            <Feather name="check-circle" size={40} color={COLORS.secondary} />
            <Text style={styles.emptyTitle}>¡Todo al día!</Text>
            <Text style={styles.emptyText}>No tienes deudas pendientes registradas.</Text>
          </View>
        ) : (
          <>
            <Text style={styles.sectionTitle}>PENDIENTES</Text>
            {pendientes.map((deuda) => {
              const colorVence = obtenerColorUrgencia(deuda.fechaVencimiento);
              return (
                <View key={deuda.id} style={styles.debtCard}>
                  <View style={styles.debtLeft}>
                    <Text style={styles.debtTipo}>{deuda.tipo || 'Deuda'}</Text>
                    {deuda.descripcion ? (
                      <Text style={styles.debtDesc} numberOfLines={1}>{deuda.descripcion}</Text>
                    ) : null}
                    
                    {/* Visualización de cuotas si existen */}
                    {deuda.cuotas && (
                      <View style={styles.cuotaBadge}>
                        <Text style={styles.cuotaText}>Plazo: {deuda.cuotas} meses</Text>
                      </View>
                    )}

                    <View style={styles.fechaRow}>
                      <Feather name="calendar" size={10} color={colorVence} />
                      <Text style={[styles.debtFecha, { color: colorVence }]}>
                        Vence: {deuda.fechaVencimiento || deuda.fecha}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.debtRight}>
                    <Text style={styles.debtMonto}>
                      ${parseFloat(deuda.monto).toLocaleString('es-CO')}
                    </Text>
                    <TouchableOpacity
                      style={styles.paidBtn}
                      onPress={() => marcarDeudaPagada(deuda.id)}
                    >
                      <Feather name="dollar-sign" size={12} color={COLORS.secondary} />
                      <Text style={styles.paidBtnText}>Pagar</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })}
          </>
        )}

        {/* Sección de Pagadas (Simplificada) */}
        {pagadas.length > 0 && (
          <>
            <Text style={[styles.sectionTitle, { marginTop: 10 }]}>HISTORIAL DE PAGOS</Text>
            {pagadas.map((deuda) => (
              <View key={deuda.id} style={[styles.debtCard, styles.debtCardPagada]}>
                <View style={styles.debtLeft}>
                  <Text style={[styles.debtTipo, { color: COLORS.textLight }]}>{deuda.tipo}</Text>
                  <Text style={styles.debtFecha}>Pagado el: {deuda.fecha}</Text>
                </View>
                <View style={styles.debtRight}>
                  <Text style={[styles.debtMonto, { color: COLORS.textLight, textDecorationLine: 'line-through' }]}>
                    ${parseFloat(deuda.monto).toLocaleString('es-CO')}
                  </Text>
                  <View style={styles.paidBadge}>
                    <Feather name="check" size={10} color={COLORS.secondary} />
                    <Text style={styles.paidBadgeText}>Listo</Text>
                  </View>
                </View>
              </View>
            ))}
          </>
        )}
        <View style={{ height: 80 }} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: {
    backgroundColor: COLORS.primaryDark,
    paddingTop: Platform.OS === 'ios' ? 70 : 50,
    paddingHorizontal: SIZES.padding,
    paddingBottom: 40,
    borderBottomLeftRadius: SIZES.headerRadius,
    borderBottomRightRadius: SIZES.headerRadius,
  },
  headerTitle: { color: '#fff', fontSize: 26, fontWeight: 'bold' },
  headerSub: { color: 'rgba(255,255,255,0.7)', fontSize: 14, marginTop: 4 },
  content: {
    marginTop: -25,
    backgroundColor: COLORS.background,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingHorizontal: SIZES.padding,
    paddingTop: 30,
  },
  summaryCard: {
    backgroundColor: COLORS.primary,
    borderRadius: 20, padding: 25, marginBottom: 25,
    alignItems: 'center', elevation: 4,
  },
  summaryLabel: { color: 'rgba(255,255,255,0.8)', fontSize: 11, fontWeight: '700', letterSpacing: 1 },
  summaryAmount: { color: '#fff', fontSize: 34, fontWeight: 'bold', marginTop: 5 },
  sectionTitle: { fontSize: 13, fontWeight: 'bold', color: COLORS.textSecondary, marginBottom: 12 },
  debtCard: {
    flexDirection: 'row', backgroundColor: '#fff', borderRadius: 18,
    padding: 16, marginBottom: 12, borderWidth: 1, borderColor: '#F0F0F0',
    alignItems: 'center',
  },
  debtCardPagada: { backgroundColor: '#F9F9F9', borderColor: '#EEE' },
  debtLeft: { flex: 1 },
  debtTipo: { fontSize: 15, fontWeight: 'bold', color: COLORS.textPrimary },
  debtDesc: { fontSize: 13, color: COLORS.textSecondary, marginVertical: 2 },
  cuotaBadge: {
    backgroundColor: '#F0F4FF', alignSelf: 'flex-start',
    paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6, marginVertical: 4
  },
  cuotaText: { fontSize: 10, color: COLORS.primary, fontWeight: '600' },
  fechaRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 4 },
  debtFecha: { fontSize: 12, fontWeight: '500' },
  debtRight: { alignItems: 'flex-end' },
  debtMonto: { fontSize: 17, fontWeight: 'bold', color: COLORS.danger, marginBottom: 8 },
  paidBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: '#E8F5E9', paddingVertical: 6, paddingHorizontal: 12,
    borderRadius: 10, borderWidth: 1, borderColor: COLORS.secondary,
  },
  paidBtnText: { fontSize: 12, color: COLORS.secondary, fontWeight: 'bold' },
  paidBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, opacity: 0.6 },
  paidBadgeText: { fontSize: 12, color: COLORS.secondary, fontWeight: '600' },
  emptyCard: { alignItems: 'center', padding: 40 },
  emptyTitle: { fontSize: 18, fontWeight: 'bold', color: COLORS.textPrimary, marginTop: 10 },
  emptyText: { fontSize: 14, color: COLORS.textLight, textAlign: 'center', marginTop: 5 },
});