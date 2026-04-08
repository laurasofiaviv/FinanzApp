//ReportesScreen.js
import React from 'react';
import {
  View, Text, StyleSheet, ScrollView, StatusBar,
  TouchableOpacity, Platform, Dimensions,
} from 'react-native';
import { PieChart } from 'react-native-chart-kit';
import { Feather } from '@expo/vector-icons';
import { COLORS, SIZES } from '../constants/Colors';
import { useFinanz } from '../context/FinanzContext';

const SCREEN_W = Dimensions.get('window').width;
const CHART_W  = SCREEN_W - SIZES.padding * 2;

const PALETTE = [
  '#3DA9D9', '#2ECC71', '#E74C3C', '#F39C12',
  '#9B59B6', '#1ABC9C', '#E67E22', '#2C5394',
  '#16A085', '#D35400', '#8E44AD', '#27AE60', '#C0392B',
];

// ── Helpers ────────────────────────────────────────────────────────────────
function formatCOP(num) {
  if (!num) return '$0';
  return '$' + Number(num).toLocaleString('es-CO');
}

function getMesActual() {
  return new Date().toLocaleString('es-CO', { month: 'long', year: 'numeric' });
}

function agruparPorCategoria(gastos) {
  const mapa = {};
  gastos.forEach((g) => {
    const cat = g.categoria || 'Otros';
    mapa[cat] = (mapa[cat] || 0) + parseFloat(g.monto || 0);
  });
  return Object.entries(mapa).map(([name, value], i) => ({
    name: name.replace(/^\S+\s/, ''), // quita emoji del label corto
    fullName: name,
    value,
    color: PALETTE[i % PALETTE.length],
    legendFontColor: COLORS.textSecondary,
    legendFontSize: 12,
  }));
}

function ultimos6Meses(ingresos, gastos) {
  const hoy    = new Date();
  const meses  = [];

  for (let i = 5; i >= 0; i--) {
    const fecha = new Date(hoy.getFullYear(), hoy.getMonth() - i, 1);
    const mes   = fecha.getMonth();
    const año   = fecha.getFullYear();
    const label = fecha.toLocaleString('es-CO', { month: 'short' });

    const sumIn = ingresos
      .filter((x) => { const d = new Date(x.creadoEn); return d.getMonth() === mes && d.getFullYear() === año; })
      .reduce((a, x) => a + parseFloat(x.monto || 0), 0);

    const sumGa = gastos
      .filter((x) => { const d = new Date(x.creadoEn); return d.getMonth() === mes && d.getFullYear() === año; })
      .reduce((a, x) => a + parseFloat(x.monto || 0), 0);

    meses.push({ label, ingreso: sumIn, gasto: sumGa });
  }
  return meses;
}

// ── Gráfica de barras custom ───────────────────────────────────────────────
function BarraCustom({ label, ingreso, gasto, maxVal }) {
  const alturaMax = 100;
  const altIn = maxVal > 0 ? (ingreso / maxVal) * alturaMax : 0;
  const altGa = maxVal > 0 ? (gasto  / maxVal) * alturaMax : 0;

  return (
    <View style={barStyles.col}>
      <View style={barStyles.barGroup}>
        {/* Barra ingreso */}
        <View style={barStyles.barWrapper}>
          <View style={[barStyles.bar, { height: altIn, backgroundColor: COLORS.secondary }]} />
        </View>
        {/* Barra gasto */}
        <View style={barStyles.barWrapper}>
          <View style={[barStyles.bar, { height: altGa, backgroundColor: COLORS.primary }]} />
        </View>
      </View>
      <Text style={barStyles.label}>{label}</Text>
    </View>
  );
}

const barStyles = StyleSheet.create({
  col:       { alignItems: 'center', flex: 1 },
  barGroup:  { flexDirection: 'row', alignItems: 'flex-end', height: 100, gap: 3 },
  barWrapper:{ width: 10, alignItems: 'center', justifyContent: 'flex-end' },
  bar:       { width: 10, borderRadius: 4, minHeight: 3 },
  label:     { fontSize: 10, color: COLORS.textSecondary, marginTop: 6, textAlign: 'center' },
});

// ── Tarjeta resumen ────────────────────────────────────────────────────────
function ResumenCard({ label, value, icon, color }) {
  return (
    <View style={[styles.resumenCard, { borderLeftColor: color }]}>
      <View style={[styles.resumenIconCircle, { backgroundColor: color + '20' }]}>
        <Feather name={icon} size={18} color={color} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.resumenLabel}>{label}</Text>
        <Text style={[styles.resumenValue, { color }]} numberOfLines={1}>{value}</Text>
      </View>
    </View>
  );
}

// ── Pantalla principal ─────────────────────────────────────────────────────
export default function ReportesScreen({ navigation }) {
  const { gastos, ingresos, totalGastosMes, totalIngresosMes, balanceMes } = useFinanz();

  const categorias = agruparPorCategoria(gastos);
  const meses      = ultimos6Meses(ingresos, gastos);
  const maxVal     = Math.max(...meses.map((m) => Math.max(m.ingreso, m.gasto)), 1);

  const mayorGasto   = gastos.length
    ? gastos.reduce((a, b) => (parseFloat(a.monto) > parseFloat(b.monto) ? a : b))
    : null;
  const catFrecuente = categorias.length
    ? categorias.reduce((a, b) => (a.value > b.value ? a : b))
    : null;

  const balance    = balanceMes();
  const balancePos = balance >= 0;

  const chartConfig = {
    backgroundGradientFrom: '#fff',
    backgroundGradientTo:   '#fff',
    color: (opacity = 1) => `rgba(61, 169, 217, ${opacity})`,
    labelColor: () => COLORS.textSecondary,
    decimalPlaces: 0,
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <StatusBar barStyle="light-content" />

      {/* ── Header azul ─────────────────────────────────────────────── */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Feather name="arrow-left" size={22} color="#fff" />
        </TouchableOpacity>
        <View style={styles.headerText}>
          <Text style={styles.headerTitle}>Reportes Financieros</Text>
          <Text style={styles.headerSubtitle}>{getMesActual()}</Text>
        </View>
        <View style={styles.profileCircle}>
          <Feather name="bar-chart-2" size={22} color={COLORS.primary} />
        </View>
      </View>

      <View style={styles.content}>

        {/* ── Balance general ──────────────────────────────────────── */}
        <View style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>Balance del Mes</Text>
          <Text style={[styles.balanceValue, { color: balancePos ? COLORS.secondary : COLORS.danger }]}>
            {balancePos ? '+' : ''}{formatCOP(balance)}
          </Text>
          <View style={styles.balanceRow}>
            <View style={styles.balanceStat}>
              <View style={[styles.dot, { backgroundColor: COLORS.secondary }]} />
              <Text style={styles.balanceStatLabel}>Ingresos</Text>
              <Text style={[styles.balanceStatValue, { color: COLORS.secondary }]}>
                {formatCOP(totalIngresosMes())}
              </Text>
            </View>
            <View style={styles.balanceDivider} />
            <View style={styles.balanceStat}>
              <View style={[styles.dot, { backgroundColor: COLORS.danger }]} />
              <Text style={styles.balanceStatLabel}>Gastos</Text>
              <Text style={[styles.balanceStatValue, { color: COLORS.danger }]}>
                {formatCOP(totalGastosMes())}
              </Text>
            </View>
          </View>
        </View>

        {/* ── Gráfica dona: Gastos por Categoría ──────────────────── */}
        <Text style={styles.sectionTitle}>Gastos por Categoría</Text>

        {categorias.length === 0 ? (
          <View style={styles.emptyBox}>
            <Feather name="pie-chart" size={32} color={COLORS.textLight} />
            <Text style={styles.emptyText}>Aún no hay gastos registrados</Text>
          </View>
        ) : (
          <View style={styles.chartCard}>
            <PieChart
              data={categorias.map((c) => ({
                name:            c.name,
                population:      c.value,
                color:           c.color,
                legendFontColor: COLORS.textSecondary,
                legendFontSize:  12,
              }))}
              width={CHART_W - 16}
              height={200}
              chartConfig={chartConfig}
              accessor="population"
              backgroundColor="transparent"
              paddingLeft="10"
              hasLegend
            />
          </View>
        )}

        {/* ── Barras custom: Tendencia Mensual ────────────────────── */}
        <Text style={[styles.sectionTitle, { marginTop: 24 }]}>
          Tendencia Mensual
        </Text>

        <View style={styles.chartCard}>
          {/* Leyenda */}
          <View style={styles.legendRow}>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: COLORS.secondary }]} />
              <Text style={styles.legendText}>Ingresos</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: COLORS.primary }]} />
              <Text style={styles.legendText}>Gastos</Text>
            </View>
          </View>

          {/* Barras */}
          <View style={styles.barsContainer}>
            {meses.map((m, i) => (
              <BarraCustom
                key={i}
                label={m.label}
                ingreso={m.ingreso}
                gasto={m.gasto}
                maxVal={maxVal}
              />
            ))}
          </View>

          {/* Estado vacío */}
          {meses.every((m) => m.ingreso === 0 && m.gasto === 0) && (
            <Text style={[styles.emptyText, { textAlign: 'center', paddingVertical: 12 }]}>
              Registra ingresos o gastos para ver la tendencia
            </Text>
          )}
        </View>

        {/* ── Tarjetas resumen ─────────────────────────────────────── */}
        <Text style={[styles.sectionTitle, { marginTop: 24 }]}>Resumen</Text>

        <View style={styles.resumenGrid}>
          <ResumenCard
            label="Mayor Gasto"
            value={mayorGasto ? formatCOP(mayorGasto.monto) : '$0'}
            icon="trending-down"
            color={COLORS.danger}
          />
          <ResumenCard
            label="Categoría más Frecuente"
            value={catFrecuente ? catFrecuente.fullName : '—'}
            icon="tag"
            color={COLORS.primary}
          />
          <ResumenCard
            label="Total Ingresos"
            value={formatCOP(totalIngresosMes())}
            icon="trending-up"
            color={COLORS.secondary}
          />
          <ResumenCard
            label="Total Gastos"
            value={formatCOP(totalGastosMes())}
            icon="credit-card"
            color={COLORS.warning}
          />
        </View>

        {/* ── Botón Ver Detalles ───────────────────────────────────── */}
        <TouchableOpacity
          style={styles.detallesBtn}
          onPress={() => console.log('Ver detalles')}
          activeOpacity={0.85}
        >
          <Text style={styles.detallesBtnText}>Ver Detalles por Categoría</Text>
          <Feather name="chevron-right" size={18} color={COLORS.primary} />
        </TouchableOpacity>

      </View>
    </ScrollView>
  );
}

// ── Estilos ────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },

  header: {
    backgroundColor: COLORS.primary,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 30,
    paddingHorizontal: SIZES.padding,
    borderBottomLeftRadius: SIZES.headerRadius,
    borderBottomRightRadius: SIZES.headerRadius,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backBtn: {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center', alignItems: 'center',
    marginRight: 14,
  },
  headerText: { flex: 1 },
  headerTitle:    { color: '#fff', fontSize: 22, fontWeight: 'bold' },
  headerSubtitle: { color: 'rgba(255,255,255,0.8)', fontSize: 13, marginTop: 2 },
  profileCircle: {
    width: 42, height: 42, borderRadius: 21,
    backgroundColor: '#fff',
    justifyContent: 'center', alignItems: 'center',
  },

  content: {
    paddingHorizontal: SIZES.padding,
    paddingTop: 24,
    paddingBottom: 40,
  },

  // Balance
  balanceCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 20, padding: 20,
    marginBottom: 28, alignItems: 'center',
  },
  balanceLabel: { fontSize: 14, color: COLORS.textSecondary, marginBottom: 6 },
  balanceValue: { fontSize: 36, fontWeight: 'bold', marginBottom: 16 },
  balanceRow:   { flexDirection: 'row', width: '100%' },
  balanceStat:  { flex: 1, alignItems: 'center', gap: 4 },
  balanceDivider: { width: 1, backgroundColor: '#E0E0E0', marginHorizontal: 16 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  balanceStatLabel: { fontSize: 12, color: COLORS.textLight },
  balanceStatValue: { fontSize: 16, fontWeight: 'bold' },

  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: COLORS.textPrimary, marginBottom: 12 },

  chartCard: {
    backgroundColor: '#fff', borderRadius: 20, padding: 12,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 8, elevation: 3,
    alignItems: 'center',
  },
  emptyBox: {
    backgroundColor: COLORS.surface, borderRadius: 20,
    padding: 40, alignItems: 'center', gap: 12,
  },
  emptyText: { fontSize: 14, color: COLORS.textLight, textAlign: 'center' },

  // Leyenda
  legendRow:  { flexDirection: 'row', gap: 20, alignSelf: 'flex-start', paddingLeft: 8, marginBottom: 12 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendDot:  { width: 10, height: 10, borderRadius: 5 },
  legendText: { fontSize: 12, color: COLORS.textSecondary },

  // Barras custom
  barsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    width: '100%',
    paddingHorizontal: 8,
    paddingBottom: 4,
  },

  // Resumen
  resumenGrid: { gap: 12, marginTop: 12 },
  resumenCard: {
    backgroundColor: '#fff', borderRadius: 16, padding: 16,
    flexDirection: 'row', alignItems: 'center', gap: 14,
    borderLeftWidth: 4,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05, shadowRadius: 4, elevation: 2,
  },
  resumenIconCircle: {
    width: 40, height: 40, borderRadius: 20,
    justifyContent: 'center', alignItems: 'center',
  },
  resumenLabel: { fontSize: 12, color: COLORS.textSecondary, marginBottom: 2 },
  resumenValue: { fontSize: 16, fontWeight: 'bold' },

  // Botón detalles
  detallesBtn: {
    marginTop: 24,
    borderWidth: 1.5, borderColor: COLORS.primary,
    borderRadius: SIZES.borderRadius,
    paddingVertical: 16, paddingHorizontal: 20,
    flexDirection: 'row', justifyContent: 'center',
    alignItems: 'center', gap: 8, backgroundColor: '#fff',
  },
  detallesBtnText: { color: COLORS.primary, fontSize: 15, fontWeight: 'bold' },
});