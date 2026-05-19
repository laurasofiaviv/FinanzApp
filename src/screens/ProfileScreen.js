// src/screens/ProfileScreen.js
import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StatusBar,
  Alert, StyleSheet, Modal, TextInput, ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES } from '../constants/Colors';
import { useProfile } from '../hooks/useProfile';
import ConfirmModal from '../components/ConfirmModal';
import { exportarExcel } from '../services/userService';

export default function ProfileScreen({ navigation }) {
  const {
    nombre, email, initials,
    productos, handleLogout,
    editando, setEditando,
    setNombre, handleGuardar, guardando,
    passActual, setPassActual,
    passNueva, setPassNueva,
    passConfirm, setPassConfirm,
    guardandoPass, handleCambiarPassword,
    passError, setPassError, passExito,
  } = useProfile();

  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const goToProductDetail = (producto) =>
    navigation.navigate('ProductDetail', { productoId: producto.id });
  const goToAddProduct = () => navigation.navigate('Productos');

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
                  <Ionicons name="add" size={18} color={COLORS.primary} />
                </View>
                <Text style={styles.addRowText}>Agregar producto</Text>
              </TouchableOpacity>
            </>
          )}
        </Section>

        {/* ── CUENTA ── */}
        <Section title="CUENTA">
          {/* ← onPress conectado al modal */}
          <MenuRow
            icon="person-outline"
            iconBg="#EEEDFE"
            iconColor="#534AB7"
            label="Editar perfil"
            onPress={() => setEditando(true)}
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
            onPress={() => navigation.navigate('Notificaciones')}
          />
        </Section>

        {/* ── CONFIGURACIÓN ── */}
        <Section title="CONFIGURACIÓN">
          <MenuRow
              icon="download-outline"
              iconBg={COLORS.surface}
              iconColor={COLORS.textSecondary}
              label="Exportar datos (Excel)"
              onPress={async () => {
                try {
                  await exportarExcel();
                } catch (e) {
                  Alert.alert('Error', 'No se pudieron exportar los datos');
                }
              }}
          />
        </Section>

        {/* ── CERRAR SESIÓN — ahora abre el modal bonito ── */}
        <TouchableOpacity style={styles.logoutBtn} onPress={() => setShowLogoutConfirm(true)} activeOpacity={0.85}>
          <Ionicons name="log-out-outline" size={18} color="#A32D2D" style={{ marginRight: 8 }} />
          <Text style={styles.logoutText}>Cerrar sesión</Text>
        </TouchableOpacity>

        <View style={{ height: 32 }} />
      </ScrollView>

      {/* ── Modal editar perfil ── */}
      <Modal visible={editando} transparent animationType="fade" onRequestClose={() => setEditando(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

              <Text style={styles.modalTitle}>Editar perfil</Text>

              {/* ── Nombre ── */}
              <Text style={styles.modalLabel}>Nombre</Text>
              <TextInput
                style={[styles.modalInput, { marginBottom: 16 }]}
                value={nombre}
                onChangeText={setNombre}
                placeholder="Tu nombre"
                placeholderTextColor="#aaa"
                autoFocus
              />
              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[styles.modalBtn, styles.modalBtnSecondary]}
                  onPress={() => setEditando(false)}
                  disabled={guardando}
                >
                  <Text style={styles.modalBtnSecondaryText}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalBtn, styles.modalBtnPrimary, guardando && styles.btnDisabled]}
                  onPress={handleGuardar}
                  disabled={guardando}
                >
                  {guardando
                    ? <ActivityIndicator color="#fff" size="small" />
                    : <Text style={styles.modalBtnPrimaryText}>Guardar nombre</Text>
                  }
                </TouchableOpacity>
              </View>

              {/* ── Divisor ── */}
              <View style={{ height: 1, backgroundColor: '#eee', marginVertical: 20 }} />

              {/* ── Cambiar contraseña ── */}
              <Text style={[styles.modalLabel, { marginBottom: 12 }]}>Cambiar contraseña</Text>

              <TextInput
                style={[styles.modalInput, { marginBottom: 10 }]}
                value={passActual}
                onChangeText={(v) => { setPassActual(v); setPassError(''); setPassExito(''); }}
                placeholder="Contraseña actual"
                placeholderTextColor="#aaa"
                secureTextEntry
              />
              <TextInput
                style={[styles.modalInput, { marginBottom: 10 }]}
                value={passNueva}
                onChangeText={(v) => { setPassNueva(v); setPassError(''); setPassExito(''); }}
                placeholder="Nueva contraseña (mín. 6 caracteres)"
                placeholderTextColor="#aaa"
                secureTextEntry
              />
              <TextInput
                style={[styles.modalInput, { marginBottom: 12 }]}
                value={passConfirm}
                onChangeText={(v) => { setPassConfirm(v); setPassError(''); setPassExito(''); }}
                placeholder="Confirmar nueva contraseña"
                placeholderTextColor="#aaa"
                secureTextEntry
              />

              {/* ── Mensaje de error ── */}
              {passError ? (
                <View style={{
                  backgroundColor: '#FFF0F0', borderRadius: 8,
                  padding: 10, marginBottom: 10,
                  borderLeftWidth: 3, borderLeftColor: '#E74C3C',
                  flexDirection: 'row', alignItems: 'center', gap: 8,
                }}>
                  <Ionicons name="alert-circle-outline" size={16} color="#C0392B" />
                  <Text style={{ color: '#C0392B', fontSize: 13, flex: 1 }}>{passError}</Text>
                </View>
              ) : null}

              {/* ── Mensaje de éxito ── */}
              {passExito ? (
                <View style={{
                  backgroundColor: '#F0FFF4', borderRadius: 8,
                  padding: 10, marginBottom: 10,
                  borderLeftWidth: 3, borderLeftColor: '#27AE60',
                  flexDirection: 'row', alignItems: 'center', gap: 8,
                }}>
                  <Ionicons name="checkmark-circle-outline" size={16} color="#1E8449" />
                  <Text style={{ color: '#1E8449', fontSize: 13, flex: 1 }}>{passExito}</Text>
                </View>
              ) : null}

              <TouchableOpacity
                style={[
                  styles.modalBtn, styles.modalBtnPrimary,
                  { width: '100%', marginBottom: 4 },
                  guardandoPass && styles.btnDisabled,
                ]}
                onPress={handleCambiarPassword}
                disabled={guardandoPass}
              >
                {guardandoPass
                  ? <ActivityIndicator color="#fff" size="small" />
                  : <Text style={styles.modalBtnPrimaryText}>Cambiar contraseña</Text>
                }
              </TouchableOpacity>

            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* ── Modal confirmar logout ── */}
      <ConfirmModal
        visible={showLogoutConfirm}
        icon="log-out-outline"
        iconColor="#A32D2D"
        iconBg="#FCEBEB"
        title="¿Cerrar sesión?"
        message="Tendrás que volver a iniciar sesión para acceder a tu cuenta."
        confirmText="Sí, cerrar sesión"
        cancelText="Cancelar"
        confirmColor="#A32D2D"
        onConfirm={() => { setShowLogoutConfirm(false); handleLogout(); }}
        onCancel={() => setShowLogoutConfirm(false)}
      />


    </View>
  );
}

// ── Componentes auxiliares ────────────────────────────────────────────────

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
        width: 30, height: 30, borderRadius: 8,
        backgroundColor: iconBg,
        justifyContent: 'center', alignItems: 'center',
        marginRight: 10,
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
      <Text style={{ fontSize: 12, color: COLORS.textLight, marginBottom: 6 }}>{title}</Text>
      <View style={{ backgroundColor: '#fff', borderRadius: 10 }}>{children}</View>
    </View>
  );
}

// ── Estilos ───────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.surface },

  header: {
    backgroundColor: COLORS.primary,
    paddingTop: 60,
    paddingBottom: 30,
    alignItems: 'center',
    borderBottomLeftRadius: SIZES.headerRadius,
    borderBottomRightRadius: SIZES.headerRadius,
  },
  avatarCircle: {
    width: 70, height: 70, borderRadius: 35,
    backgroundColor: COLORS.secondary,
    justifyContent: 'center', alignItems: 'center',
    marginBottom: 10,
  },
  avatarText: { color: '#fff', fontSize: 22, fontWeight: 'bold' },
  name: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  email: { color: '#ddd', fontSize: 13 },

  scrollArea: { flex: 1 },
  scroll: { padding: 20 },

  emptyBox: { alignItems: 'center', paddingVertical: 30 },
  emptyTitle: { fontSize: 15, fontWeight: 'bold', marginTop: 10 },
  emptySub: { fontSize: 13, textAlign: 'center', marginTop: 5 },
  emptyBtn: { marginTop: 10, borderWidth: 1, borderColor: COLORS.primary, padding: 10, borderRadius: 20 },
  emptyBtnText: { color: COLORS.primary, fontWeight: 'bold' },

  addRow: { flexDirection: 'row', alignItems: 'center', padding: 14 },
  addCircle: {
    width: 30, height: 30, borderRadius: 15,
    borderWidth: 1, borderStyle: 'dashed',
    justifyContent: 'center', alignItems: 'center', marginRight: 10,
  },
  addRowText: { color: COLORS.primary, fontWeight: 'bold' },
  divider: { height: 1, backgroundColor: '#eee' },

  logoutBtn: {
    marginTop: 20, backgroundColor: '#FCEBEB',
    padding: 15, borderRadius: 10,
    alignItems: 'center', flexDirection: 'row', justifyContent: 'center',
  },
  logoutText: { color: '#A32D2D', fontWeight: 'bold' },

  // ── Modal ──
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    width: '85%',
    maxHeight: '85%',
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
  },
  modalTitle: { fontSize: 18, fontWeight: '700', color: '#222', marginBottom: 20 },
  modalLabel: { fontSize: 12, color: '#888', marginBottom: 6, textTransform: 'uppercase' },
  modalInput: {
    borderWidth: 1, borderColor: '#ddd', borderRadius: 10,
    padding: 12, fontSize: 16, color: '#222', marginBottom: 24,
  },
  modalButtons: { flexDirection: 'row', gap: 12 },
  modalBtn: { flex: 1, paddingVertical: 13, borderRadius: 10, alignItems: 'center' },
  modalBtnPrimary: { backgroundColor: COLORS.primary },
  modalBtnSecondary: { backgroundColor: '#F0F0F0' },
  modalBtnPrimaryText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  modalBtnSecondaryText: { color: '#555', fontWeight: '600', fontSize: 15 },
  btnDisabled: { opacity: 0.6 },
});