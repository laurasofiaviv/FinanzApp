import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS, SIZES } from '../constants/Colors';

export default function EmailSentScreen({ route, navigation }) {
  const { email } = route.params;

  return (
    <View style={styles.container}>
      <Text style={styles.icon}>✉️</Text>
      <Text style={styles.title}>Revisa tu correo</Text>
      <Text style={styles.subtitle}>
        Enviamos un enlace de verificación a:
      </Text>
      <Text style={styles.email}>{email}</Text>
      <Text style={styles.note}>
        Una vez que verifiques tu correo, podrás iniciar sesión. Revisa también tu carpeta de spam.
      </Text>

      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('AuthOptions')}
      >
        <Text style={styles.buttonText}>Ir a iniciar sesión</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.resendLink}>
        <Text style={styles.resendText}>¿No recibiste el correo? Reenviar</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background, paddingHorizontal: SIZES.padding, justifyContent: 'center', alignItems: 'center' },
  icon: { fontSize: 64, marginBottom: 20 },
  title: { fontSize: SIZES.title, fontWeight: 'bold', color: COLORS.textPrimary, textAlign: 'center', marginBottom: 12 },
  subtitle: { fontSize: 15, color: COLORS.textSecondary, textAlign: 'center' },
  email: { fontSize: 15, fontWeight: 'bold', color: COLORS.primary, marginVertical: 8, textAlign: 'center' },
  note: { fontSize: 13, color: COLORS.textSecondary, textAlign: 'center', lineHeight: 20, marginBottom: 40, paddingHorizontal: 10 },
  button: {
    backgroundColor: COLORS.primary, paddingVertical: 16, paddingHorizontal: 40,
    borderRadius: SIZES.borderRadius, alignItems: 'center', width: '100%',
    shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 6, elevation: 5,
  },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  resendLink: { marginTop: 16 },
  resendText: { color: COLORS.primary, fontSize: 13 },
});