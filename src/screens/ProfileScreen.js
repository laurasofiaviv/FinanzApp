// ── PANTALLA PRINCIPAL ────────────────────────────────────────────────────
import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Alert,
  StyleSheet
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES } from '../constants/Colors';
import { useProfile } from '../hooks/useProfile';

export default function ProfileScreen({ navigation }) {
  const {
    nombre, email, initials,
    productos, handleLogout,
  } = useProfile();

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
function ProductRow({ producto, onPress }) {
  return (
      <TouchableOpacity
          style={{ padding: 14, flexDirection: 'row', justifyContent: 'space-between' }}
          onPress={onPress}
      >
        <Text>{producto.nombre || 'Producto'}</Text>
        <Ionicons name="chevron-forward" size={16} color="#999" />
      </TouchableOpacity>
  );
}

function MenuRow({ icon, iconBg, iconColor, label, onPress }) {
  return (
      <TouchableOpacity
          style={{ flexDirection: 'row', alignItems: 'center', padding: 14 }}
          onPress={onPress}
      >
        <View style={{
          width: 30,
          height: 30,
          borderRadius: 8,
          backgroundColor: iconBg,
          justifyContent: 'center',
          alignItems: 'center',
          marginRight: 10
        }}>
          <Ionicons name={icon} size={16} color={iconColor} />
        </View>

        <Text style={{ flex: 1 }}>{label}</Text>

        <Ionicons name="chevron-forward" size={16} color="#999" />
      </TouchableOpacity>
  );
}

function Section({ title, children }) {
  return (
      <View style={{ marginBottom: 12 }}>
        <Text style={{ fontSize: 12, color: COLORS.textLight, marginBottom: 6 }}>
          {title}
        </Text>
        <View style={{ backgroundColor: '#fff', borderRadius: 10 }}>
          {children}
        </View>
      </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.surface,
  },

  header: {
    backgroundColor: COLORS.primary,
    paddingTop: 60,
    paddingBottom: 30,
    alignItems: 'center',
    borderBottomLeftRadius: SIZES.headerRadius,
    borderBottomRightRadius: SIZES.headerRadius,
  },

  avatarCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: COLORS.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },

  avatarText: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
  },

  name: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },

  email: {
    color: '#ddd',
    fontSize: 13,
  },

  scrollArea: {
    flex: 1,
  },

  scroll: {
    padding: 20,
  },

  emptyBox: {
    alignItems: 'center',
    paddingVertical: 30,
  },

  emptyTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    marginTop: 10,
  },

  emptySub: {
    fontSize: 13,
    textAlign: 'center',
    marginTop: 5,
  },

  emptyBtn: {
    marginTop: 10,
    borderWidth: 1,
    borderColor: COLORS.primary,
    padding: 10,
    borderRadius: 20,
  },

  emptyBtnText: {
    color: COLORS.primary,
    fontWeight: 'bold',
  },

  addRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
  },

  addCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 1,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },

  addRowText: {
    color: COLORS.primary,
    fontWeight: 'bold',
  },

  divider: {
    height: 1,
    backgroundColor: '#eee',
  },

  logoutBtn: {
    marginTop: 20,
    backgroundColor: '#FCEBEB',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },

  logoutText: {
    color: '#A32D2D',
    fontWeight: 'bold',
  },
});