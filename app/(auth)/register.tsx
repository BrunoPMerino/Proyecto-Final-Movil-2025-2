import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import Button from '../../components/Button';
import Header from '../../components/Header';
import Input from '../../components/Input';
import Link from '../../components/Link';
import { signUp } from '@/utils/auth';

export default function RegisterScreen() {
  const router = useRouter();
  const [firstName, setFirstName] = useState<string>('');
  const [lastName, setLastName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const handleRegister = async (): Promise<void> => {
    // Limpiar error previo
    setError('');

    // Validación básica
    if (!firstName.trim()) {
      setError('Por favor ingresa tu nombre');
      return;
    }

    if (!lastName.trim()) {
      setError('Por favor ingresa tu apellido');
      return;
    }

    if (!email.trim()) {
      setError('Por favor ingresa tu correo electrónico');
      return;
    }

    if (!password.trim()) {
      setError('Por favor ingresa tu contraseña');
      return;
    }

    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    setLoading(true);

    try {
      const { user, error: signUpError } = await signUp(email.trim(), password, {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
      });

      if (signUpError) {
        setError(signUpError.message);
        Alert.alert('Error', signUpError.message);
      } else if (user) {
        // Registro exitoso
        Alert.alert(
          'Cuenta creada',
          'Tu cuenta ha sido creada exitosamente. Por favor verifica tu correo electrónico antes de iniciar sesión.',
          [
            {
              text: 'OK',
              onPress: () => router.push('/(auth)/login'),
            },
          ]
        );
      }
    } catch (err: any) {
      const errorMessage = 'Error inesperado. Por favor intenta de nuevo.';
      setError(errorMessage);
      Alert.alert('Error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          <Header />
          
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Crear cuenta</Text>
            
            {error ? (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}
            
            <View style={styles.row}>
              <View style={styles.halfInput}>
                <Input
                  label="Nombre"
                  placeholder="Juan"
                  value={firstName}
                  onChangeText={(text) => {
                    setFirstName(text);
                    setError(''); // Limpiar error al escribir
                  }}
                  autoCapitalize="words"
                />
              </View>
              
              <View style={styles.halfInput}>
                <Input
                  label="Apellido"
                  placeholder="Pérez"
                  value={lastName}
                  onChangeText={(text) => {
                    setLastName(text);
                    setError(''); // Limpiar error al escribir
                  }}
                  autoCapitalize="words"
                />
              </View>
            </View>
            
            <Input
              label="Correo electrónico"
              placeholder="correo@ejemplo.com"
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                setError(''); // Limpiar error al escribir
              }}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            
            <Input
              label="Contraseña"
              placeholder="••••••••"
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                setError(''); // Limpiar error al escribir
              }}
              secureTextEntry
            />
            
            <Link 
              title="¿Ya tienes cuenta? Inicia sesión" 
              onPress={() => router.back()}
              align="center"
              size="small"
            />
            
            <Button
              title="Registrarte"
              onPress={handleRegister}
              loading={loading}
            />
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 40,
    paddingBottom: 40,
    justifyContent: 'center',
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  row: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 0,
  },
  halfInput: {
    flex: 1,
  },
  errorContainer: {
    backgroundColor: '#fee',
    borderColor: '#fcc',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  errorText: {
    color: '#c33',
    fontSize: 14,
    textAlign: 'center',
  },
});