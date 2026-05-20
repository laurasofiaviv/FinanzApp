//src/components/ConfirmModal.js

// Importación de React y componentes base de React Native
import React from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet } from 'react-native';
// Iconos y colores globales de la aplicación
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/Colors';

// Modal reutilizable de confirmación para acciones importantes-> EditProduct, ProductScreen, ProfileScreen
export default function ConfirmModal({
  visible, // Controla si el modal se muestra o no
  icon = 'alert-circle-outline', // Icono principal del modal
  iconColor = COLORS.danger, // Color del icono
  iconBg = '#FFF0F0', // Fondo circular del icono
  title, // Título principal
  message, // Mensaje descriptivo
  confirmText = 'Confirmar', // Texto botón confirmar
  cancelText = 'Cancelar', // Texto botón cancelar
  confirmColor = COLORS.danger, // Color botón confirmar
  onConfirm, // Acción al confirmar
  onCancel, // Acción al cancelar
}) {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.card}>
          <View style={[styles.iconCircle, { backgroundColor: iconBg }]}>
            <Ionicons name={icon} size={32} color={iconColor} />
          </View>
          <Text style={styles.title}>{title}</Text>
          {message ? <Text style={styles.message}>{message}</Text> : null}

          {/* Botón de confirmación */}
          <TouchableOpacity
            style={[styles.btnConfirm, { backgroundColor: confirmColor }]}
            onPress={onConfirm}
          >
            <Text style={styles.btnConfirmText}>{confirmText}</Text>
          </TouchableOpacity>

          {/* Botón cancelar */}
          <TouchableOpacity style={styles.btnCancel} onPress={onCancel}>
            <Text style={styles.btnCancelText}>{cancelText}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}
//---------------------------------
// Estilos del componente
//---------------------------------
const styles = StyleSheet.create({
  overlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center', alignItems: 'center',
  },
  card: {
    backgroundColor: '#fff', borderRadius: 20,
    padding: 28, width: '82%', alignItems: 'center',
    shadowColor: '#000', shadowOpacity: 0.15,
    shadowRadius: 16, shadowOffset: { width: 0, height: 8 },
    elevation: 10,
  },
  iconCircle: {
    width: 64, height: 64, borderRadius: 32,
    justifyContent: 'center', alignItems: 'center', marginBottom: 16,
  },
  title: {
    fontSize: 18, fontWeight: '700', color: '#1A1A2E',
    textAlign: 'center', marginBottom: 8,
  },
  message: {
    fontSize: 14, color: '#666', textAlign: 'center',
    lineHeight: 20, marginBottom: 24,
  },
  btnConfirm: {
    width: '100%', paddingVertical: 14,
    borderRadius: 12, alignItems: 'center', marginBottom: 10,
  },
  btnConfirmText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  btnCancel: {
    width: '100%', paddingVertical: 14,
    borderRadius: 12, alignItems: 'center',
    backgroundColor: '#F5F5F5',
  },
  btnCancelText: { color: '#555', fontWeight: '600', fontSize: 15 },
});