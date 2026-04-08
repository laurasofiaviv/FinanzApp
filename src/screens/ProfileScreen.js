// ProfileScreen.js
import React, { useContext } from 'react';
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
import { AuthContext } from '../context/AuthContext';
import { useFinanz } from '../context/FinanzContext';
import { COLORS, SIZES } from '../constants/Colors';

// ── HELPERS ───────────────────────────────────────────────────────────────
function fmt(n) {
  if (!n && n !== 0) return '$0';
  return '$' + Number(n).toLocaleString('es-CO');
}

// ── MINI TARJETA DE PRODUCTO ───────────────────────────────────────────────
function ProductRow({ producto, onPress }) {
  const iconMap = {
    credito: { name: 'card-outline',     bg: '#E6F1FB', color: '#185FA5' },
    debito:  { name: 'phone-portrait-outline', bg: '#EAF3DE', color: '#3B6D11' },
    efectivo:{ name: 'cash-outline',     bg: '#FAEEDA', color: '#854F0B' },
  };
  const labelMap = {
    credito:  { text: 'Crédito',  style: styles.tagCredit  },
    debito:   { text: 'Débito',   style: styles.tagDebit   },
    efectivo: { text: 'Efectivo', style: styles.tagCash    },
  };

  const icon  = iconMap[producto.tipo]  || iconMap.efectivo;
  const label = labelMap[producto.tipo] || labelMap.efectivo;

  const cupoTotal   = producto.cupoTotal  || 0;
  const saldoUsado  = producto.saldoUsado || 0;
  const disponible  = cupoTotal - saldoUsado;
  const pct         = cupoTotal > 0 ? Math.min((saldoUsado / cupoTotal) * 100, 100) : 0;
  const barColor    = pct > 80 ? COLORS.danger : pct > 50 ? '#F39C12' : '#1A56E8';

  const saldoLabel =
    producto.tipo === 'credito'
      ? fmt(disponible) + ' disp.'
      : fmt(producto.saldoActual || 0);

  const subLabel =
    producto.tipo === 'credito'
      ? `Corte: día ${producto.diaCorte} · Pago: día ${producto.diaPago}`
      : producto.banco || '';

  return (
    <TouchableOpacity style={styles.prodRow} onPress={onPress} activeOpacity={0.7}>
      {/* Icono */}
      <View style={[styles.prodIcon, { backgroundColor: icon.bg }]}>
        <Ionicons name={icon.name} size={18} color={icon.color} />
      </View>

      {/* Info */}
      <View style={styles.prodInfo}>
        <Text style={styles.prodName} numberOfLines={1}>{producto.nombre || 'Sin nombre'}</Text>
        {subLabel ? <Text style={styles.prodSub}>{subLabel}</Text> : null}
        {producto.tipo === 'credito' && (
          <View style={styles.barBg}>
            <View style={[styles.barFill, { width: `${pct}%`, backgroundColor: barColor }]} />
          </View>
        )}
      </View>

      {/* Monto + tag */}
      <View style={styles.prodRight}>
        <Text style={styles.prodAmount}>{saldoLabel}</Text>
        <View style={[styles.prodTag, label.style]}>
          <Text style={[styles.prodTagText, label.style]}>{label.text}</Text>
        </View>
      </View>

      <Ionicons name="chevron-forward" size={16} color={COLORS.textLight} />
    </TouchableOpacity>
  );
}

// ── FILA DE MENÚ GENÉRICA ─────────────────────────────────────────────────
function MenuRow({ icon, iconBg, iconColor, label, onPress, danger }) {
  return (
    <TouchableOpacity style={styles.menuRow} onPress={onPress} activeOpacity={0.7}>
      <View style={[styles.menuIcon, { backgroundColor: iconBg }]}>
        <Ionicons name={icon} size={17} color={iconColor} />
      </View>
      <Text style={[styles.menuLabel, danger && { color: COLORS.danger }]}>{label}</Text>
      <Ionicons name="chevron-forward" size={16} color={COLORS.textLight} />
    </TouchableOpacity>
  );
}

// ── CONTENEDOR DE SECCIÓN ─────────────────────────────────────────────────
function Section({ title, children }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionLabel}>{title}</Text>
      <View style={styles.sectionCard}>{children}</View>
    </View>
  );
}

// ── PANTALLA PRINCIPAL ────────────────────────────────────────────────────
export default function ProfileScreen({ navigation }) {
  const { usuario, logout } = useContext(AuthContext);
  const { productos, eliminarProducto } = useFinanz();

  const nombre = usuario?.nombre || 'Juan Pérez';
  const email  = usuario?.email  || 'admin@financify.com';
  const initials = nombre
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const handleLogout = () => {
    Alert.alert(
      'Cerrar sesión',
      '¿Estás seguro de que quieres cerrar sesión?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Cerrar sesión', style: 'destructive', onPress: logout },
      ]
    );
  };

  const goToProductDetail = (producto) => {
    navigation.navigate('ProductDetail', { productoId: producto.id });
  };

  const goToAddProduct = () => {
    navigation.navigate('Productos');
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* ── Header ── */}
      <View style={styles.header}>
        <View style={styles.avatarCircle}>
          <Text style={styles.avatarText}>{initials}</Text>
        </View>
        <Text style={styles.name}>{nombre}</Text>
        <Text style={styles.email}>{email}</Text>
      </View>

      {/* ── Contenido ── */}
      <ScrollView
        style={styles.scrollArea}
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* ── MIS PRODUCTOS ── */}
        <Section title="MIS PRODUCTOS">
          {productos.length === 0 ? (
            <View style={styles.emptyBox}>
              <Ionicons name="card-outline" size={32} color={COLORS.textLight} />
              <Text style={styles.emptyTitle}>Sin productos registrados</Text>
              <Text style={styles.emptySub}>
                Agrega tus tarjetas y cuentas para llevar un control más preciso.
              </Text>
              <TouchableOpacity style={styles.emptyBtn} onPress={goToAddProduct}>
                <Text style={styles.emptyBtnText}>Agregar uno</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              {productos.map((p, i) => (
                <View key={p.id}>
                  <ProductRow producto={p} onPress={() => goToProductDetail(p)} />
                  {i < productos.length - 1 && <View style={styles.divider} />}
                </View>
              ))}
              <View style={styles.divider} />
              <TouchableOpacity style={styles.addRow} onPress={goToAddProduct} activeOpacity={0.7}>
                <View style={styles.addCircle}>
                  <Ionicons name="add" size={18} color="#1A56E8" />
                </View>
                <Text style={styles.addRowText}>Agregar producto</Text>
              </TouchableOpacity>
            </>
          )}
        </Section>

        {/* ── CUENTA ── */}
        <Section title="CUENTA">
          <MenuRow
            icon="person-outline"
            iconBg="#EEEDFE"
            iconColor="#534AB7"
            label="Editar perfil"
            onPress={() => Alert.alert('Próximamente', 'Esta función estará disponible pronto.')}
          />
          <View style={styles.divider} />
          <MenuRow
            icon="lock-closed-outline"
            iconBg={COLORS.surface}
            iconColor={COLORS.textSecondary}
            label="Seguridad"
            onPress={() => Alert.alert('Próximamente', 'Esta función estará disponible pronto.')}
          />
          <View style={styles.divider} />
          <MenuRow
            icon="notifications-outline"
            iconBg="#E1F5EE"
            iconColor="#0F6E56"
            label="Notificaciones"
            onPress={() => Alert.alert('Próximamente', 'Esta función estará disponible pronto.')}
          />
        </Section>

        {/* ── CONFIGURACIÓN ── */}
        <Section title="CONFIGURACIÓN">
          <MenuRow
            icon="download-outline"
            iconBg={COLORS.surface}
            iconColor={COLORS.textSecondary}
            label="Exportar datos (Excel)"
            onPress={() => Alert.alert('Próximamente', 'Esta función estará disponible pronto.')}
          />
        </Section>

        {/* ── CERRAR SESIÓN ── */}
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout} activeOpacity={0.85}>
          <Ionicons name="log-out-outline" size={18} color="#A32D2D" style={{ marginRight: 8 }} />
          <Text style={styles.logoutText}>Cerrar sesión</Text>
        </TouchableOpacity>

        <View style={{ height: 32 }} />
      </ScrollView>
    </View>
  );
}

// ── ESTILOS ───────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.surface,
  },

  /* Header */
  header: {
    backgroundColor: COLORS.primary,
    paddingTop: Platform.OS === 'ios' ? 70 : 50,
    paddingBottom: 36,
    alignItems: 'center',
    borderBottomLeftRadius: SIZES.headerRadius,
    borderBottomRightRadius: SIZES.headerRadius,
  },
  avatarCircle: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: COLORS.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.35)',
  },
  avatarText: {
    color: '#fff',
    fontSize: 26,
    fontWeight: '700',
    letterSpacing: 1,
  },
  name: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
  },
  email: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: 13,
  },

  /* Scroll */
  scrollArea: { flex: 1 },
  scroll: {
    paddingHorizontal: SIZES.padding,
    paddingTop: 24,
    gap: 6,
  },

  /* Sección */
  section: { marginBottom: 8 },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textLight,
    letterSpacing: 0.7,
    marginBottom: 8,
    marginLeft: 2,
  },
  sectionCard: {
    backgroundColor: COLORS.background,
    borderRadius: SIZES.borderRadius,
    borderWidth: 1,
    borderColor: '#EBEBEB',
    overflow: 'hidden',
  },

  /* Divider */
  divider: {
    height: 1,
    backgroundColor: '#F2F2F2',
    marginHorizontal: 14,
  },

  /* Producto row */
  prodRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 13,
    gap: 10,
  },
  prodIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  prodInfo: {
    flex: 1,
    minWidth: 0,
  },
  prodName: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  prodSub: {
    fontSize: 11,
    color: COLORS.textLight,
    marginTop: 2,
  },
  barBg: {
    height: 3,
    backgroundColor: '#F0F0F0',
    borderRadius: 2,
    marginTop: 5,
  },
  barFill: {
    height: 3,
    borderRadius: 2,
  },
  prodRight: {
    alignItems: 'flex-end',
    gap: 4,
  },
  prodAmount: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  prodTag: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 20,
  },
  prodTagText: {
    fontSize: 10,
    fontWeight: '600',
  },
  tagCredit: { backgroundColor: '#E6F1FB', color: '#185FA5' },
  tagDebit:  { backgroundColor: '#EAF3DE', color: '#3B6D11' },
  tagCash:   { backgroundColor: '#FAEEDA', color: '#854F0B' },

  /* Empty state */
  emptyBox: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 20,
    gap: 8,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginTop: 6,
  },
  emptySub: {
    fontSize: 13,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 19,
  },
  emptyBtn: {
    marginTop: 8,
    borderWidth: 1.5,
    borderColor: COLORS.primary,
    borderRadius: 20,
    paddingVertical: 9,
    paddingHorizontal: 20,
  },
  emptyBtnText: {
    color: COLORS.primary,
    fontWeight: '600',
    fontSize: 13,
  },

  /* Add row */
  addRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 13,
    gap: 10,
  },
  addCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 1.5,
    borderColor: '#1A56E8',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addRowText: {
    color: '#1A56E8',
    fontSize: 13,
    fontWeight: '600',
  },

  /* Menú row */
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 13,
    gap: 12,
  },
  menuIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  menuLabel: {
    flex: 1,
    fontSize: 14,
    color: COLORS.textPrimary,
  },

  /* Logout */
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FCEBEB',
    borderWidth: 1,
    borderColor: '#F7C1C1',
    borderRadius: SIZES.borderRadius,
    paddingVertical: 15,
    marginTop: 8,
  },
  logoutText: {
    color: '#A32D2D',
    fontSize: 15,
    fontWeight: '600',
  },
});