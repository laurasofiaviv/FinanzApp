// ProductDetailScreen.js
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Platform,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFinanz } from '../context/FinanzContext';
import { COLORS, SIZES } from '../constants/Colors';

function fmt(n) {
  if (!n && n !== 0) return '$0';
  return '$' + Number(n).toLocaleString('es-CO');
}

function InfoRow({ label, value, valueColor }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={[styles.infoValue, valueColor && { color: valueColor }]}>{value}</Text>
    </View>
  );
}

export default function ProductDetailScreen({ route, navigation }) {
  const { productoId } = route.params;
  const { productos, eliminarProducto } = useFinanz();

  const producto = productos.find((p) => p.id === productoId);

  if (!producto) {
    return (
      <View style={styles.container}>
        <Text style={{ textAlign: 'center', marginTop: 40, color: COLORS.textSecondary }}>
          Producto no encontrado.
        </Text>
      </View>
    );
  }

  const iconMap = {
    credito:  { name: 'card-outline',           bg: '#E6F1FB', color: '#185FA5' },
    debito:   { name: 'phone-portrait-outline',  bg: '#EAF3DE', color: '#3B6D11' },
    efectivo: { name: 'cash-outline',            bg: '#FAEEDA', color: '#854F0B' },
  };
  const icon = iconMap[producto.tipo] || iconMap.efectivo;

  const tipoLabel = { credito: 'Tarjeta de crédito', debito: 'Cuenta débito', efectivo: 'Efectivo' };

  const cupoTotal  = producto.cupoTotal  || 0;
  const saldoUsado = producto.saldoUsado || 0;
  const disponible = cupoTotal - saldoUsado;
  const pct        = cupoTotal > 0 ? Math.min((saldoUsado / cupoTotal) * 100, 100) : 0;
  const barColor   = pct > 80 ? COLORS.danger : pct > 50 ? '#F39C12' : '#1A56E8';

  const handleEliminar = () => {
    Alert.alert(
      'Eliminar producto',
      `¿Seguro que deseas eliminar "${producto.nombre}"? Esta acción no se puede deshacer.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: () => {
            eliminarProducto(producto.id);
            navigation.goBack();
          },
        },
      ]
    );
  };

  const handleEditar = () => {
    navigation.navigate('EditProduct', { productoId: producto.id });
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Detalle de producto</Text>
        <TouchableOpacity onPress={handleEditar} style={styles.editBtn}>
          <Ionicons name="create-outline" size={20} color="#fff" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {/* Hero card */}
        <View style={styles.heroCard}>
          <View style={[styles.heroIcon, { backgroundColor: icon.bg }]}>
            <Ionicons name={icon.name} size={32} color={icon.color} />
          </View>
          <Text style={styles.heroName}>{producto.nombre}</Text>
          <Text style={styles.heroType}>{tipoLabel[producto.tipo] || producto.tipo}</Text>
          {producto.banco ? <Text style={styles.heroBanco}>{producto.banco}</Text> : null}
          {producto.franquicia ? (
            <View style={styles.franqBadge}>
              <Text style={styles.franqText}>{producto.franquicia.toUpperCase()}</Text>
            </View>
          ) : null}
        </View>

        {/* Saldo / cupo */}
        {producto.tipo === 'credito' ? (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>USO DE CUPO</Text>
            <View style={styles.cupoRow}>
              <View style={styles.cupoCell}>
                <Text style={styles.cupoLabel}>Usado</Text>
                <Text style={[styles.cupoValue, { color: barColor }]}>{fmt(saldoUsado)}</Text>
              </View>
              <View style={[styles.cupoCell, { alignItems: 'center' }]}>
                <Text style={styles.cupoLabel}>Disponible</Text>
                <Text style={[styles.cupoValue, { color: '#1A56E8' }]}>{fmt(disponible)}</Text>
              </View>
              <View style={[styles.cupoCell, { alignItems: 'flex-end' }]}>
                <Text style={styles.cupoLabel}>Total</Text>
                <Text style={styles.cupoValue}>{fmt(cupoTotal)}</Text>
              </View>
            </View>
            <View style={styles.barBg}>
              <View style={[styles.barFill, { width: `${pct}%`, backgroundColor: barColor }]} />
            </View>
            <Text style={styles.pctLabel}>{Math.round(pct)}% utilizado</Text>
          </View>
        ) : (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>SALDO ACTUAL</Text>
            <Text style={styles.bigBalance}>{fmt(producto.saldoActual || 0)}</Text>
          </View>
        )}

        {/* Info específica crédito */}
        {producto.tipo === 'credito' && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>FECHAS</Text>
            <InfoRow label="Día de corte" value={`Día ${producto.diaCorte} de cada mes`} />
            <View style={styles.infoDiv} />
            <InfoRow label="Día de pago" value={`Día ${producto.diaPago} de cada mes`} />
          </View>
        )}

        {/* Info general */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>INFORMACIÓN</Text>
          <InfoRow label="Tipo" value={tipoLabel[producto.tipo] || producto.tipo} />
          {producto.banco && (
            <>
              <View style={styles.infoDiv} />
              <InfoRow label="Banco" value={producto.banco} />
            </>
          )}
          <View style={styles.infoDiv} />
          <InfoRow
            label="Registrado el"
            value={new Date(producto.creadoEn).toLocaleDateString('es-CO', {
              day: '2-digit', month: 'long', year: 'numeric',
            })}
          />
        </View>

        {/* Acciones */}
        <TouchableOpacity style={styles.editBtnFull} onPress={handleEditar} activeOpacity={0.8}>
          <Ionicons name="create-outline" size={17} color={COLORS.primary} style={{ marginRight: 8 }} />
          <Text style={styles.editBtnText}>Editar producto</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.deleteBtn} onPress={handleEliminar} activeOpacity={0.8}>
          <Ionicons name="trash-outline" size={17} color="#A32D2D" style={{ marginRight: 8 }} />
          <Text style={styles.deleteBtnText}>Eliminar producto</Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.surface },

  header: {
    backgroundColor: COLORS.primary,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 20,
    paddingHorizontal: SIZES.padding,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomLeftRadius: SIZES.headerRadius,
    borderBottomRightRadius: SIZES.headerRadius,
  },
  backBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center', alignItems: 'center',
  },
  headerTitle: {
    flex: 1,
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
  },
  editBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center', alignItems: 'center',
  },

  content: { padding: SIZES.padding, gap: 12 },

  heroCard: {
    backgroundColor: COLORS.background,
    borderRadius: SIZES.borderRadius,
    borderWidth: 1,
    borderColor: '#EBEBEB',
    padding: 24,
    alignItems: 'center',
    gap: 6,
  },
  heroIcon: {
    width: 64, height: 64, borderRadius: 20,
    justifyContent: 'center', alignItems: 'center',
    marginBottom: 8,
  },
  heroName: { fontSize: 20, fontWeight: '700', color: COLORS.textPrimary },
  heroType: { fontSize: 13, color: COLORS.textSecondary },
  heroBanco: { fontSize: 13, color: COLORS.textLight },
  franqBadge: {
    backgroundColor: '#E6F1FB', borderRadius: 20,
    paddingHorizontal: 12, paddingVertical: 4, marginTop: 4,
  },
  franqText: { fontSize: 11, fontWeight: '700', color: '#185FA5', letterSpacing: 0.5 },

  card: {
    backgroundColor: COLORS.background,
    borderRadius: SIZES.borderRadius,
    borderWidth: 1,
    borderColor: '#EBEBEB',
    padding: 16,
  },
  cardTitle: {
    fontSize: 11, fontWeight: '700', color: COLORS.textLight,
    letterSpacing: 0.7, marginBottom: 14,
  },

  cupoRow: { flexDirection: 'row', marginBottom: 12 },
  cupoCell: { flex: 1 },
  cupoLabel: { fontSize: 11, color: COLORS.textLight, marginBottom: 4 },
  cupoValue: { fontSize: 16, fontWeight: '700', color: COLORS.textPrimary },

  barBg: { height: 6, backgroundColor: '#F0F0F0', borderRadius: 3 },
  barFill: { height: 6, borderRadius: 3 },
  pctLabel: { fontSize: 11, color: COLORS.textLight, marginTop: 8, textAlign: 'right' },

  bigBalance: { fontSize: 32, fontWeight: '700', color: COLORS.primary },

  infoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10 },
  infoLabel: { fontSize: 14, color: COLORS.textSecondary },
  infoValue: { fontSize: 14, fontWeight: '600', color: COLORS.textPrimary, textAlign: 'right', flex: 1, marginLeft: 16 },
  infoDiv: { height: 1, backgroundColor: '#F2F2F2' },

  editBtnFull: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: COLORS.primary,
    borderRadius: SIZES.borderRadius,
    paddingVertical: 15,
  },
  editBtnText: { color: COLORS.primary, fontSize: 15, fontWeight: '600' },

  deleteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FCEBEB',
    borderWidth: 1,
    borderColor: '#F7C1C1',
    borderRadius: SIZES.borderRadius,
    paddingVertical: 15,
  },
  deleteBtnText: { color: '#A32D2D', fontSize: 15, fontWeight: '600' },
});