import { useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import { Image, StyleSheet, View } from 'react-native';
import runTests from '../../tests/testsupa';

export default function SplashScreen() {
  const router = useRouter();
  runTests(); // temporal
  useEffect(() => {
    // Simular carga inicial y navegar a login después de 2 segundos
    const timer = setTimeout(() => {
      router.replace('/(auth)/login');
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      <Image 
        source={require('../../assets/images/logo/image 27.png')}
        style={styles.logo}
        resizeMode="contain"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#12326D',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: 450,
    height: 450,
  },
});

