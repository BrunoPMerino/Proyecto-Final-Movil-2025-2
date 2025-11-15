import { useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Logo from '../../components/Logo';

export default function SplashScreen() {
  const router = useRouter();

  useEffect(() => {
    // Simular carga inicial y navegar a login después de 2 segundos
    const timer = setTimeout(() => {
      router.replace('/(auth)/login');
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      <Logo size="large" color="white" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#001E60',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

