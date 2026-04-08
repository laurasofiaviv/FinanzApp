// VERSION REDISEÑADA - COPIA Y PEGA COMPLETA

import React, { useState } from 'react';
import {
  View, Text, TextInput, StyleSheet, TouchableOpacity,
  ScrollView, StatusBar, Platform, Switch
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { COLORS } from '../constants/Colors';

export default function RegisterGastoScreen() {
  const [tipo, setTipo] = useState('gasto');
  const [monto, setMonto] = useState('');
  const [fecha, setFecha] = useState('08/04/2026');
  const [categoria, setCategoria] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [recurrente, setRecurrente] = useState(true);
  const [frecuencia, setFrecuencia] = useState('mensual');
  const [modo, setModo] = useState('auto');

  return (
    <View style={{ flex: 1, backgroundColor: '#F4F6F8' }}>
      <StatusBar barStyle="light-content" />

      {/* HEADER */}
      <View style={styles.header}>
        <Text style={styles.title}>Nuevo registro</Text>

        {/* TABS */}
        <View style={styles.tabs}>
          {['gasto', 'ingreso', 'deuda'].map((t) => (
            <TouchableOpacity
              key={t}
              style={[styles.tab, tipo === t && styles.tabActive]}
              onPress={() => setTipo(t)}
            >
              <Text style={[styles.tabText, tipo === t && styles.tabTextActive]}>
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>

        {/* CARD */}
        <View style={styles.card}>

          {/* MONTO */}
          <Text style={styles.label}>Monto</Text>
          <TextInput
            style={styles.input}
            placeholder="$ 0"
            value={monto}
            onChangeText={setMonto}
          />

          {/* FECHA */}
          <Text style={styles.label}>Fecha</Text>
          <View style={styles.inputRow}>
            <TextInput style={{ flex: 1 }} value={fecha} />
            <Feather name="calendar" size={18} />
          </View>

          {/* CATEGORIA */}
          <Text style={styles.label}>Categoría</Text>
          <View style={styles.inputRow}>
            <Text style={{ color: '#999' }}>
              {categoria || 'Selecciona categoría'}
            </Text>
            <Feather name="chevron-down" size={18} />
          </View>

          {/* DESCRIPCION */}
          <Text style={styles.label}>Descripción</Text>
          <TextInput
            style={[styles.input, { height: 80 }]}
            placeholder="Añade una descripción..."
            multiline
            value={descripcion}
            onChangeText={setDescripcion}
          />

          {/* RECURRENTE */}
          <View style={styles.rowBetween}>
            <Text style={{ fontWeight: '600' }}>Hacer Gasto Recurrente</Text>
            <Switch value={recurrente} onValueChange={setRecurrente} />
          </View>

          {recurrente && (
            <>
              {/* FRECUENCIA */}
              <View style={styles.row}>
                <TouchableOpacity
                  style={[styles.pill, frecuencia === 'quincenal' && styles.pillActive]}
                  onPress={() => setFrecuencia('quincenal')}
                >
                  <Text style={styles.pillText}>Cada quincena</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.pill, frecuencia === 'mensual' && styles.pillActive]}
                  onPress={() => setFrecuencia('mensual')}
                >
                  <Text style={styles.pillText}>Cada mes</Text>
                </TouchableOpacity>
              </View>

              {/* MODOS */}
              <View style={styles.row}>
                <TouchableOpacity
                  style={[styles.pill, modo === 'auto' && styles.pillActive]}
                  onPress={() => setModo('auto')}
                >
                  <Text style={styles.pillText}>Auto-aplicar</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.pill, modo === 'preguntar' && styles.pillActive]}
                  onPress={() => setModo('preguntar')}
                >
                  <Text style={styles.pillText}>Preguntar antes</Text>
                </TouchableOpacity>
              </View>

              {/* INFO */}
              <View style={styles.infoBox}>
                <Text style={{ fontSize: 12 }}>
                  Este gasto se aplicará automáticamente cada mes.
                </Text>
              </View>
            </>
          )}

          {/* BOTON */}
          <TouchableOpacity style={styles.button}>
            <Text style={styles.buttonText}>Registrar</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* FAB */}
      <View style={styles.fab}>
        <Feather name="plus" size={24} color="#fff" />
      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: COLORS.primary,
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
  },
  title: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 10,
  },

  tabs: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 30,
    padding: 4,
  },
  tab: {
    flex: 1,
    padding: 8,
    alignItems: 'center',
    borderRadius: 20,
  },
  tabActive: {
    backgroundColor: '#fff',
  },
  tabText: { color: '#fff' },
  tabTextActive: { color: COLORS.primary, fontWeight: '600' },

  card: {
    backgroundColor: '#fff',
    margin: 16,
    borderRadius: 20,
    padding: 16,
    marginTop: -20,
    elevation: 5,
  },

  label: {
    marginTop: 12,
    marginBottom: 6,
    fontWeight: '600'
  },

  input: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 10,
    padding: 12,
  },

  inputRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 10,
    padding: 12,
  },

  row: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 12,
  },

  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
    alignItems: 'center'
  },

  pill: {
    flex: 1,
    backgroundColor: '#EAF3F6',
    padding: 10,
    borderRadius: 20,
    alignItems: 'center'
  },
  pillActive: {
    backgroundColor: COLORS.primary
  },
  pillText: {
    color: '#333'
  },

  infoBox: {
    backgroundColor: '#EAF3F6',
    padding: 10,
    borderRadius: 10,
    marginTop: 12
  },

  button: {
    backgroundColor: COLORS.primary,
    padding: 16,
    borderRadius: 12,
    marginTop: 20,
    alignItems: 'center'
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold'
  },

  fab: {
    position: 'absolute',
    bottom: 20,
    alignSelf: 'center',
    backgroundColor: COLORS.primary,
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center'
  }
});
