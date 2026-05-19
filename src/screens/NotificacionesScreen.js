import React from 'react';
import {
    View, Text, StyleSheet, ScrollView,
    TouchableOpacity, StatusBar, Platform,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { COLORS, SIZES } from '../constants/Colors';
import { useAlertas } from '../hooks/useAlertas';
import { useFinanz } from '../context/FinanzContext';

const TIPO_CONFIG = {
    urgente: { label: 'Urgente', color: '#E74C3C', bg: '#FFF0F0' },
    advertencia: { label: 'Advertencia', color: '#F39C12', bg: '#FFF8E1' },
    accion: { label: 'Acción', color: '#8E44AD', bg: '#F5EEF8' },
    recordatorio: { label: 'Recordatorio', color: '#2D6BE4', bg: '#EAF1FF' },
    info: { label: 'Info', color: '#27AE60', bg: '#F0FFF4' },
};

export default function NotificacionesScreen({ navigation }) {
    const { alertas, hayUrgentes } = useAlertas();
    const { agregarGasto } = useFinanz();

    const urgentes = alertas.filter(a => a.tipo === 'urgente');
    const advertencias = alertas.filter(a => a.tipo === 'advertencia');
    const acciones = alertas.filter(a => a.tipo === 'accion');
    const recordatorios = alertas.filter(a => a.tipo === 'recordatorio');
    const info = alertas.filter(a => a.tipo === 'info');

    const grupos = [
        { titulo: ' Urgentes', items: urgentes },
        { titulo: ' Advertencias', items: advertencias },
        { titulo: ' Acciones', items: acciones },
        { titulo: ' Recordatorios', items: recordatorios },
        { titulo: ' Información', items: info },
    ].filter(g => g.items.length > 0);

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Feather name="arrow-left" size={22} color="#fff" />
                </TouchableOpacity>
                <View style={{ flex: 1 }}>
                    <Text style={styles.headerTitle}>Notificaciones</Text>
                    <Text style={styles.headerSub}>
                        {alertas.length === 0
                            ? 'Todo al día'
                            : `${alertas.length} alerta${alertas.length > 1 ? 's' : ''} activa${alertas.length > 1 ? 's' : ''}`}
                    </Text>
                </View>
                {hayUrgentes && (
                    <View style={styles.urgenteBadge}>
                        <Feather name="alert-circle" size={14} color="#fff" />
                    </View>
                )}
            </View>

            <ScrollView
                style={styles.scroll}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {alertas.length === 0 ? (
                    <View style={styles.emptyBox}>
                        <View style={styles.emptyIcon}>
                            <Feather name="check-circle" size={48} color={COLORS.secondary} />
                        </View>
                        <Text style={styles.emptyTitle}>¡Todo al día!</Text>
                        <Text style={styles.emptySub}>
                            No tienes alertas ni recordatorios pendientes.{'\n'}
                            Aquí aparecerán cuando haya algo importante.
                        </Text>
                    </View>
                ) : (
                    grupos.map(grupo => (
                        <View key={grupo.titulo} style={styles.grupo}>
                            <Text style={styles.grupoTitle}>{grupo.titulo}</Text>
                            {grupo.items.map(alerta => (
                                <AlertaCard
                                    key={alerta.id}
                                    alerta={alerta}
                                    navigation={navigation}
                                    agregarGasto={agregarGasto}
                                />
                            ))}
                        </View>
                    ))
                )}

                <View style={{ height: 40 }} />
            </ScrollView>
        </View>
    );
}

// ── Componente de cada alerta ─────────────────────────────────────────────
function AlertaCard({ alerta, navigation, agregarGasto }) {
    const config = TIPO_CONFIG[alerta.tipo] || TIPO_CONFIG.info;

    return (
        <View style={[styles.card, { borderLeftColor: alerta.color }]}>
            {/* Icono + contenido */}
            <View style={styles.cardRow}>
                <View style={[styles.iconBox, { backgroundColor: alerta.color + '20' }]}>
                    <Feather name={alerta.icono} size={18} color={alerta.color} />
                </View>
                <View style={styles.cardContent}>
                    {/* Badge de tipo */}
                    <View style={[styles.badge, { backgroundColor: config.bg }]}>
                        <Text style={[styles.badgeText, { color: config.color }]}>
                            {config.label}
                        </Text>
                    </View>
                    <Text style={styles.cardTitulo}>{alerta.titulo}</Text>
                    <Text style={[styles.cardDesc, { color: alerta.color }]}>
                        {alerta.descripcion}
                    </Text>
                    {alerta.detalle ? (
                        <Text style={styles.cardDetalle}>{alerta.detalle}</Text>
                    ) : null}

                    {/* Botón navegar */}
                    {alerta.navegarA && (
                        <TouchableOpacity
                            style={[styles.accionBtn, { backgroundColor: alerta.color }]}
                            onPress={() =>
                                navigation.navigate('Tabs', {
                                    screen: alerta.navegarA,
                                })
                            }
                        >
                            <Feather name="credit-card" size={12} color="#fff" />
                            <Text style={styles.accionBtnText}>Pagar ahora</Text>
                            <Feather name="arrow-right" size={12} color="#fff" />
                        </TouchableOpacity>
                    )}

                    {/* Botones gasto recurrente */}
                    {alerta.accionRegistrar && (
                        <View style={styles.accionRow}>
                            <TouchableOpacity
                                style={[styles.accionBtn, { backgroundColor: '#8E44AD', flex: 1 }]}
                                onPress={async () => {
                                    const a = alerta.accionRegistrar;
                                    await agregarGasto({
                                        monto: a.monto,
                                        montoDisplay: a.montoDisplay?.replace('$', '') || String(a.monto),
                                        categoria: a.categoria,
                                        descripcion: a.descripcion || '',
                                        fecha: new Date().toLocaleDateString('es-CO'),
                                        productoId: a.productoId || null,
                                        recurrente: null,
                                    });
                                }}
                            >
                                <Feather name="check" size={12} color="#fff" />
                                <Text style={styles.accionBtnText}>Registrar</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.accionBtnOutline, { flex: 1 }]}
                            >
                                <Text style={[styles.accionBtnText, { color: '#8E44AD' }]}>
                                    Más tarde
                                </Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.background },

    header: {
        backgroundColor: COLORS.primary,
        paddingTop: Platform.OS === 'ios' ? 60 : 50,
        paddingBottom: 24,
        paddingHorizontal: SIZES.padding,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 14,
        borderBottomLeftRadius: SIZES.headerRadius,
        borderBottomRightRadius: SIZES.headerRadius,
    },
    backBtn: {
        width: 36, height: 36, borderRadius: 18,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center', alignItems: 'center',
    },
    headerTitle: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
    headerSub: { color: 'rgba(255,255,255,0.75)', fontSize: 12, marginTop: 2 },
    urgenteBadge: {
        width: 32, height: 32, borderRadius: 16,
        backgroundColor: '#E74C3C',
        justifyContent: 'center', alignItems: 'center',
    },

    scroll: { flex: 1 },
    scrollContent: { padding: SIZES.padding, paddingTop: 20 },

    emptyBox: { alignItems: 'center', paddingVertical: 60 },
    emptyIcon: {
        width: 90, height: 90, borderRadius: 45,
        backgroundColor: '#F0FFF4',
        justifyContent: 'center', alignItems: 'center', marginBottom: 16,
    },
    emptyTitle: { fontSize: 20, fontWeight: 'bold', color: COLORS.textPrimary, marginBottom: 8 },
    emptySub: { fontSize: 14, color: COLORS.textLight, textAlign: 'center', lineHeight: 20 },

    grupo: { marginBottom: 24 },
    grupoTitle: { fontSize: 13, fontWeight: '700', color: COLORS.textSecondary, marginBottom: 10, letterSpacing: 0.3 },

    card: {
        backgroundColor: '#fff',
        borderRadius: 14,
        marginBottom: 10,
        borderLeftWidth: 4,
        padding: 14,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    cardRow: { flexDirection: 'row', gap: 12 },
    iconBox: {
        width: 40, height: 40, borderRadius: 10,
        justifyContent: 'center', alignItems: 'center',
        flexShrink: 0,
    },
    cardContent: { flex: 1 },

    badge: {
        alignSelf: 'flex-start',
        paddingHorizontal: 8, paddingVertical: 2,
        borderRadius: 6, marginBottom: 6,
    },
    badgeText: { fontSize: 10, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },

    cardTitulo: { fontSize: 14, fontWeight: '700', color: COLORS.textPrimary, marginBottom: 3 },
    cardDesc: { fontSize: 12, fontWeight: '500', marginBottom: 3 },
    cardDetalle: { fontSize: 11, color: COLORS.textLight },

    accionRow: { flexDirection: 'row', gap: 8, marginTop: 10 },
    accionBtn: {
        flexDirection: 'row', alignItems: 'center', gap: 5,
        paddingHorizontal: 12, paddingVertical: 7,
        borderRadius: 8, marginTop: 10, alignSelf: 'flex-start',
    },
    accionBtnOutline: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5,
        paddingHorizontal: 12, paddingVertical: 7,
        borderRadius: 8, marginTop: 10,
        borderWidth: 1, borderColor: '#8E44AD',
    },
    accionBtnText: { color: '#fff', fontSize: 12, fontWeight: '700' },
});