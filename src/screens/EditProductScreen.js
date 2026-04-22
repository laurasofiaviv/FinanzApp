// EditProductScreen.js
import React from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  ScrollView, TextInput, Alert, Platform, StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES } from '../constants/Colors';
import { useEditProduct } from '../hooks/useEditProduct';

function Field({ label, children, error }) {
  return (
      <View style={styles.fieldWrap}>
        <Text style={styles.fieldLabel}>{label}</Text>
        {children}
        {error ? <Text style={styles.errText}>{error}</Text> : null}
      </View>
  );
}

export default function EditProductScreen({ route, navigation }) {
  const { productoId } = route.params;

  const {
    original, tipoLabel, esCredito, esSaldo, saldoUsadoFmt,
    nombre, saldoDisp, cupoDisp, diaCorte, diaPago, errors,
    handleNombre, handleCupo, handleSaldo, handleDiaCorte, handleDiaPago,
    handleGuardar, handleEliminar,
  } = useEditProduct(productoId, navigation);

  if (!original) {
    Alert.alert('Error', 'Producto no encontrado.');
    navigation.goBack();
    return null;
  }

  return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" />

        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={22} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Editar producto</Text>
          <View style={{ width: 36 }} />
        </View>

        <ScrollView
            contentContainerStyle={styles.content}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
        >
          <View style={styles.tipoBadge}>
            <Ionicons
                name={
                  esCredito ? 'card-outline'
                      : original.tipo === 'efectivo' ? 'cash-outline'
                          : 'phone-portrait-outline'
                }
                size={14} color={COLORS.primary}
                style={{ marginRight: 6 }}
            />
            <Text style={styles.tipoBadgeText}>{tipoLabel}</Text>
          </View>

          <Field label="Nombre del producto" error={errors.nombre}>
            <TextInput
                style={[styles.input, errors.nombre && styles.inputErr]}
                value={nombre}
                onChangeText={handleNombre}
                placeholder="Ej: Nequi, Visa BBVA"
                placeholderTextColor={COLORS.textLight}
            />
          </Field>

          {esSaldo && (
              <Field label="Saldo actual">
                <View style={styles.inputRow}>
                  <Text style={styles.prefix}>$</Text>
                  <TextInput
                      style={styles.inputMonto}
                      value={saldoDisp}
                      onChangeText={handleSaldo}
                      placeholder="0"
                      placeholderTextColor={COLORS.textLight}
                      keyboardType="number-pad"
                  />
                </View>
              </Field>
          )}

          {esCredito && (
              <>
                <Field label="Cupo total" error={errors.cupo}>
                  <View style={[styles.inputRow, errors.cupo && styles.inputErr]}>
                    <Text style={styles.prefix}>$</Text>
                    <TextInput
                        style={styles.inputMonto}
                        value={cupoDisp}
                        onChangeText={handleCupo}
                        placeholder="0"
                        placeholderTextColor={COLORS.textLight}
                        keyboardType="number-pad"
                    />
                  </View>
                </Field>

                <View style={styles.twoCol}>
                  <View style={{ flex: 1 }}>
                    <Field label="Día de corte" error={errors.diaCorte}>
                      <TextInput
                          style={[styles.input, errors.diaCorte && styles.inputErr]}
                          value={diaCorte}
                          onChangeText={handleDiaCorte}
                          placeholder="15"
                          placeholderTextColor={COLORS.textLight}
                          keyboardType="number-pad"
                          maxLength={2}
                      />
                    </Field>
                  </View>
                  <View style={{ width: 12 }} />
                  <View style={{ flex: 1 }}>
                    <Field label="Día de pago" error={errors.diaPago}>
                      <TextInput
                          style={[styles.input, errors.diaPago && styles.inputErr]}
                          value={diaPago}
                          onChangeText={handleDiaPago}
                          placeholder="25"
                          placeholderTextColor={COLORS.textLight}
                          keyboardType="number-pad"
                          maxLength={2}
                      />
                    </Field>
                  </View>
                </View>

                <View style={styles.infoBox}>
                  <Ionicons name="information-circle-outline" size={16} color={COLORS.primary} />
                  <Text style={styles.infoText}>
                    El saldo ya usado (${saldoUsadoFmt}) se mantiene. Solo puedes
                    editar el cupo máximo y las fechas.
                  </Text>
                </View>
              </>
          )}

          <TouchableOpacity style={styles.saveBtn} onPress={handleGuardar}>
            <Text style={styles.saveBtnText}>Guardar cambios</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.deleteBtn} onPress={handleEliminar}>
            <Ionicons name="trash-outline" size={17} color="#A32D2D" style={{ marginRight: 8 }} />
            <Text style={styles.deleteBtnText}>Eliminar este producto</Text>
          </TouchableOpacity>

          <View style={{ height: 40 }} />
        </ScrollView>
      </View>
  );
}

const styles = StyleSheet.create({
  container:    { flex: 1, backgroundColor: COLORS.surface },
  header: {
    backgroundColor: COLORS.primary,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 20, paddingHorizontal: SIZES.padding,
    flexDirection: 'row', alignItems: 'center',
    borderBottomLeftRadius: SIZES.headerRadius,
    borderBottomRightRadius: SIZES.headerRadius,
  },
  backBtn:      { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center' },
  headerTitle:  { flex: 1, color: '#fff', fontSize: 18, fontWeight: '700', textAlign: 'center' },
  content:      { padding: SIZES.padding, paddingTop: 20, gap: 4 },
  tipoBadge:    { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', backgroundColor: '#E6F1FB', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6, marginBottom: 8 },
  tipoBadgeText:{ fontSize: 12, fontWeight: '600', color: COLORS.primary },
  fieldWrap:    { marginBottom: 12 },
  fieldLabel:   { fontSize: 12, fontWeight: '600', color: COLORS.textSecondary, marginBottom: 8, letterSpacing: 0.3 },
  input:        { borderWidth: 1, borderColor: '#E0E0E0', borderRadius: 12, backgroundColor: COLORS.background, paddingHorizontal: 14, paddingVertical: 13, fontSize: 15, color: COLORS.textPrimary },
  inputRow:     { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#E0E0E0', borderRadius: 12, backgroundColor: COLORS.background, minHeight: 50 },
  prefix:       { paddingLeft: 14, paddingRight: 4, fontSize: 16, color: COLORS.textSecondary },
  inputMonto:   { flex: 1, paddingVertical: 13, paddingRight: 14, fontSize: 15, color: COLORS.textPrimary },
  inputErr:     { borderColor: COLORS.danger },
  errText:      { fontSize: 11, color: COLORS.danger, marginTop: 4 },
  twoCol:       { flexDirection: 'row', marginBottom: 4 },
  infoBox:      { flexDirection: 'row', gap: 8, backgroundColor: '#EAF3F6', borderRadius: 10, padding: 12, marginTop: 4, marginBottom: 8, alignItems: 'flex-start' },
  infoText:     { flex: 1, fontSize: 12, color: COLORS.textSecondary, lineHeight: 17 },
  saveBtn:      { backgroundColor: COLORS.primary, borderRadius: SIZES.borderRadius, paddingVertical: 16, alignItems: 'center', marginTop: 12 },
  saveBtnText:  { color: '#fff', fontSize: 16, fontWeight: '700' },
  deleteBtn:    { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#FCEBEB', borderWidth: 1, borderColor: '#F7C1C1', borderRadius: SIZES.borderRadius, paddingVertical: 15, marginTop: 10 },
  deleteBtnText:{ color: '#A32D2D', fontSize: 15, fontWeight: '600' },
});