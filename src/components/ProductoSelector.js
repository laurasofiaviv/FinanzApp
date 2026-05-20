// src/components/ProductoSelector.js

// Importación de React y componentes visuales
import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';

// Librería de iconos
import { Feather } from '@expo/vector-icons';
// Colores globales de la app
import { COLORS } from '../constants/Colors';

// Colores según franquicia de tarjeta
const FRANQ_COLOR = {
  visa: '#1A1F71',
  mastercard: '#EB001B',
  amex: '#007BC1',
};
// Iconos según tipo de producto financiero
const ICONOS = {
  credito: 'credit-card',
  debito: 'smartphone',
  efectivo: 'dollar-sign',
};

// Selector de productos para elegir medio de pago
export default function ProductoSelector({
  productos,      // Lista de productos disponibles
  seleccionada,   // Producto actualmente seleccionado
  onSelect        // Función al seleccionar producto
}) {

  if (!productos || productos.length === 0) return null;// Si no hay productos no renderiza nada

  return (
    <View style={styles.tarjetaCard}>
      <Text style={styles.tarjetaTitle}>¿Con qué pagaste?</Text>
      {/* Lista horizontal de productos */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 10 }}>
        {/* Opción de efectivo */}
        <TouchableOpacity
          style={[styles.tarjetaPill, !seleccionada && styles.tarjetaPillActive]}
          onPress={() => onSelect(null)}
        >
          <Feather name="dollar-sign" size={14} color={!seleccionada ? '#fff' : COLORS.textSecondary} />
          <Text style={[styles.tarjetaPillText, !seleccionada && { color: '#fff' }]}>Efectivo/Otro</Text>
        </TouchableOpacity>

        {/* Render dinámico de productos */}
        {productos.map((p) => {
          const activa = seleccionada?.id === p.id; // Verifica si el producto está activo
          const color = FRANQ_COLOR[p.franquicia] || COLORS.primary;
          return (
            <TouchableOpacity
              key={p.id}
              style={[
                styles.tarjetaPill,
                { borderColor: color },
                activa && { backgroundColor: color },
              ]}
              onPress={() => onSelect(p)}
            >
              <Feather
                name={ICONOS[p.tipo] || 'credit-card'}
                size={14}
                color={activa ? '#fff' : color}
              />
              <Text style={[styles.tarjetaPillText, activa && { color: '#fff' }]}>
                {p.nombre}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Mensaje informativo cuando hay producto seleccionado */}
      {seleccionada && (
        <View style={styles.tarjetaInfo}>
          <Feather name="info" size={12} color={COLORS.primary} />
          <Text style={styles.tarjetaInfoText}>
            Se registrará el gasto en {seleccionada.nombre}
          </Text>
        </View>
      )}
    </View>
  );
}

//---------------------------------
// Estilos del componente
//---------------------------------
const styles = StyleSheet.create({
  tarjetaCard: {
    marginTop: 20, backgroundColor: '#fff', borderRadius: 16,
    padding: 16, borderWidth: 1, borderColor: '#E5E7EB',
  },
  tarjetaTitle: { fontSize: 15, fontWeight: '600', color: COLORS.textPrimary },
  tarjetaPill: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 14, paddingVertical: 9, borderRadius: 20,
    borderWidth: 1.5, borderColor: COLORS.textLight,
    marginRight: 8, backgroundColor: '#FAFAFA',
  },
  tarjetaPillActive: { backgroundColor: COLORS.textSecondary, borderColor: COLORS.textSecondary },
  tarjetaPillText: { fontSize: 13, fontWeight: '600', color: COLORS.textSecondary },
  tarjetaInfo: {
    flexDirection: 'row', gap: 6, alignItems: 'center',
    marginTop: 10, backgroundColor: '#EAF3F6', borderRadius: 8, padding: 8,
  },
  tarjetaInfoText: { flex: 1, fontSize: 12, color: COLORS.textSecondary },
});


