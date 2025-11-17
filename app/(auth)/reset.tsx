import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import Button from '../../components/Button';
import Header from '../../components/Header';
import Input from '../../components/Input';
import Link from '../../components/Link';
import { resetPassword } from '@/utils/auth';

export default function ResetPasswordScreen() {
  const router = useRouter();
  const [email, setEmail] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [emailSent, setEmailSent] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const handleResetPassword = async (): Promise<void> => {
    // Limpiar error previo
    setError('');

    // Validación básica
    if (!email.trim()) {
      setError('Por favor ingresa tu correo electrónico');
      Alert.alert('Error', 'Por favor ingresa tu correo electrónico');
      return;
    }

    setLoading(true);

    try {
      const { success, error: resetError } = await resetPassword(email.trim());

      if (resetError) {
        setError(resetError.message);
        Alert.alert('Error', resetError.message);
      } else if (success) {
        // Siempre mostrar éxito por seguridad (no revelamos si el email existe)
        setEmailSent(true);
        Alert.alert(
          'Correo enviado',
          'Si el correo electrónico está registrado, recibirás un enlace para restablecer tu contraseña.'
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

  if (emailSent) {
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
              <Text style={styles.sectionTitle}>Correo enviado</Text>
              <Text style={styles.message}>
                Hemos enviado un correo electrónico a {email} con las instrucciones para restablecer tu contraseña.
              </Text>
              <Text style={styles.message}>
                Por favor revisa tu bandeja de entrada y sigue los pasos indicados.
              </Text>
              
              <Button
                title="Volver al inicio de sesión"
                onPress={() => router.push('/(auth)/login')}
              />
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    );
  }

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
            <Text style={styles.sectionTitle}>Recuperar contraseña</Text>
            <Text style={styles.description}>
              Ingresa tu correo electrónico y te enviaremos un enlace para restablecer tu contraseña.
            </Text>
            
            {error ? (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}
            
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
            
            <Button
              title="Enviar correo"
              onPress={handleResetPassword}
              loading={loading}
            />
            
            <Link 
              title="¿Recordaste tu contraseña? Inicia sesión" 
              onPress={() => router.push('/(auth)/login')}
              align="center"
              size="small"
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
    marginBottom: 12,
    textAlign: 'center',
  },
  description: {
    fontSize: 14,
    color: '#666',
    marginBottom: 24,
    textAlign: 'center',
    lineHeight: 20,
  },
  message: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
    textAlign: 'center',
    lineHeight: 20,
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

