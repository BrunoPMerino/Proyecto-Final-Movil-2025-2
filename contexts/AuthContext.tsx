import { signOut as authSignOut, signIn } from "@/utils/auth";
import { supabase } from "@/utils/supabase";
import { clearAllTokens } from "@/utils/tokenStorage";
import type { User } from "@supabase/supabase-js";
import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ error: string | null }>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Verificar sesión al cargar
  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        console.log("[AuthContext] Inicializando autenticación...");

        // Esperar un poco para que Supabase restaure la sesión
        await new Promise((resolve) => setTimeout(resolve, 100));

        // Obtener la sesión actual (que fue restaurada por Supabase)
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();

        console.log("[AuthContext] Sesión obtenida:", {
          hasSession: !!session,
          user: session?.user?.email,
          error: error?.message,
        });

        if (mounted) {
          if (session) {
            console.log(
              "[AuthContext] Usuario autenticado:",
              session.user.email
            );
            setUser(session.user);
          } else {
            console.log("[AuthContext] No hay sesión, limpiando tokens");
            setUser(null);
            await clearAllTokens();
          }
          setIsLoading(false);
        }
      } catch (error) {
        console.error("[AuthContext] Error al inicializar:", error);
        if (mounted) {
          setUser(null);
          setIsLoading(false);
        }
      }
    };

    // Inicializar la autenticación
    initializeAuth();

    // Escuchar cambios en la autenticación
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log(
        "[AuthContext] onAuthStateChange - evento:",
        event,
        "sesión:",
        !!session
      );

      if (mounted) {
        if (session) {
          console.log(
            "[AuthContext] Sesión actualizada para:",
            session.user.email
          );
          setUser(session.user);
        } else {
          console.log("[AuthContext] Sesión eliminada");
          await clearAllTokens();
          setUser(null);
        }
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

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
        // Supabase ya ha guardado la sesión automáticamente
        setUser(loggedUser);
        return { error: null };
      }

      return { error: "Error desconocido al iniciar sesión" };
    } catch (error: any) {
      console.error("Error en login:", error);
      return { error: "Error inesperado al iniciar sesión" };
    }
  };

  const logout = async (): Promise<void> => {
    try {
      const { error } = await authSignOut();

      // Limpiar tokens incluso si hay error
      await clearAllTokens();
      setUser(null);

      if (error) {
        console.error("Error al cerrar sesión:", error);
      }
    } catch (error) {
      console.error("Error inesperado al cerrar sesión:", error);
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
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
