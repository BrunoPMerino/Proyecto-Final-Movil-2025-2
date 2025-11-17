import * as SecureStore from 'expo-secure-store';

/**
 * Adaptador de storage para Supabase usando expo-secure-store
 * Implementa la interfaz que Supabase espera
 */
export const secureStorage = {
  getItem: async (key: string): Promise<string | null> => {
    try {
      return await SecureStore.getItemAsync(key);
    } catch (error) {
      console.error('Error al obtener item del secure storage:', error);
      return null;
    }
  },

  setItem: async (key: string, value: string): Promise<void> => {
    try {
      await SecureStore.setItemAsync(key, value);
    } catch (error) {
      console.error('Error al guardar item en secure storage:', error);
      throw error;
    }
  },

  removeItem: async (key: string): Promise<void> => {
    try {
      await SecureStore.deleteItemAsync(key);
    } catch (error) {
      console.error('Error al eliminar item del secure storage:', error);
    }
  },
};

