import React, { useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AuthContext } from '../context/AuthContext';
import { COLORS, SIZES } from '../constants/Colors';

const MenuItem = ({ icon, label, onPress }) => (
  <TouchableOpacity style={styles.menuItem} onPress={onPress} activeOpacity={0.7}>
    <View style={styles.menuLeft}>
      <Ionicons name={icon} size={20} color={COLORS.textSecondary} />
      <Text style={styles.menuLabel}>{label}</Text>
    </View>
    <Ionicons name="chevron-forward" size={18} color={COLORS.textLight} />
  </TouchableOpacity>
);

export default function ProfileScreen({ navigation }) {
  const { usuario, logout } = useContext(AuthContext);

  const nombre = usuario?.nombre || 'Juan García';
  const email  = usuario?.email  || 'juan@gmail.com';
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

  const menuItems = [
    {
      icon: 'notifications-outline',
      label: 'Configurar notificaciones',
      onPress: () => Alert.alert('Próximamente', 'Esta función estará disponible pronto.'),
    },
    {
      icon: 'lock-closed-outline',
      label: 'Seguridad',
      onPress: () => Alert.alert('Próximamente', 'Esta función estará disponible pronto.'),
    },
    {
      icon: 'download-outline',
      label: 'Exportar datos (Excel)',
      onPress: () => Alert.alert('Próximamente', 'Esta función estará disponible pronto.'),
    },
    {
      icon: 'person-outline',
      label: 'Mi cuenta',
      onPress: () => Alert.alert('Próximamente', 'Esta función estará disponible pronto.'),
    },
  ];

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* Avatar */}
        <View style={styles.avatarCircle}>
          <Text style={styles.avatarText}>{initials}</Text>
        </View>

        {/* Nombre y email */}
        <Text style={styles.name}>{nombre}</Text>
        <Text style={styles.email}>{email}</Text>

        {/* Menú */}
        <View style={styles.menuCard}>
          {menuItems.map((item, index) => (
            <View key={item.label}>
              <MenuItem icon={item.icon} label={item.label} onPress={item.onPress} />
              {index < menuItems.length - 1 && <View style={styles.divider} />}
            </View>
          ))}
        </View>

        {/* Botón cerrar sesión */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout} activeOpacity={0.8}>
          <Text style={styles.logoutText}>Cerrar sesión</Text>
        </TouchableOpacity>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1A1A2E',         // fondo oscuro como en la imagen
  },
  scroll: {
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: 40,
    paddingHorizontal: SIZES.padding,
  },

  /* Avatar */
  avatarCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: COLORS.secondary,  // verde #2ECC71
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
  },
  avatarText: {
    color: '#fff',
    fontSize: 26,
    fontWeight: '700',
    letterSpacing: 1,
  },

  /* Nombre / email */
  name: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
  },
  email: {
    color: COLORS.textLight,
    fontSize: 13,
    marginBottom: 36,
  },

  /* Tarjeta de menú */
  menuCard: {
    width: '100%',
    backgroundColor: '#252540',         // superficie oscura
    borderRadius: SIZES.borderRadius,
    overflow: 'hidden',
    marginBottom: 32,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 18,
  },
  menuLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  menuLabel: {
    color: '#FFFFFF',
    fontSize: 15,
  },
  divider: {
    height: 0.5,
    backgroundColor: '#3A3A55',
    marginHorizontal: 18,
  },

  /* Botón cerrar sesión */
  logoutButton: {
    width: '100%',
    paddingVertical: 15,
    borderRadius: SIZES.borderRadius,
    borderWidth: 1,
    borderColor: '#3A3A55',
    backgroundColor: '#252540',
    alignItems: 'center',
  },
  logoutText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '500',
  },
});