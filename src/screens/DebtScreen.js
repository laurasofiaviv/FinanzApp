// screens/DebtScreen.js
import React from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  StatusBar, Platform, Modal, TextInput, FlatList,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { COLORS, SIZES } from '../constants/Colors';
import { useDebt, TIPOS_CONFIG, TIPOS_LIST } from '../hooks/useDebt';

// ══════════════════════════════════════════════════════════════════════════
// COMPONENTES PUROS DE UI
// ══════════════════════════════════════════════════════════════════════════

// ── FormularioDinamico ────────────────────────────────────────────────────
function FormularioDinamico({ tipo, form, setField, tarjetas, errors, fmt, parsear }) {
  const config = TIPOS_CONFIG[tipo];
  if (!config) return null;
  const campos = config.campos;

  const handleMonto = (v) => {
    const n = parsear(v);
    setField('montoNum', n);
    setField('montoDisplay', n === '' ? '' : fmt(n));
  };

  return (
    <View>
      {/* SELECTOR DE TARJETA */}
      {campos.includes('tarjeta') && (
        <View style={{ marginTop: 16 }}>
          <Text style={styles.label}>Tarjeta vinculada</Text>
          {tarjetas.length === 0 ? (
            <View style={styles.alertBox}>
              <Feather name="alert-circle" size={14} color={COLORS.warning} />
              <Text style={styles.alertText}>No tienes tarjetas registradas en Productos</Text>
            </View>
          ) : (
            tarjetas.map((t) => {
              const cupoLibre = (t.cupoTotal || 0) - (t.saldoUsado || 0);
              const activa    = form.tarjetaId === t.id;
              return (
                <TouchableOpacity
                  key={t.id}
                  style={[styles.tarjetaItem, activa && styles.tarjetaItemActive]}
                  onPress={() => {
                    setField('tarjetaId',       t.id);
                    setField('tarjetaNombre',   t.nombre);
                    setField('cupoDisponible',  cupoLibre);
                  }}
                >
                  <View style={styles.tarjetaLeft}>
                    <Feather name="credit-card" size={18} color={activa ? '#fff' : COLORS.primary} />
                    <View>
                      <Text style={[styles.tarjetaName, activa && { color: '#fff' }]}>{t.nombre}</Text>
                      <Text style={[styles.tarjetaInfo, activa && { color: 'rgba(255,255,255,0.8)' }]}>
                        Cupo libre: ${fmt(cupoLibre)}
                      </Text>
                    </View>
                  </View>
                  {activa && <Feather name="check-circle" size={18} color="#fff" />}
                </TouchableOpacity>
              );
            })
          )}
          {form.tarjetaId && form.montoNum && form.cupoDisponible < form.montoNum && (
            <View style={[styles.alertBox, { borderColor: COLORS.danger, backgroundColor: '#FFF0F0' }]}>
              <Feather name="alert-triangle" size={14} color={COLORS.danger} />
              <Text style={[styles.alertText, { color: COLORS.danger }]}>
                El monto supera el cupo disponible (${fmt(form.cupoDisponible)})
              </Text>
            </View>
          )}
        </View>
      )}

      {/* TASA DE INTERÉS */}
      {campos.includes('interes') && (
        <View style={{ marginTop: 16 }}>
          <Text style={styles.label}>
            Tasa de interés mensual (%){tipo === 'Deuda personal' ? ' — opcional' : ''}
          </Text>
          <View style={styles.inputRow}>
            <TextInput
              style={styles.inputMonto}
              placeholder="2.5"
              placeholderTextColor={COLORS.textLight}
              keyboardType="decimal-pad"
              value={form.interes}
              onChangeText={(v) => setField('interes', v.replace(/[^0-9.]/g, ''))}
            />
            <Text style={styles.suffix}>%</Text>
          </View>
        </View>
      )}

      {/* PAGO MÍNIMO */}
      {campos.includes('pagoMinimo') && (
        <View style={{ marginTop: 16 }}>
          <Text style={styles.label}>Pago mínimo mensual</Text>
          <View style={styles.inputRow}>
            <Text style={styles.prefix}>$</Text>
            <TextInput
              style={styles.inputMonto}
              placeholder="50.000"
              placeholderTextColor={COLORS.textLight}
              keyboardType="number-pad"
              value={form.pagoMinimoDisplay || ''}
              onChangeText={(v) => {
                const n = parsear(v);
                setField('pagoMinimo',        n);
                setField('pagoMinimoDisplay', n === '' ? '' : fmt(n));
              }}
            />
          </View>
        </View>
      )}

      {/* NÚMERO DE CUOTAS */}
      {campos.includes('cuotas') && (
        <View style={{ marginTop: 16 }}>
          <Text style={styles.label}>Número de cuotas</Text>
          <View style={styles.inputRow}>
            <TextInput
              style={styles.inputMonto}
              placeholder="12"
              placeholderTextColor={COLORS.textLight}
              keyboardType="number-pad"
              value={form.cuotas}
              onChangeText={(v) => setField('cuotas', v.replace(/[^0-9]/g, ''))}
            />
            <Text style={styles.suffix}>meses</Text>
          </View>
        </View>
      )}

      {/* VALOR MENSUAL (arriendo) */}
      {campos.includes('valorMensual') && (
        <View style={{ marginTop: 16 }}>
          <Text style={styles.label}>Valor mensual</Text>
          <View style={styles.inputRow}>
            <Text style={styles.prefix}>$</Text>
            <TextInput
              style={styles.inputMonto}
              placeholder="800.000"
              placeholderTextColor={COLORS.textLight}
              keyboardType="number-pad"
              value={form.montoDisplay || ''}
              onChangeText={handleMonto}
            />
          </View>
        </View>
      )}

      {/* DÍA DE PAGO */}
      {campos.includes('diaPago') && (
        <View style={{ marginTop: 16 }}>
          <Text style={styles.label}>Día de pago (1-31)</Text>
          <View style={styles.inputRow}>
            <TextInput
              style={styles.inputMonto}
              placeholder="1"
              placeholderTextColor={COLORS.textLight}
              keyboardType="number-pad"
              maxLength={2}
              value={form.diaPago}
              onChangeText={(v) => setField('diaPago', v.replace(/[^0-9]/g, ''))}
            />
            <Text style={styles.suffix}>de cada mes</Text>
          </View>
        </View>
      )}

      {/* FECHA DE INICIO */}
      {campos.includes('fechaInicio') && (
        <View style={{ marginTop: 16 }}>
          <Text style={styles.label}>Fecha de inicio</Text>
          <View style={styles.inputRow}>
            <TextInput
              style={styles.inputMonto}
              placeholder="dd/mm/aaaa"
              placeholderTextColor={COLORS.textLight}
              value={form.fechaInicio}
              onChangeText={(v) => setField('fechaInicio', v)}
            />
          </View>
        </View>
      )}

      {/* FECHA DE VENCIMIENTO */}
      {campos.includes('fechaVencimiento') && (
        <View style={{ marginTop: 16 }}>
          <Text style={styles.label}>Fecha de vencimiento</Text>
          <View style={[styles.inputRow, errors?.vencimiento && styles.inputError]}>
            <TextInput
              style={styles.inputMonto}
              placeholder="dd/mm/aaaa"
              placeholderTextColor={COLORS.textLight}
              value={form.fechaVencimiento}
              onChangeText={(v) => setField('fechaVencimiento', v)}
            />
          </View>
        </View>
      )}
    </View>
  );
}

// ── DeudaCard ─────────────────────────────────────────────────────────────
function DeudaCard({ deuda, onAbonar, fmt }) {
  const config      = TIPOS_CONFIG[deuda.tipo] || TIPOS_CONFIG['Otro'];
  const montoPagado = deuda.montoPagado || 0;
  const restante    = deuda.monto - montoPagado;
  const progreso    = deuda.monto > 0 ? Math.min(montoPagado / deuda.monto, 1) : 0;

  const interes         = parseFloat(deuda.interes) || 0;
  const saldoConInteres = interes > 0 ? restante * (1 + interes / 100) : null;

  const hoy = new Date();
  let diffDays = 999;
  if (deuda.fechaVencimiento) {
    const [d, m, y] = deuda.fechaVencimiento.split('/');
    const fv = new Date(y, m - 1, d);
    diffDays = Math.ceil((fv - hoy) / (1000 * 60 * 60 * 24));
  }
  const urgencia =
    diffDays < 0 ? COLORS.danger : diffDays <= 5 ? '#E67E22' : COLORS.secondary;

  return (
    <View style={styles.deudaCard}>
      <View style={styles.deudaHeader}>
        <View style={[styles.deudaIconBox, { borderColor: config.color }]}>
          <Feather name={config.icon} size={18} color={config.color} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.deudaTipo}>{deuda.tipo}</Text>
          {deuda.descripcion ? (
            <Text style={styles.deudaDesc} numberOfLines={1}>{deuda.descripcion}</Text>
          ) : null}
          {deuda.tarjetaNombre ? (
            <Text style={styles.deudaTarjeta}>
              <Feather name="credit-card" size={10} color={COLORS.primary} /> {deuda.tarjetaNombre}
            </Text>
          ) : null}
        </View>
        <View style={{ alignItems: 'flex-end' }}>
          <Text style={styles.deudaMonto}>${fmt(Math.round(restante))}</Text>
          {saldoConInteres && (
            <Text style={styles.deudaInteres}>
              +{deuda.interes}% → ${fmt(Math.round(saldoConInteres))}
            </Text>
          )}
        </View>
      </View>

      <View style={styles.progressBg}>
        <View style={[styles.progressFill, { width: `${progreso * 100}%`, backgroundColor: config.color }]} />
      </View>

      <View style={styles.deudaFooter}>
        <View>
          {deuda.cuotas && parseInt(deuda.cuotas) > 1 ? (
            <Text style={styles.deudaMeta}>{deuda.cuotasPagadas || 0}/{deuda.cuotas} cuotas</Text>
          ) : (
            <Text style={styles.deudaMeta}>{Math.round(progreso * 100)}% pagado</Text>
          )}
          {deuda.fechaVencimiento && (
            <Text style={[styles.deudaFecha, { color: urgencia }]}>
              {diffDays < 0 ? 'Vencida' : diffDays === 0 ? 'Vence hoy' : `Vence en ${diffDays}d`}
            </Text>
          )}
          {deuda.diaPago ? (
            <Text style={styles.deudaMeta}>Día de pago: {deuda.diaPago}</Text>
          ) : null}
        </View>
        <TouchableOpacity
          style={[styles.abonarBtn, { backgroundColor: config.color }]}
          onPress={onAbonar}
        >
          <Text style={styles.abonarText}>Abonar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ══════════════════════════════════════════════════════════════════════════
// PANTALLA PRINCIPAL  —  solo renderiza, nada de lógica
// ══════════════════════════════════════════════════════════════════════════
export default function DebtScreen({ navigation }) {
  const {
    // datos
    deudasPendientes, deudasPagadas, totalPendiente,
    tarjetas, productos, deudaAbonar,
    // formulario
    tipoSeleccionado, form, errors, resumenFinanciero, setField,
    // modales
    showForm, showTipos, showModalAbonar,
    setShowForm, setShowTipos,
    // acciones
    seleccionarTipo, handleGuardar, resetForm,
    abrirModalAbonar, handleAbonar, cancelarAbonar,
    montoCuotaDeuda,
    // helpers
    fmt, isoADisplay, parsear,
  } = useDebt();

  return (
    <>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <StatusBar barStyle="light-content" />

        {/* ── HEADER ────────────────────────────────────────────────── */}
        <View style={styles.header}>
          <View style={styles.headerRow}>
            <View>
              <Text style={styles.welcome}>Gestión de deudas</Text>
              <Text style={styles.headerName}>Mis Deudas</Text>
            </View>
            <TouchableOpacity
              style={styles.addBtn}
              onPress={() => setShowForm(true)}
              activeOpacity={0.85}
            >
              <Feather name="plus" size={22} color={COLORS.primary} />
            </TouchableOpacity>
          </View>

          {deudasPendientes.length > 0 && (
            <View style={styles.headerResumen}>
              <Text style={styles.headerResumenLabel}>Total pendiente</Text>
              <Text style={styles.headerResumenMonto}>${fmt(Math.round(totalPendiente))}</Text>
              <Text style={styles.headerResumenSub}>
                {deudasPendientes.length} deuda(s) activa(s)
              </Text>
            </View>
          )}
        </View>

        {/* ── CONTENIDO ─────────────────────────────────────────────── */}
        <View style={styles.content}>

          {/* Acceso rápido a Productos */}
          <TouchableOpacity
            style={styles.prodBtn}
            onPress={() => navigation.navigate('Productos')}
          >
            <Feather name="credit-card" size={16} color={COLORS.primary} />
            <Text style={styles.prodBtnText}>Ver mis tarjetas y cuentas</Text>
            <Feather name="chevron-right" size={16} color={COLORS.textLight} />
          </TouchableOpacity>

          {/* Deudas pendientes */}
          {deudasPendientes.length === 0 ? (
            <View style={styles.emptyBox}>
              <Feather name="check-circle" size={44} color={COLORS.secondary} />
              <Text style={styles.emptyTitle}>¡Sin deudas pendientes!</Text>
              <Text style={styles.emptySub}>Toca + para registrar una nueva deuda</Text>
            </View>
          ) : (
            <>
              <Text style={styles.seccionTitle}>PENDIENTES</Text>
              {deudasPendientes.map((d) => (
                <DeudaCard
                  key={d.id}
                  deuda={d}
                  fmt={fmt}
                  onAbonar={() => abrirModalAbonar(d)}
                />
              ))}
            </>
          )}

          {/* Deudas pagadas */}
          {deudasPagadas.length > 0 && (
            <>
              <Text style={[styles.seccionTitle, { marginTop: 20 }]}>PAGADAS</Text>
              {deudasPagadas.map((d) => {
                const config = TIPOS_CONFIG[d.tipo] || TIPOS_CONFIG['Otro'];
                return (
                  <View key={d.id} style={[styles.deudaCard, { opacity: 0.55 }]}>
                    <View style={styles.deudaHeader}>
                      <View style={[styles.deudaIconBox, { borderColor: '#CCC' }]}>
                        <Feather name={config.icon} size={18} color="#CCC" />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.deudaTipo, { color: COLORS.textLight }]}>{d.tipo}</Text>
                        {d.descripcion ? (
                          <Text style={styles.deudaDesc}>{d.descripcion}</Text>
                        ) : null}
                      </View>
                      <Text style={[styles.deudaMonto, { color: COLORS.textLight }]}>
                        ${fmt(d.monto)}
                      </Text>
                    </View>
                  </View>
                );
              })}
            </>
          )}

          <View style={{ height: 40 }} />
        </View>
      </ScrollView>

      {/* ══════════════════════════════════════════════════════════════
          MODAL: FORMULARIO NUEVA DEUDA
      ══════════════════════════════════════════════════════════════ */}
      <Modal visible={showForm} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <ScrollView
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              {/* Header */}
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Nueva Deuda</Text>
                <TouchableOpacity onPress={() => { setShowForm(false); resetForm(); }}>
                  <Feather name="x" size={22} color={COLORS.textSecondary} />
                </TouchableOpacity>
              </View>

              {/* Selector de tipo */}
              <Text style={styles.label}>Tipo de deuda</Text>
              <TouchableOpacity
                style={[styles.inputRow, errors.tipo && styles.inputError]}
                onPress={() => setShowTipos(true)}
              >
                {tipoSeleccionado ? (
                  <View style={styles.tipoSelected}>
                    <Feather
                      name={TIPOS_CONFIG[tipoSeleccionado].icon}
                      size={16}
                      color={TIPOS_CONFIG[tipoSeleccionado].color}
                    />
                    <Text style={styles.tipoSelectedText}>{tipoSeleccionado}</Text>
                  </View>
                ) : (
                  <Text style={styles.dropdownPlaceholder}>Selecciona tipo de deuda</Text>
                )}
                <Feather
                  name="chevron-down"
                  size={18}
                  color={COLORS.textLight}
                  style={{ marginRight: 14 }}
                />
              </TouchableOpacity>
              {errors.tipo ? <Text style={styles.errorText}>{errors.tipo}</Text> : null}

              {/* Descripción */}
              <Text style={[styles.label, { marginTop: 16 }]}>Descripción</Text>
              <TextInput
                style={styles.inputText}
                placeholder="Ej: Cuota Bancolombia, deuda con Juan..."
                placeholderTextColor={COLORS.textLight}
                value={form.descripcion || ''}
                onChangeText={(v) => setField('descripcion', v)}
              />

              {/* Monto total (omitido para arriendo que usa valorMensual) */}
              {tipoSeleccionado && tipoSeleccionado !== 'Arriendo / hipoteca' && (
                <>
                  <Text style={[styles.label, { marginTop: 16 }]}>Monto total</Text>
                  <View style={[styles.inputRow, errors.monto && styles.inputError]}>
                    <Text style={styles.prefix}>$</Text>
                    <TextInput
                      style={styles.inputMonto}
                      placeholder="0"
                      placeholderTextColor={COLORS.textLight}
                      keyboardType="number-pad"
                      value={form.montoDisplay || ''}
                      onChangeText={(v) => {
                        const n = parsear(v);
                        setField('montoNum',     n);
                        setField('montoDisplay', n === '' ? '' : fmt(n));
                      }}
                    />
                  </View>
                  {errors.monto ? <Text style={styles.errorText}>{errors.monto}</Text> : null}
                </>
              )}

              {/* Formulario dinámico por tipo */}
              {tipoSeleccionado && (
                <FormularioDinamico
                  tipo={tipoSeleccionado}
                  form={form}
                  setField={setField}
                  tarjetas={tarjetas}
                  errors={errors}
                  fmt={fmt}
                  parsear={parsear}
                />
              )}

              {/* Resumen financiero */}
              {resumenFinanciero && (
                <View style={styles.resumenBox}>
                  <View style={styles.resumenRow}>
                    <Feather name="trending-up" size={16} color={COLORS.primary} />
                    <Text style={styles.resumenLabel}>{resumenFinanciero.label}</Text>
                    <Text style={styles.resumenValor}>{resumenFinanciero.valor}</Text>
                  </View>
                  {resumenFinanciero.extra && (
                    <Text style={styles.resumenExtra}>{resumenFinanciero.extra}</Text>
                  )}
                </View>
              )}

              <TouchableOpacity style={styles.guardarBtn} onPress={handleGuardar}>
                <Text style={styles.guardarText}>Guardar deuda</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* ── MODAL: SELECTOR DE TIPO ──────────────────────────────────── */}
      <Modal visible={showTipos} transparent animationType="slide">
        <TouchableOpacity
          style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.4)' }}
          onPress={() => setShowTipos(false)}
        />
        <View style={styles.tiposSheet}>
          <View style={styles.modalHandle} />
          <Text style={styles.modalTitle2}>Tipo de deuda</Text>
          <FlatList
            data={TIPOS_LIST}
            keyExtractor={(i) => i}
            renderItem={({ item }) => {
              const c = TIPOS_CONFIG[item];
              return (
                <TouchableOpacity
                  style={styles.tipoItem}
                  onPress={() => seleccionarTipo(item)}
                >
                  <View style={[styles.tipoIconBox, { backgroundColor: c.color + '20' }]}>
                    <Feather name={c.icon} size={18} color={c.color} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.tipoItemTitle}>{item}</Text>
                    <Text style={styles.tipoItemDesc}>{c.desc}</Text>
                  </View>
                  {tipoSeleccionado === item && (
                    <Feather name="check" size={18} color={COLORS.primary} />
                  )}
                </TouchableOpacity>
              );
            }}
          />
        </View>
      </Modal>

      {/* ── MODAL: ABONAR ────────────────────────────────────────────── */}
      <Modal visible={showModalAbonar} transparent animationType="slide">
        <TouchableOpacity
          style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.4)' }}
          onPress={cancelarAbonar}
        />
        <View style={styles.tiposSheet}>
          <View style={styles.modalHandle} />
          <Text style={styles.modalTitle2}>¿Con qué cuenta abonás?</Text>

          {productos.length === 0 ? (
            <View style={{ padding: 20, alignItems: 'center' }}>
              <Text style={{ color: COLORS.textLight }}>
                No tienes cuentas/productos registrados
              </Text>
              <TouchableOpacity
                onPress={() => { cancelarAbonar(); navigation.navigate('Productos'); }}
              >
                <Text style={{ color: COLORS.primary, marginTop: 10, fontWeight: '600' }}>
                  Agregar cuenta →
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            <FlatList
              data={productos}
              keyExtractor={(p) => p.id}
              renderItem={({ item: p }) => {
                const montoPago = montoCuotaDeuda(deudaAbonar);
                const sinSaldo  = (p.saldoActual || 0) < montoPago;
                return (
                  <TouchableOpacity
                    style={[styles.abonarItem, sinSaldo && { opacity: 0.45 }]}
                    disabled={sinSaldo}
                    onPress={() => handleAbonar(p.id)}
                  >
                    <Feather
                      name={
                        p.tipo === 'credito'
                          ? 'credit-card'
                          : p.tipo === 'debito'
                          ? 'smartphone'
                          : 'dollar-sign'
                      }
                      size={18}
                      color={COLORS.primary}
                    />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.abonarItemNombre}>{p.nombre}</Text>
                      <Text style={styles.abonarItemSaldo}>
                        Disponible: ${fmt(p.saldoActual || 0)}
                      </Text>
                      {sinSaldo && (
                        <Text style={{ fontSize: 11, color: COLORS.danger }}>
                          Saldo insuficiente
                        </Text>
                      )}
                    </View>
                    <Text style={styles.abonarItemMonto}>-${fmt(Math.round(montoPago))}</Text>
                  </TouchableOpacity>
                );
              }}
            />
          )}

          <TouchableOpacity
            onPress={cancelarAbonar}
            style={{ padding: 16, alignItems: 'center' }}
          >
            <Text style={{ color: COLORS.danger, fontWeight: '600' }}>Cancelar</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </>
  );
}

// ══════════════════════════════════════════════════════════════════════════
// ESTILOS
// ══════════════════════════════════════════════════════════════════════════
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },

  // Header
  header: {
    backgroundColor: COLORS.primary,
    paddingTop: Platform.OS === 'web' ? 40 : 70,
    paddingHorizontal: SIZES.padding,
    paddingBottom: 36,
    borderBottomLeftRadius: SIZES.headerRadius,
    borderBottomRightRadius: SIZES.headerRadius,
  },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  welcome:   { color: 'rgba(255,255,255,0.8)', fontSize: 13 },
  headerName:{ color: '#fff', fontSize: SIZES.title, fontWeight: 'bold' },
  addBtn: {
    width: 42, height: 42, borderRadius: 21,
    backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center',
  },
  headerResumen: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 14, padding: 14, marginTop: 16,
  },
  headerResumenLabel: { color: 'rgba(255,255,255,0.75)', fontSize: 12 },
  headerResumenMonto: { color: '#fff', fontSize: 28, fontWeight: 'bold', marginVertical: 2 },
  headerResumenSub:   { color: 'rgba(255,255,255,0.7)', fontSize: 12 },

  // Content
  content: {
    backgroundColor: COLORS.background,
    marginTop: -20,
    borderTopLeftRadius: SIZES.headerRadius,
    borderTopRightRadius: SIZES.headerRadius,
    paddingHorizontal: SIZES.padding,
    paddingTop: 28,
  },

  prodBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: COLORS.surface, borderRadius: 12,
    padding: 14, marginBottom: 20,
  },
  prodBtnText: { flex: 1, fontWeight: '600', color: COLORS.textPrimary, fontSize: 14 },

  seccionTitle: {
    fontSize: 12, fontWeight: '700', color: COLORS.textSecondary,
    letterSpacing: 0.6, marginBottom: 12,
  },
  emptyBox:  { alignItems: 'center', paddingVertical: 50, gap: 10 },
  emptyTitle:{ fontSize: 17, fontWeight: '600', color: COLORS.textPrimary },
  emptySub:  { fontSize: 14, color: COLORS.textLight },

  // Deuda card
  deudaCard: {
    backgroundColor: '#fff', borderRadius: 16, padding: 16,
    marginBottom: 12, borderWidth: 1, borderColor: '#F0F0F0',
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04, shadowRadius: 4, elevation: 2,
  },
  deudaHeader:  { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 10 },
  deudaIconBox: {
    width: 40, height: 40, borderRadius: 10,
    borderWidth: 1.5, justifyContent: 'center', alignItems: 'center',
  },
  deudaTipo:    { fontSize: 14, fontWeight: '600', color: COLORS.textPrimary },
  deudaDesc:    { fontSize: 12, color: COLORS.textSecondary, marginTop: 1 },
  deudaTarjeta: { fontSize: 11, color: COLORS.primary, marginTop: 2 },
  deudaMonto:   { fontSize: 16, fontWeight: 'bold', color: COLORS.textPrimary },
  deudaInteres: { fontSize: 11, color: COLORS.danger, marginTop: 2 },
  progressBg:   { height: 5, backgroundColor: '#F0F0F0', borderRadius: 3, marginBottom: 10 },
  progressFill: { height: 5, borderRadius: 3 },
  deudaFooter:  { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
  deudaMeta:    { fontSize: 12, color: COLORS.textLight },
  deudaFecha:   { fontSize: 12, fontWeight: '600', marginTop: 2 },
  abonarBtn:    { paddingVertical: 7, paddingHorizontal: 16, borderRadius: 10 },
  abonarText:   { color: '#fff', fontSize: 13, fontWeight: '600' },

  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end' },
  modalSheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24, borderTopRightRadius: 24,
    padding: 24, maxHeight: '92%',
  },
  modalHeader: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: 20,
  },
  modalTitle: { fontSize: 18, fontWeight: 'bold', color: COLORS.textPrimary },

  tiposSheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24, borderTopRightRadius: 24,
    paddingBottom: 30, maxHeight: '70%',
  },
  modalHandle: {
    width: 40, height: 4, borderRadius: 2, backgroundColor: '#E0E0E0',
    alignSelf: 'center', marginTop: 12, marginBottom: 8,
  },
  modalTitle2: {
    fontSize: 16, fontWeight: 'bold', color: COLORS.textPrimary,
    paddingHorizontal: 20, paddingVertical: 12,
    borderBottomWidth: 1, borderBottomColor: '#F0F0F0',
  },

  // Form
  label: { fontSize: 13, fontWeight: '600', color: COLORS.textSecondary, marginBottom: 8 },
  inputRow: {
    flexDirection: 'row', alignItems: 'center',
    borderWidth: 1, borderColor: '#E0E0E0',
    borderRadius: SIZES.borderRadius, backgroundColor: '#FAFAFA', minHeight: 50,
  },
  inputError:  { borderColor: COLORS.danger },
  prefix:      { paddingLeft: 14, paddingRight: 4, fontSize: 16, color: COLORS.textSecondary },
  suffix:      { paddingRight: 14, fontSize: 14, color: COLORS.textLight },
  inputMonto:  { flex: 1, paddingVertical: 13, paddingHorizontal: 8, fontSize: 15, color: COLORS.textPrimary },
  inputText: {
    borderWidth: 1, borderColor: '#E0E0E0', borderRadius: SIZES.borderRadius,
    backgroundColor: '#FAFAFA', paddingHorizontal: 14, paddingVertical: 13,
    fontSize: 15, color: COLORS.textPrimary,
  },
  errorText: { color: COLORS.danger, fontSize: 12, marginTop: 4 },

  dropdownPlaceholder: { flex: 1, paddingHorizontal: 14, fontSize: 15, color: COLORS.textLight },
  tipoSelected: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 14 },
  tipoSelectedText: { fontSize: 15, color: COLORS.textPrimary, fontWeight: '500' },

  // Tipos selector
  tipoItem: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    paddingVertical: 14, paddingHorizontal: 20,
    borderBottomWidth: 1, borderBottomColor: '#F8F8F8',
  },
  tipoIconBox: {
    width: 38, height: 38, borderRadius: 10,
    justifyContent: 'center', alignItems: 'center',
  },
  tipoItemTitle: { fontSize: 15, fontWeight: '600', color: COLORS.textPrimary },
  tipoItemDesc:  { fontSize: 12, color: COLORS.textLight, marginTop: 1 },

  // Tarjetas en form
  tarjetaItem: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    padding: 14, borderRadius: 12,
    borderWidth: 1.5, borderColor: '#E0E0E0',
    backgroundColor: '#FAFAFA', marginBottom: 8, gap: 12,
  },
  tarjetaItemActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  tarjetaLeft:  { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 },
  tarjetaName:  { fontSize: 14, fontWeight: '600', color: COLORS.textPrimary },
  tarjetaInfo:  { fontSize: 12, color: COLORS.textSecondary, marginTop: 1 },

  alertBox: {
    flexDirection: 'row', gap: 8, alignItems: 'center',
    backgroundColor: '#FFF8E1', borderRadius: 10,
    padding: 10, marginTop: 8,
    borderWidth: 1, borderColor: '#FFE082',
  },
  alertText: { flex: 1, fontSize: 12, color: '#7B6000' },

  // Resumen financiero
  resumenBox: {
    backgroundColor: '#EAF3F6', borderRadius: 12,
    padding: 14, marginTop: 16,
    borderLeftWidth: 3, borderLeftColor: COLORS.primary,
  },
  resumenRow:   { flexDirection: 'row', alignItems: 'center', gap: 8 },
  resumenLabel: { flex: 1, fontSize: 13, color: COLORS.textSecondary },
  resumenValor: { fontSize: 15, fontWeight: 'bold', color: COLORS.primary },
  resumenExtra: { fontSize: 12, color: COLORS.textSecondary, marginTop: 6 },

  // Botón guardar
  guardarBtn: {
    backgroundColor: COLORS.primary, borderRadius: 14,
    paddingVertical: 16, alignItems: 'center',
    marginTop: 24, marginBottom: 8,
  },
  guardarText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },

  // Abonar modal
  abonarItem: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    paddingVertical: 14, paddingHorizontal: 20,
    borderBottomWidth: 1, borderBottomColor: '#F0F0F0',
  },
  abonarItemNombre: { fontSize: 15, fontWeight: '600', color: COLORS.textPrimary },
  abonarItemSaldo:  { fontSize: 12, color: COLORS.textSecondary, marginTop: 1 },
  abonarItemMonto:  { fontSize: 14, fontWeight: 'bold', color: COLORS.danger },
});