// ProductsScreen.js
import React from 'react';
import {
    View, Text, StyleSheet, TouchableOpacity, ScrollView,
    TextInput, Modal, FlatList, StatusBar, Platform, Alert,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { COLORS, SIZES } from '../constants/Colors';
import { useProducts } from '../hooks/useProducts';

// ── COMPONENTE LOGO FRANQUICIA ────────────────────────────────────────────
function FranquiciaLogo({ id, size = 28, franquicias }) {
    const f = franquicias.find((x) => x.id === id);
    if (!f) return null;
    return (
        <View style={[styles.logoBox, { backgroundColor: f.bg, width: size + 16, height: size - 2 }]}>
            <Text style={[styles.logoText, { color: f.color, fontSize: size * 0.38 }]}>
                {f.label.toUpperCase()}
            </Text>
        </View>
    );
}

// ── COMPONENTE TARJETA PRODUCTO ───────────────────────────────────────────
function ProductoCard({ producto, onEliminar, tipoIcons, cupoLibre, franquicias }) {
    const icon = tipoIcons[producto.tipo] || tipoIcons.efectivo;
    const saldoUsado = producto.saldoUsado || 0;
    const cupoTotal  = producto.cupoTotal  || 0;
    const pct        = cupoTotal > 0 ? Math.min((saldoUsado / cupoTotal) * 100, 100) : 0;
    const barColor   = pct > 80 ? COLORS.danger : pct > 50 ? '#F39C12' : COLORS.secondary;

    return (
        <View style={styles.prodCard}>
            <View style={styles.prodHeader}>
                <View style={styles.prodLeft}>
                    <View style={[styles.prodIconBox, { borderColor: icon.color }]}>
                        <Feather name={icon.name} size={18} color={icon.color} />
                    </View>
                    <View>
                        <Text style={styles.prodNombre}>{producto.nombre || 'Sin nombre'}</Text>
                        {producto.banco ? <Text style={styles.prodBanco}>{producto.banco}</Text> : null}
                    </View>
                </View>
                <View style={styles.prodRight}>
                    {producto.franquicia
                        ? <FranquiciaLogo id={producto.franquicia} size={24} franquicias={franquicias} />
                        : null}
                    <TouchableOpacity
                        onPress={() =>
                            Alert.alert('Eliminar', `¿Eliminar "${producto.nombre}"?`, [
                                { text: 'Cancelar', style: 'cancel' },
                                { text: 'Eliminar', style: 'destructive', onPress: () => onEliminar(producto.id) },
                            ])
                        }
                        style={styles.deleteBtnIcon}
                    >
                        <Feather name="trash-2" size={14} color={COLORS.danger} />
                    </TouchableOpacity>
                </View>
            </View>

            {producto.tipo === 'credito' && (
                <View style={styles.creditInfo}>
                    <View style={styles.cupoRow}>
                        <Text style={styles.cupoLabel}>Saldo usado</Text>
                        <Text style={styles.cupoLabel}>Cupo total</Text>
                    </View>
                    <View style={styles.cupoRow}>
                        <Text style={[styles.cupoVal, { color: barColor }]}>
                            ${Number(saldoUsado).toLocaleString('es-CO')}
                        </Text>
                        <Text style={styles.cupoVal}>
                            ${Number(cupoTotal).toLocaleString('es-CO')}
                        </Text>
                    </View>
                    <View style={styles.barBg}>
                        <View style={[styles.barFill, { width: `${pct}%`, backgroundColor: barColor }]} />
                    </View>
                    <View style={styles.cupoRow}>
                        <Text style={styles.corteFecha}>Corte: día {producto.diaCorte}</Text>
                        <Text style={styles.corteFecha}>Pago: día {producto.diaPago}</Text>
                    </View>
                </View>
            )}

            {(producto.tipo === 'efectivo' || producto.tipo === 'debito') && (
                <View style={{ marginTop: 10 }}>
                    <Text style={{ fontSize: 12, color: COLORS.textLight }}>Saldo disponible</Text>
                    <Text style={{ fontSize: 16, fontWeight: 'bold', color: COLORS.primary }}>
                        ${Number(producto.saldoActual || 0).toLocaleString('es-CO')}
                    </Text>
                </View>
            )}
        </View>
    );
}

// ── PANTALLA ──────────────────────────────────────────────────────────────
export default function ProductsScreen({ navigation }) {
    const {
        productos, creditCards, otros,
        form, showForm, showBancos,
        setField, handleCupo, handleSaldo,
        handleGuardar, abrirForm, cerrarForm,
        setShowBancos, eliminarProducto, cupoLibre,
        FRANQUICIAS, BANCOS_CO, TIPO_ICONS,
    } = useProducts();

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" />

            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Feather name="arrow-left" size={22} color="#fff" />
                </TouchableOpacity>
                <View style={styles.headerText}>
                    <Text style={styles.headerTitle}>Productos</Text>
                    <Text style={styles.headerSubtitle}>Gestiona tus cuentas y tarjetas</Text>
                </View>
                <TouchableOpacity style={styles.profileCircle} onPress={abrirForm}>
                    <Feather name="plus" size={22} color={COLORS.primary} />
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                {creditCards.length > 0 && (
                    <>
                        <Text style={styles.seccion}>MIS CUENTAS</Text>
                        {creditCards.map((p) => (
                            <ProductoCard
                                key={p.id} producto={p}
                                onEliminar={eliminarProducto}
                                tipoIcons={TIPO_ICONS}
                                cupoLibre={cupoLibre}
                                franquicias={FRANQUICIAS}
                            />
                        ))}
                    </>
                )}

                {otros.length > 0 && (
                    <>
                        <Text style={styles.seccion}>OTROS MEDIOS</Text>
                        {otros.map((p) => (
                            <ProductoCard
                                key={p.id} producto={p}
                                onEliminar={eliminarProducto}
                                tipoIcons={TIPO_ICONS}
                                cupoLibre={cupoLibre}
                                franquicias={FRANQUICIAS}
                            />
                        ))}
                    </>
                )}

                {productos.length === 0 && (
                    <View style={styles.emptyBox}>
                        <Feather name="credit-card" size={40} color={COLORS.textLight} />
                        <Text style={styles.emptyTitle}>Sin productos registrados</Text>
                        <Text style={styles.emptySubtitle}>
                            Agrega tus tarjetas y cuentas para vincularlas a tus gastos.
                        </Text>
                        <TouchableOpacity style={styles.emptyBtn} onPress={abrirForm}>
                            <Text style={styles.emptyBtnText}>+ Añadir nueva tarjeta/cuenta</Text>
                        </TouchableOpacity>
                    </View>
                )}

                {productos.length > 0 && (
                    <TouchableOpacity style={styles.addBtnBottom} onPress={abrirForm}>
                        <Feather name="plus" size={16} color={COLORS.primary} />
                        <Text style={styles.addBtnBottomText}>+ Añadir nueva tarjeta/cuenta</Text>
                    </TouchableOpacity>
                )}
            </ScrollView>

            {/* ── MODAL FORMULARIO ── */}
            <Modal visible={showForm} animationType="slide" transparent>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalSheet}>
                        <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
                            <View style={styles.modalHeader}>
                                <Text style={styles.modalTitle}>Nuevo Producto</Text>
                                <TouchableOpacity onPress={cerrarForm}>
                                    <Feather name="x" size={22} color={COLORS.textSecondary} />
                                </TouchableOpacity>
                            </View>

                            <Text style={styles.label}>TIPO</Text>
                            <View style={styles.tipoRow}>
                                {[
                                    { id: 'debito',   label: 'Débito' },
                                    { id: 'credito',  label: 'Crédito' },
                                    { id: 'efectivo', label: 'Efectivo' },
                                ].map((t) => (
                                    <TouchableOpacity
                                        key={t.id}
                                        style={[styles.tipoPill, form.tipo === t.id && styles.tipoPillActive]}
                                        onPress={() => setField('tipo', t.id)}
                                    >
                                        <Text style={[styles.tipoPillText, form.tipo === t.id && styles.tipoPillTextActive]}>
                                            {t.label}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>

                            {form.tipo === 'credito' && (
                                <>
                                    <Text style={styles.label}>Franquicia</Text>
                                    <View style={styles.franqRow}>
                                        {FRANQUICIAS.map((f) => (
                                            <TouchableOpacity
                                                key={f.id}
                                                style={[
                                                    styles.franqBtn, { backgroundColor: f.bg },
                                                    form.franquicia === f.id && { borderWidth: 2, borderColor: f.color },
                                                ]}
                                                onPress={() => setField('franquicia', f.id)}
                                            >
                                                <Text style={[styles.franqText, { color: f.color }]}>
                                                    {f.label.toUpperCase()}
                                                </Text>
                                            </TouchableOpacity>
                                        ))}
                                    </View>
                                </>
                            )}

                            <Text style={styles.label}>Nombre personalizado</Text>
                            <TextInput
                                style={[styles.input, form.errors.nombre && styles.inputErr]}
                                placeholder="Ej: Visa Bancolombia"
                                placeholderTextColor={COLORS.textLight}
                                value={form.nombre}
                                onChangeText={(v) => setField('nombre', v)}
                            />
                            {form.errors.nombre
                                ? <Text style={styles.errText}>{form.errors.nombre}</Text>
                                : null}

                            <Text style={styles.label}>Banco (opcional)</Text>
                            <TouchableOpacity style={styles.input} onPress={() => setShowBancos(true)}>
                                <Text style={form.banco ? styles.inputVal : styles.inputPlaceholder}>
                                    {form.banco || 'Seleccionar banco'}
                                </Text>
                            </TouchableOpacity>

                            {(form.tipo === 'efectivo' || form.tipo === 'debito') && (
                                <>
                                    <Text style={styles.label}>Saldo actual</Text>
                                    <View style={styles.inputRow}>
                                        <Text style={styles.prefix}>$</Text>
                                        <TextInput
                                            style={styles.inputMonto}
                                            placeholder="100.000"
                                            placeholderTextColor={COLORS.textLight}
                                            keyboardType="number-pad"
                                            value={form.saldoDisplay}
                                            onChangeText={handleSaldo}
                                        />
                                    </View>
                                </>
                            )}

                            {form.tipo === 'credito' && (
                                <>
                                    <Text style={styles.label}>Cupo total</Text>
                                    <View style={[styles.inputRow, form.errors.cupoTotal && styles.inputErr]}>
                                        <Text style={styles.prefix}>$</Text>
                                        <TextInput
                                            style={styles.inputMonto}
                                            placeholder="1.000.000"
                                            placeholderTextColor={COLORS.textLight}
                                            keyboardType="number-pad"
                                            value={form.cupoDisplay}
                                            onChangeText={handleCupo}
                                        />
                                    </View>
                                    {form.errors.cupoTotal
                                        ? <Text style={styles.errText}>{form.errors.cupoTotal}</Text>
                                        : null}

                                    <View style={styles.twoCol}>
                                        <View style={{ flex: 1 }}>
                                            <Text style={styles.label}>Día de corte</Text>
                                            <TextInput
                                                style={[styles.input, form.errors.diaCorte && styles.inputErr]}
                                                placeholder="15"
                                                placeholderTextColor={COLORS.textLight}
                                                keyboardType="number-pad"
                                                maxLength={2}
                                                value={form.diaCorte}
                                                onChangeText={(v) => setField('diaCorte', v.replace(/[^0-9]/g, ''))}
                                            />
                                            {form.errors.diaCorte
                                                ? <Text style={styles.errText}>{form.errors.diaCorte}</Text>
                                                : null}
                                        </View>
                                        <View style={{ width: 12 }} />
                                        <View style={{ flex: 1 }}>
                                            <Text style={styles.label}>Día de pago</Text>
                                            <TextInput
                                                style={[styles.input, form.errors.diaPago && styles.inputErr]}
                                                placeholder="25"
                                                placeholderTextColor={COLORS.textLight}
                                                keyboardType="number-pad"
                                                maxLength={2}
                                                value={form.diaPago}
                                                onChangeText={(v) => setField('diaPago', v.replace(/[^0-9]/g, ''))}
                                            />
                                            {form.errors.diaPago
                                                ? <Text style={styles.errText}>{form.errors.diaPago}</Text>
                                                : null}
                                        </View>
                                    </View>
                                </>
                            )}

                            <TouchableOpacity style={styles.guardarBtn} onPress={handleGuardar}>
                                <Text style={styles.guardarText}>Guardar producto</Text>
                            </TouchableOpacity>
                        </ScrollView>
                    </View>
                </View>
            </Modal>

            {/* Modal bancos */}
            <Modal visible={showBancos} transparent animationType="slide">
                <TouchableOpacity
                    style={styles.bancoOverlay}
                    onPress={() => setShowBancos(false)}
                />
                <View style={styles.bancoSheet}>
                    <FlatList
                        data={BANCOS_CO}
                        keyExtractor={(i) => i}
                        renderItem={({ item }) => (
                            <TouchableOpacity
                                style={styles.bancoItem}
                                onPress={() => { setField('banco', item); setShowBancos(false); }}
                            >
                                <Text style={styles.bancoText}>{item}</Text>
                            </TouchableOpacity>
                        )}
                    />
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container:    { flex: 1, backgroundColor: COLORS.background },
    header: {
        backgroundColor: COLORS.primary,
        paddingTop: Platform.OS === 'ios' ? 60 : 40,
        paddingBottom: 30, paddingHorizontal: SIZES.padding,
        borderBottomLeftRadius: SIZES.headerRadius,
        borderBottomRightRadius: SIZES.headerRadius,
        flexDirection: 'row', alignItems: 'center',
    },
    backBtn: {
        width: 38, height: 38, borderRadius: 19,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center', alignItems: 'center', marginRight: 14,
    },
    headerText:     { flex: 1 },
    headerTitle:    { color: '#fff', fontSize: 22, fontWeight: 'bold' },
    headerSubtitle: { color: 'rgba(255,255,255,0.8)', fontSize: 13, marginTop: 2 },
    profileCircle: {
        width: 42, height: 42, borderRadius: 21,
        backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center',
    },
    content:    { padding: SIZES.padding, paddingBottom: 40 },
    seccion: {
        fontSize: 12, fontWeight: 'bold', color: COLORS.textLight,
        letterSpacing: 0.8, marginBottom: 10, marginTop: 4,
    },
    prodCard: {
        backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 12,
        elevation: 2, shadowColor: '#000', shadowOpacity: 0.05,
        shadowRadius: 6, shadowOffset: { width: 0, height: 2 },
    },
    prodHeader:  { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    prodLeft:    { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 },
    prodRight:   { flexDirection: 'row', alignItems: 'center', gap: 8 },
    prodIconBox: { width: 36, height: 36, borderRadius: 10, borderWidth: 1.5, justifyContent: 'center', alignItems: 'center' },
    prodNombre:  { fontSize: 15, fontWeight: '600', color: COLORS.textPrimary },
    prodBanco:   { fontSize: 12, color: COLORS.textLight, marginTop: 1 },
    deleteBtnIcon: { padding: 4 },
    creditInfo:  { marginTop: 14, borderTopWidth: 1, borderTopColor: '#F0F0F0', paddingTop: 12 },
    cupoRow:     { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
    cupoLabel:   { fontSize: 11, color: COLORS.textLight },
    cupoVal:     { fontSize: 14, fontWeight: '700', color: COLORS.textPrimary },
    barBg:       { height: 6, backgroundColor: '#F0F0F0', borderRadius: 3, marginVertical: 6 },
    barFill:     { height: 6, borderRadius: 3 },
    corteFecha:  { fontSize: 11, color: COLORS.textLight, marginTop: 4 },
    logoBox:     { borderRadius: 4, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 6 },
    logoText:    { fontWeight: 'bold', letterSpacing: 0.5 },
    emptyBox:    { alignItems: 'center', paddingVertical: 50, paddingHorizontal: 20 },
    emptyTitle:  { fontSize: 17, fontWeight: '600', color: COLORS.textPrimary, marginTop: 14, marginBottom: 8 },
    emptySubtitle: { fontSize: 14, color: COLORS.textSecondary, textAlign: 'center', lineHeight: 20 },
    emptyBtn:    { marginTop: 20, borderWidth: 1.5, borderColor: COLORS.primary, borderRadius: 12, paddingVertical: 12, paddingHorizontal: 20 },
    emptyBtnText:{ color: COLORS.primary, fontWeight: '600' },
    addBtnBottom:{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 14 },
    addBtnBottomText: { color: COLORS.primary, fontWeight: '600', fontSize: 14 },
    modalOverlay:{ flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end' },
    modalSheet:  { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, maxHeight: '92%' },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
    modalTitle:  { fontSize: 18, fontWeight: 'bold', color: COLORS.textPrimary },
    label:       { fontSize: 13, fontWeight: '600', color: COLORS.textSecondary, marginBottom: 8, marginTop: 16 },
    input:       { borderWidth: 1, borderColor: '#E0E0E0', borderRadius: 12, backgroundColor: '#FAFAFA', paddingHorizontal: 14, paddingVertical: 13, fontSize: 15, color: COLORS.textPrimary },
    inputVal:    { fontSize: 15, color: COLORS.textPrimary },
    inputPlaceholder: { fontSize: 15, color: COLORS.textLight },
    inputErr:    { borderColor: COLORS.danger },
    errText:     { fontSize: 12, color: COLORS.danger, marginTop: 4 },
    inputRow:    { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#E0E0E0', borderRadius: 12, backgroundColor: '#FAFAFA', minHeight: 50 },
    prefix:      { paddingLeft: 14, paddingRight: 4, fontSize: 16, color: COLORS.textSecondary },
    inputMonto:  { flex: 1, paddingVertical: 13, paddingRight: 14, fontSize: 15, color: COLORS.textPrimary },
    tipoRow:     { flexDirection: 'row', gap: 8 },
    tipoPill:    { flex: 1, paddingVertical: 10, borderRadius: 20, alignItems: 'center', borderWidth: 1.5, borderColor: '#E0E0E0' },
    tipoPillActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
    tipoPillText:   { fontSize: 14, color: COLORS.textSecondary, fontWeight: '600' },
    tipoPillTextActive: { color: '#fff' },
    franqRow:    { flexDirection: 'row', gap: 10 },
    franqBtn:    { flex: 1, paddingVertical: 10, borderRadius: 10, alignItems: 'center', borderWidth: 1.5, borderColor: 'transparent' },
    franqText:   { fontSize: 13, fontWeight: 'bold', letterSpacing: 0.5 },
    twoCol:      { flexDirection: 'row' },
    guardarBtn:  { backgroundColor: COLORS.primary, borderRadius: 14, paddingVertical: 16, alignItems: 'center', marginTop: 24, marginBottom: 8 },
    guardarText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
    bancoOverlay:{ flex: 1, backgroundColor: 'rgba(0,0,0,0.4)' },
    bancoSheet:  { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, maxHeight: '50%' },
    bancoItem:   { paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
    bancoText:   { fontSize: 16, color: COLORS.textPrimary },
});