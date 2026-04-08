//DebtScreen.js
import React from 'react';
import { Modal } from 'react-native';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Image,
  Platform
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { COLORS, SIZES } from '../constants/Colors';
import { useFinanz } from '../context/FinanzContext';

const ICONS = {
  banco: require('../../assets/banco.png'),
  efectivo: require('../../assets/efectivo.png'),
  tarjeta: require('../../assets/tarjetacredito.png'),
};

const getIcon = (tipo) => {
  if (!tipo) return ICONS.efectivo;
  const t = tipo.toLowerCase();
  if (t.includes('tarjeta')) return ICONS.tarjeta;
  if (t.includes('préstamo') || t.includes('banco')) return ICONS.banco;
  return ICONS.efectivo;
};

export default function DebtScreen({ navigation }) {
  const { deudas, pagarCuota, productos } = useFinanz();
  const hoy = new Date();
  const [modalVisible, setModalVisible] = React.useState(false);
  const [deudaSeleccionada, setDeudaSeleccionada] = React.useState(null);

  const deudasProcesadas = deudas.map((d) => {
    const montoPagado = d.montoPagado || 0;
    const cuotas = parseInt(d.cuotas) || 0;
    const cuotasPagadas = d.cuotasPagadas || 0;
    const fechaBase = d.fechaVencimiento || d.fecha;

    if (!fechaBase) return { ...d, estado: 'pendiente', diffDays: 999, restante: d.monto, progreso: 0 };

    const [dia, mes, año] = fechaBase.split('/');
    const fechaVence = new Date(año, mes - 1, dia);
    const diffDays = Math.ceil((fechaVence - hoy) / (1000 * 60 * 60 * 24));

    let estado = 'pendiente';
    if (montoPagado >= d.monto) estado = 'pagada';
    else if (diffDays < 0) estado = 'vencida';

    return {
      ...d,
      estado,
      diffDays,
      restante: d.monto - montoPagado,
      progreso: cuotas > 0 ? cuotasPagadas / cuotas : montoPagado / d.monto,
    };
  });

  const pendientes = deudasProcesadas
    .filter((d) => d.estado !== 'pagada')
    .sort((a, b) => a.diffDays - b.diffDays);

  const pagadas = deudasProcesadas.filter((d) => d.estado === 'pagada');

  const getUrgencyColor = (diffDays) => {
    if (diffDays < 0) return COLORS.danger;
    if (diffDays <= 3) return '#E67E22';
    return COLORS.textLight;
  };

  return (
    <>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <StatusBar barStyle="light-content" />

        {/* HEADER (igual Dashboard) */}
        <View style={styles.header}>
          <View style={styles.headerRow}>
            <View>
              <Text style={styles.welcome}>Bienvenido de nuevo</Text>
              <Text style={styles.headerName}>Juan Pérez</Text>
            </View>

            <View style={styles.avatarCircle}>
              <Text style={styles.avatarText}>JP</Text>
            </View>
          </View>
        </View>

        {/* CONTENT */}
        <View style={styles.content}>
          <View style={styles.mainCard}>
            <Text style={styles.cardTitle}>Mis Deudas</Text>
            <Text style={styles.cardSub}>{pendientes.length} pendientes</Text>

            <TouchableOpacity
              style={styles.prodBtn}
              onPress={() => navigation.navigate('Productos')}
            >
              <Feather name="credit-card" size={18} color={COLORS.textPrimary} />
              <Text style={styles.prodBtnText}>Mis productos</Text>
            </TouchableOpacity>

            <Text style={styles.sectionTitle}>PENDIENTES</Text>

            {pendientes.map((deuda) => {
              const color = getUrgencyColor(deuda.diffDays);

              return (
                <View key={deuda.id} style={styles.debtCard}>
                  <Image source={getIcon(deuda.tipo)} style={styles.icon} />

                  <View style={{ flex: 1 }}>
                    <View style={styles.rowBetween}>
                      <Text style={styles.debtTipo}>{deuda.tipo}</Text>
                      <Text style={styles.debtMonto}>
                        ${deuda.restante.toLocaleString('es-CO')}
                      </Text>
                    </View>

                    <Text style={styles.debtDesc}>
                      {deuda.descripcion || 'Sin descripción'}
                    </Text>

                    <View style={styles.progressBar}>
                      <View
                        style={[
                          styles.progressFill,
                          { width: `${deuda.progreso * 100}%` },
                        ]}
                      />
                    </View>

                    <View style={styles.rowBetween}>
                      <View>
                        <Text style={styles.progressText}>
                          {deuda.cuotas
                            ? `${deuda.cuotasPagadas || 0}/${deuda.cuotas} cuotas`
                            : `${Math.round(deuda.progreso * 100)}%`}
                        </Text>

                        <Text style={[styles.estadoText, { color }]}>
                          {deuda.diffDays < 0 ? 'Vencida' : 'A tiempo'}
                        </Text>
                      </View>

                      <TouchableOpacity
                        style={styles.paidBtn}
                        onPress={() => {
                          setDeudaSeleccionada(deuda);
                          setModalVisible(true);
                        }}
                      >
                        <Text style={styles.paidBtnText}>Abonar</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              );
            })}

            {pagadas.length > 0 && (
              <>
                <Text style={styles.sectionTitle}>PAGADAS</Text>

                {pagadas.map((d) => (
                  <View key={d.id} style={styles.debtCard}>
                    <Image source={getIcon(d.tipo)} style={[styles.icon, { opacity: 0.4 }]} />

                    <View style={{ flex: 1 }}>
                      <View style={styles.rowBetween}>
                        <Text style={[styles.debtTipo, { color: COLORS.textLight }]}>
                          {d.tipo}
                        </Text>
                        <Text style={[styles.debtMonto, { color: COLORS.textLight }]}>
                          ${d.monto.toLocaleString('es-CO')}
                        </Text>
                      </View>

                      <Text style={styles.debtDesc}>
                        {d.descripcion || 'Pagada'}
                      </Text>
                    </View>
                  </View>
                ))}
              </>
            )}

            <View style={styles.footerInfo}>
              <Feather name="trending-up" size={40} color={COLORS.secondary} />
              <Text style={styles.footerText}>¡Todo al día!</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* MODAL AQUÍ */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={{
          flex: 1,
          backgroundColor: 'rgba(0,0,0,0.4)',
          justifyContent: 'flex-end'
        }}>
          <View style={{
            backgroundColor: '#fff',
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            padding: 20
          }}>
            <Text style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 10 }}>
              Selecciona cuenta para pagar
            </Text>

            {productos.map((p) => {
              if (!deudaSeleccionada) return null;

              // calcular cuánto se va a pagar
              let montoPago = 0;

              if (!deudaSeleccionada.cuotas || deudaSeleccionada.cuotas <= 1) {
                montoPago =
                  deudaSeleccionada.monto -
                  (deudaSeleccionada.montoPagado || 0);
              } else {
                montoPago = deudaSeleccionada.monto / deudaSeleccionada.cuotas;
              }

              const saldoInsuficiente = (p.saldoActual || 0) < montoPago;

              return (
                <TouchableOpacity
                  key={p.id}
                  disabled={saldoInsuficiente}
                  style={{
                    padding: 12,
                    borderBottomWidth: 1,
                    borderBottomColor: '#eee',
                    opacity: saldoInsuficiente ? 0.5 : 1, // efecto visual
                  }}
                  onPress={() => {
                    if (saldoInsuficiente) return;

                    pagarCuota(deudaSeleccionada.id, p.id);
                    setModalVisible(false);
                    setDeudaSeleccionada(null);
                  }}
                >
                  <Text>
                    {p.nombre} - ${p.saldoActual?.toLocaleString('es-CO')}
                  </Text>

                  {saldoInsuficiente && (
                    <Text style={{ color: 'red', fontSize: 12 }}>
                      Saldo insuficiente
                    </Text>
                  )}
                </TouchableOpacity>
              );
            })}

            <TouchableOpacity
              onPress={() => setModalVisible(false)}
              style={{ marginTop: 10 }}
            >
              <Text style={{ color: 'red', textAlign: 'center' }}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );

}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  header: {
    backgroundColor: COLORS.primary,
    paddingTop: Platform.OS === 'web' ? 40 : 70,
    paddingHorizontal: SIZES.padding,
    paddingBottom: 40,
    borderBottomLeftRadius: SIZES.headerRadius,
    borderBottomRightRadius: SIZES.headerRadius,
  },

  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  welcome: {
    color: COLORS.white,
    fontSize: 14,
    opacity: 0.8,
  },

  headerName: {
    color: COLORS.white,
    fontSize: SIZES.title,
    fontWeight: 'bold',
  },

  avatarCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: COLORS.secondary,
    justifyContent: 'center',
    alignItems: 'center',
  },

  avatarText: {
    color: COLORS.white,
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

  mainCard: {
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

  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },

  cardSub: {
    fontSize: 12,
    color: COLORS.textLight,
    marginBottom: 15,
  },

  prodBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    padding: 12,
    borderRadius: 12,
    marginBottom: 15,
  },

  prodBtnText: {
    marginLeft: 8,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },

  sectionTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: 14,
    letterSpacing: 0.5,
  },

  debtCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 14,
    borderRadius: 14,
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },

  icon: {
    width: 40,
    height: 40,
    marginRight: 12,
    resizeMode: 'contain',
  },

  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  debtTipo: {
    fontWeight: '600',
    fontSize: 14,
    color: COLORS.textPrimary,
  },

  debtMonto: {
    fontWeight: 'bold',
    fontSize: 14,
    color: COLORS.textPrimary,
  },

  debtDesc: {
    fontSize: 12,
    color: COLORS.textLight,
  },

  progressBar: {
    height: 6,
    backgroundColor: '#E0E0E0',
    borderRadius: 10,
    marginVertical: 6,
  },

  progressFill: {
    height: 6,
    backgroundColor: COLORS.secondary,
    borderRadius: 10,
  },

  progressText: {
    fontSize: 12,
    color: COLORS.textLight,
  },

  estadoText: {
    fontSize: 12,
  },

  paidBtn: {
    backgroundColor: COLORS.secondary,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
  },

  paidBtnText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },

  footerInfo: {
    alignItems: 'center',
    marginTop: 20,
  },

  footerText: {
    color: COLORS.textLight,
    marginTop: 10,
    fontWeight: '600',
  },
});