import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import Button from '../../components/Button';
import Header from '../../components/Header';
import Input from '../../components/Input';
import Link from '../../components/Link';

export default function ResetPasswordScreen() {
  const router = useRouter();
  const [email, setEmail] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [emailSent, setEmailSent] = useState<boolean>(false);

  const handleResetPassword = async (): Promise<void> => {
    if (!email.trim()) {
      Alert.alert('Error', 'Por favor ingresa tu correo electrónico');
      return;
    }

    setLoading(true);
    try {
      // Implementación con Supabase:
      // 1. Importa: import { createClient } from '@supabase/supabase-js'
      // 2. Crea el cliente: const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
      // 3. Envía el correo:
      //    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      //      redirectTo: 'comidasabanaapp://reset-password' // Deep link de tu app
      //    })
      //    if (error) throw error
      
      // Simulación de envío (remover cuando implementes Supabase)
      setTimeout(() => {
        setLoading(false);
        setEmailSent(true);
        Alert.alert(
          'Correo enviado',
          'Se ha enviado un correo electrónico con las instrucciones para restablecer tu contraseña.'
        );
      }, 1500);
    } catch (error) {
      setLoading(false);
      Alert.alert('Error', 'No se pudo enviar el correo. Por favor intenta de nuevo.');
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
            
            <Input
              label="Correo electrónico"
              placeholder="correo@ejemplo.com"
              value={email}
              onChangeText={setEmail}
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
});

