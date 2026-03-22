import React, { useState, useContext } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { AuthContext } from '../context/AuthContext';
// IMPORTANTE:
import { COLORS, SIZES } from '../constants/Colors'; 

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useContext(AuthContext);

  const handleLogin = () => {
    if (email === 'admin@test.com' && password === '1234') {
      login({ email, nombre: 'Laura' }); 
    } else {
      Alert.alert('Error', 'Correo o contraseña incorrectos.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.logoTitle}>💰 FinanzApp</Text>

      <TextInput 
        style={styles.input} 
        placeholder="Correo electrónico" 
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
      />
      <TextInput 
        style={styles.input} 
        placeholder="Contraseña" 
        value={password}
        onChangeText={setPassword}
        secureTextEntry 
      />

      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Iniciar Sesión</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    padding: SIZES.padding,
  },
  logoTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 40,
    color: COLORS.primary,
  },
  input: {
    backgroundColor: COLORS.cardBackground,
    padding: 15,
    borderRadius: SIZES.borderRadius,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  button: {
    backgroundColor: COLORS.primary,
    padding: 18,
    borderRadius: SIZES.borderRadius,
    alignItems: 'center',
  },
  buttonText: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: 'bold',
  }
});