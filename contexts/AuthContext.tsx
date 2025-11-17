import { signOut as authSignOut, signIn } from '@/utils/auth';
import { supabase } from '@/utils/supabase';
import { clearAllTokens, saveRefreshToken, saveToken } from '@/utils/tokenStorage';
import type { Session, User } from '@supabase/supabase-js';
import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ error: string | null }>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Verificar sesión al cargar
  useEffect(() => {
    loadSession();

    // Escuchar cambios en la autenticación
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session) {
        // Guardar tokens cuando hay una sesión
        await saveSessionTokens(session);
        setUser(session.user);
      } else {
        // Limpiar tokens cuando no hay sesión
        await clearAllTokens();
        setUser(null);
      }
      setIsLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  /**
   * Guarda los tokens de la sesión en SecureStore
   */
  const saveSessionTokens = async (session: Session): Promise<void> => {
    try {
      if (session.access_token) {
        await saveToken(session.access_token);
      }
      if (session.refresh_token) {
        await saveRefreshToken(session.refresh_token);
      }
    } catch (error) {
      console.error('Error al guardar tokens de sesión:', error);
    }
  };

  /**
   * Carga la sesión automáticamente al abrir la app
   * Valida si la sesión sigue viva
   */
  const loadSession = async (): Promise<void> => {
    try {
      setIsLoading(true);
      
      // Obtener la sesión actual de Supabase
      const { data: { session }, error } = await supabase.auth.getSession();

      if (error) {
        console.error('Error al obtener sesión:', error);
        setUser(null);
        await clearAllTokens();
        return;
      }

      if (session) {
        // Validar si la sesión sigue viva
        const isValid = await validateSession(session);
        
        if (isValid) {
          // Guardar tokens y establecer usuario
          await saveSessionTokens(session);
          setUser(session.user);
        } else {
          // Sesión expirada, intentar refrescar
          const refreshed = await refreshSession();
          if (!refreshed) {
            setUser(null);
            await clearAllTokens();
          }
        }
      } else {
        // No hay sesión guardada
        setUser(null);
        await clearAllTokens();
      }
    } catch (error) {
      console.error('Error al cargar sesión:', error);
      setUser(null);
      await clearAllTokens();
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Valida si la sesión sigue viva
   * Verifica si el token no ha expirado
   */
  const validateSession = async (session: Session): Promise<boolean> => {
    try {
      if (!session.expires_at) {
        return false;
      }

      // Verificar si el token ha expirado (con margen de 5 minutos)
      const expiresAt = session.expires_at * 1000; // Convertir a milisegundos
      const now = Date.now();
      const fiveMinutes = 5 * 60 * 1000; // 5 minutos en milisegundos

      // Si el token expira en menos de 5 minutos, considerarlo expirado
      if (expiresAt - now < fiveMinutes) {
        return false;
      }

      // Verificar que el usuario existe
      const { data: { user }, error } = await supabase.auth.getUser();
      
      if (error || !user) {
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error al validar sesión:', error);
      return false;
    }
  };

  /**
   * Intenta refrescar la sesión usando el refresh token
   */
  const refreshSession = async (): Promise<boolean> => {
    try {
      const { data: { session }, error } = await supabase.auth.refreshSession();

      if (error || !session) {
        return false;
      }

      // Guardar los nuevos tokens
      await saveSessionTokens(session);
      setUser(session.user);
      return true;
    } catch (error) {
      console.error('Error al refrescar sesión:', error);
      return false;
    }
  };

  const login = async (
    email: string,
    password: string
  ): Promise<{ error: string | null }> => {
    try {
      const { user: loggedUser, error } = await signIn(email, password);

      if (error) {
        return { error: error.message };
      }

      if (loggedUser) {
        // Obtener la sesión completa para guardar los tokens
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session) {
          // Guardar tokens en SecureStore
          await saveSessionTokens(session);
        }
        
        setUser(loggedUser);
        return { error: null };
      }

      return { error: 'Error desconocido al iniciar sesión' };
    } catch (error: any) {
      console.error('Error en login:', error);
      return { error: 'Error inesperado al iniciar sesión' };
    }
  };

  const logout = async (): Promise<void> => {
    try {
      const { error } = await authSignOut();
      
      // Limpiar tokens incluso si hay error
      await clearAllTokens();
      setUser(null);
      
      if (error) {
        console.error('Error al cerrar sesión:', error);
      }
    } catch (error) {
      console.error('Error inesperado al cerrar sesión:', error);
      // Asegurarse de limpiar todo
      await clearAllTokens();
      setUser(null);
    }
  };

  const isAuthenticated = user !== null;

  return (
    <AuthContext.Provider
      value={{ user, isAuthenticated, isLoading, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

