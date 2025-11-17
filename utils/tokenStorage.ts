import * as SecureStore from 'expo-secure-store';

const TOKEN_KEY = 'supabase_session_token';
const REFRESH_TOKEN_KEY = 'supabase_refresh_token';

/**
 * Guarda el token de sesión de forma segura
 */
export const saveToken = async (token: string): Promise<void> => {
  try {
    await SecureStore.setItemAsync(TOKEN_KEY, token);
  } catch (error) {
    console.error('Error al guardar el token:', error);
    throw new Error('No se pudo guardar el token de sesión');
  }
};

/**
 * Guarda el refresh token de forma segura
 */
export const saveRefreshToken = async (refreshToken: string): Promise<void> => {
  try {
    await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, refreshToken);
  } catch (error) {
    console.error('Error al guardar el refresh token:', error);
    throw new Error('No se pudo guardar el refresh token');
  }
};

/**
 * Obtiene el token de sesión guardado
 */
export const getToken = async (): Promise<string | null> => {
  try {
    const token = await SecureStore.getItemAsync(TOKEN_KEY);
    return token;
  } catch (error) {
    console.error('Error al obtener el token:', error);
    return null;
  }
};

/**
 * Obtiene el refresh token guardado
 */
export const getRefreshToken = async (): Promise<string | null> => {
  try {
    const refreshToken = await SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
    return refreshToken;
  } catch (error) {
    console.error('Error al obtener el refresh token:', error);
    return null;
  }
};

/**
 * Elimina el token de sesión
 */
export const deleteToken = async (): Promise<void> => {
  try {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
  } catch (error) {
    console.error('Error al eliminar el token:', error);
  }
};

/**
 * Elimina el refresh token
 */
export const deleteRefreshToken = async (): Promise<void> => {
  try {
    await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
  } catch (error) {
    console.error('Error al eliminar el refresh token:', error);
  }
};

/**
 * Elimina todos los tokens guardados
 */
export const clearAllTokens = async (): Promise<void> => {
  try {
    await deleteToken();
    await deleteRefreshToken();
  } catch (error) {
    console.error('Error al limpiar los tokens:', error);
  }
};

