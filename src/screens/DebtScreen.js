import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { COLORS, SIZES } from '../constants/Colors';
import { useFinanz } from '../context/FinanzContext';

export default function DebtScreen() {
  const { deudas, pagarCuota } = useFinanz();

  const hoy = new Date();

  const deudasProcesadas = deudas.map((d) => {
    const montoPagado = d.montoPagado || 0;
    const cuotas = parseInt(d.cuotas) || 0;
    const cuotasPagadas = d.cuotasPagadas || 0;

    const fechaBase = d.fechaVencimiento || d.fecha;

    if (!fechaBase) {
      return {
        ...d,
        estado: 'pendiente',
        diffDays: 999,
        restante: d.monto,
        progreso: 0,
      };
    }

    const [dia, mes, año] = fechaBase.split('/');
    const fechaVence = new Date(año, mes - 1, dia);

    const diffDays = Math.ceil(
      (fechaVence - hoy) / (1000 * 60 * 60 * 24)
    );

    let estado = 'pendiente';
    if (montoPagado >= d.monto) estado = 'pagada';
    else if (diffDays < 0) estado = 'vencida';

    return {
      ...d,
      estado,
      diffDays,
      restante: d.monto - montoPagado,
      progreso:
        cuotas > 0
          ? cuotasPagadas / cuotas
          : montoPagado / d.monto,
    };
  });

  const pendientes = deudasProcesadas
    .filter((d) => d.estado !== 'pagada')
    .sort((a, b) => a.diffDays - b.diffDays);

  const pagadas = deudasProcesadas.filter(
    (d) => d.estado === 'pagada'
  );

  const totalPendiente = pendientes.reduce(
    (acc, d) => acc + d.restante,
    0
  );

  const getUrgencyColor = (diffDays) => {
    if (diffDays < 0) return COLORS.danger;
    if (diffDays <= 3) return '#E67E22';
    return COLORS.textLight;
  };

  const getUrgencyText = (diffDays) => {
    if (diffDays < 0) return 'Vencida';
    if (diffDays === 0) return 'Hoy';
    if (diffDays <= 3) return `En ${diffDays} días`;
    return 'A tiempo';
  };

  return (
    <ScrollView style={styles.container}>
      <StatusBar barStyle="light-content" />

      <View style={styles.header}>
        <Text style={styles.headerTitle}>Mis Deudas</Text>
        <Text style={styles.headerSub}>
          {pendientes.length} pendientes
        </Text>
      </View>

      <View style={styles.content}>
        {pendientes.length > 0 && (
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>
              TOTAL PENDIENTE
            </Text>
            <Text style={styles.summaryAmount}>
              ${totalPendiente.toLocaleString('es-CO')}
            </Text>
          </View>
        )}

        {pendientes.length === 0 ? (
          <View style={styles.emptyCard}>
            <Feather
              name="check-circle"
              size={40}
              color={COLORS.secondary}
            />
            <Text style={styles.emptyTitle}>
              ¡Todo al día!
            </Text>
          </View>
        ) : (
          <>
            <Text style={styles.sectionTitle}>
              PENDIENTES
            </Text>

            {pendientes.map((deuda) => {
              const color = getUrgencyColor(
                deuda.diffDays
              );

              return (
                <View
                  key={deuda.id}
                  style={styles.debtCard}
                >
                  <View style={styles.debtLeft}>
                    <Text style={styles.debtTipo}>
                      {deuda.tipo}
                    </Text>

                    {deuda.descripcion && (
                      <Text style={styles.debtDesc}>
                        {deuda.descripcion}
                      </Text>
                    )}

                    <View style={styles.progressBar}>
                      <View
                        style={[
                          styles.progressFill,
                          {
                            width: `${
                              deuda.progreso * 100
                            }%`,
                          },
                        ]}
                      />
                    </View>

                    <Text style={styles.progressText}>
                      {deuda.cuotas
                        ? `${deuda.cuotasPagadas || 0}/${
                            deuda.cuotas
                          } cuotas`
                        : `${Math.round(
                            deuda.progreso * 100
                          )}% pagado`}
                    </Text>

                    <Text
                      style={[
                        styles.debtFecha,
                        { color },
                      ]}
                    >
                      {getUrgencyText(
                        deuda.diffDays
                      )}
                    </Text>
                  </View>

                  <View style={styles.debtRight}>
                    <Text style={styles.debtMonto}>
                      $
                      {deuda.restante.toLocaleString(
                        'es-CO'
                      )}
                    </Text>

                    <TouchableOpacity
                      style={styles.paidBtn}
                      onPress={() =>
                        pagarCuota(deuda.id)
                      }
                    >
                      <Text
                        style={styles.paidBtnText}
                      >
                        Abonar
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })}
          </>
        )}

        {pagadas.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>
              PAGADAS
            </Text>
            {pagadas.map((d) => (
              <View
                key={d.id}
                style={[
                  styles.debtCard,
                  { opacity: 0.6 },
                ]}
              >
                <Text>{d.tipo}</Text>
                <Text>
                  $
                  {d.monto.toLocaleString('es-CO')}
                </Text>
              </View>
            ))}
          </>
        )}
      </View>
    </ScrollView>
  );
}

/* 🔥 ESTILOS (ESTO ERA LO QUE TE FALTABA) */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    padding: 20,
  },
  headerTitle: {
    fontSize: 24,
    color: COLORS.text,
    fontWeight: 'bold',
  },
  headerSub: {
    color: COLORS.textLight,
  },
  content: {
    padding: 20,
  },
  summaryCard: {
    backgroundColor: COLORS.card,
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
  },
  summaryLabel: {
    color: COLORS.textLight,
  },
  summaryAmount: {
    fontSize: 20,
    color: COLORS.text,
    fontWeight: 'bold',
  },
  sectionTitle: {
    marginBottom: 10,
    color: COLORS.textLight,
  },
  debtCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: COLORS.card,
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  debtLeft: {
    flex: 1,
  },
  debtRight: {
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  debtTipo: {
    fontWeight: 'bold',
    color: COLORS.text,
  },
  debtDesc: {
    color: COLORS.textLight,
  },
  debtMonto: {
    fontWeight: 'bold',
    color: COLORS.text,
  },
  paidBtn: {
    marginTop: 10,
    padding: 6,
    backgroundColor: COLORS.secondary,
    borderRadius: 6,
  },
  paidBtnText: {
    color: '#fff',
    fontSize: 12,
  },
  progressBar: {
    height: 6,
    backgroundColor: '#ddd',
    borderRadius: 5,
    marginVertical: 6,
  },
  progressFill: {
    height: 6,
    backgroundColor: COLORS.secondary,
    borderRadius: 5,
  },
  progressText: {
    fontSize: 12,
    color: COLORS.textLight,
  },
  debtFecha: {
    fontSize: 12,
  },
  emptyCard: {
    alignItems: 'center',
    marginTop: 50,
  },
  emptyTitle: {
    marginTop: 10,
    color: COLORS.text,
  },
});