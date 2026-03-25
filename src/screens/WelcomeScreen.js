// src/screens/WelcomeScreen.js
import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Animated, StatusBar, Image } from 'react-native';
import { COLORS, SIZES } from '../constants/Colors';

export default function WelcomeScreen({ navigation }) {
  // Animación de opacidad para que aparezca suavemente
  const fadeAnim = new Animated.Value(0);

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000, // 1 segundo
      useNativeDriver: true,
    }).start();

    // Después de 2.5 segundos, navegamos a la pantalla de Login/Registro
    const timer = setTimeout(() => {
      // Usamos replace para que no se pueda volver a esta pantalla
      navigation.replace('AuthOptions'); 
    }, 2500);

    return () => clearTimeout(timer); // Limpiar timer si el componente se desmonta
  }, [fadeAnim, navigation]);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      
      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        {/* Usamos el componente Image para cargar tu logo.png */}
        <Image 
          source={require('../../assets/logo.png')} // Ruta a tu archivo
          style={styles.logoImage}
          resizeMode="contain" // Asegura que se vea completo sin estirarse
        />
        
        {/* Nombre de la App */}
        <Text style={styles.title}>FinanzApp</Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
  },
  logoImage: {
    width: 150, // Ajusta el tamaño que desees
    height: 150,
  },
  title: {
    fontSize: SIZES.title,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginTop: 20, // Espacio entre logo y texto
  },
});