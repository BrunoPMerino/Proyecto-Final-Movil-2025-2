import { supabase } from './supabase';

export interface AuthError {
  message: string;
  code?: string;
}

/**
 * Inicia sesión con email y contraseña
 */
/**
 * Inicia sesión con email y contraseña.
 * Realiza validaciones previas de formato y campos requeridos.
 * 
 * @param {string} email - Correo electrónico del usuario
 * @param {string} password - Contraseña
 * @returns {Promise<{ user: any; error: AuthError | null }>} Objeto con usuario o error
 */
export const signIn = async (
  email: string,
  password: string
): Promise<{ user: any; error: AuthError | null }> => {
  try {
    // Validación básica
    if (!email.trim()) {
      return {
        user: null,
        error: { message: 'El correo electrónico es requerido' },
      };
    }

    if (!password.trim()) {
      return {
        user: null,
        error: { message: 'La contraseña es requerida' },
      };
    }

    // Validación de formato de email básica
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return {
        user: null,
        error: { message: 'El formato del correo electrónico no es válido' },
      };
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    });

    if (error) {
      // Mapeo de errores comunes de Supabase a mensajes amigables
      let errorMessage = 'Error al iniciar sesión. Por favor intenta de nuevo.';
      
      if (error.message.includes('Invalid login credentials')) {
        errorMessage = 'Correo electrónico o contraseña incorrectos';
      } else if (error.message.includes('Email not confirmed')) {
        errorMessage = 'Por favor verifica tu correo electrónico antes de iniciar sesión';
      } else if (error.message.includes('Too many requests')) {
        errorMessage = 'Demasiados intentos. Por favor espera un momento';
      }

      return {
        user: null,
        error: { message: errorMessage, code: error.status?.toString() },
      };
    }

    return { user: data.user, error: null };
  } catch (error: any) {
    return {
      user: null,
      error: {
        message: 'Error inesperado. Por favor intenta de nuevo.',
        code: 'UNKNOWN',
      },
    };
  }
};

/**
 * Registra un nuevo usuario con email y contraseña
 */
/**
 * Registra un nuevo usuario con email y contraseña.
 * Incluye validaciones de seguridad para la contraseña.
 * 
 * @param {string} email - Correo electrónico
 * @param {string} password - Contraseña (mínimo 6 caracteres)
 * @param {Object} [metadata] - Datos adicionales del usuario (nombre, apellido)
 * @returns {Promise<{ user: any; error: AuthError | null }>} Resultado del registro
 */
export const signUp = async (
  email: string,
  password: string,
  metadata?: { firstName?: string; lastName?: string }
): Promise<{ user: any; error: AuthError | null }> => {
  try {
    // Validación básica
    if (!email.trim()) {
      return {
        user: null,
        error: { message: 'El correo electrónico es requerido' },
      };
    }

    if (!password.trim()) {
      return {
        user: null,
        error: { message: 'La contraseña es requerida' },
      };
    }

    // Validación de formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return {
        user: null,
        error: { message: 'El formato del correo electrónico no es válido' },
      };
    }

    // Validación de contraseña (mínimo 6 caracteres)
    if (password.length < 6) {
      return {
        user: null,
        error: { message: 'La contraseña debe tener al menos 6 caracteres' },
      };
    }

    const { data, error } = await supabase.auth.signUp({
      email: email.trim().toLowerCase(),
      password,
      options: {
        data: {
          first_name: metadata?.firstName || '',
          last_name: metadata?.lastName || '',
        },
      },
    });

    if (error) {
      // Mapeo de errores comunes de Supabase
      let errorMessage = 'Error al crear la cuenta. Por favor intenta de nuevo.';
      
      if (error.message.includes('User already registered')) {
        errorMessage = 'Este correo electrónico ya está registrado';
      } else if (error.message.includes('Password')) {
        errorMessage = 'La contraseña no cumple con los requisitos';
      } else if (error.message.includes('Email')) {
        errorMessage = 'El formato del correo electrónico no es válido';
      }

      return {
        user: null,
        error: { message: errorMessage, code: error.status?.toString() },
      };
    }

    return { user: data.user, error: null };
  } catch (error: any) {
    return {
      user: null,
      error: {
        message: 'Error inesperado. Por favor intenta de nuevo.',
        code: 'UNKNOWN',
      },
    };
  }
};

/**
 * Envía un correo para restablecer la contraseña
 */
/**
 * Envía un correo para restablecer la contraseña.
 * Maneja límites de tasa (rate limiting) y validación de email.
 * 
 * @param {string} email - Correo electrónico del usuario
 * @returns {Promise<{ success: boolean; error: AuthError | null }>} Resultado de la operación
 */
export const resetPassword = async (
  email: string
): Promise<{ success: boolean; error: AuthError | null }> => {
  try {
    // Validación básica
    if (!email.trim()) {
      return {
        success: false,
        error: { message: 'El correo electrónico es requerido' },
      };
    }

    // Validación de formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return {
        success: false,
        error: { message: 'El formato del correo electrónico no es válido' },
      };
    }

    const { error } = await supabase.auth.resetPasswordForEmail(
      email.trim().toLowerCase(),
      {
        redirectTo: 'comidasabanaapp://reset-password',
      }
    );

    if (error) {
      // Mapeo de errores comunes
      let errorMessage = 'Error al enviar el correo. Por favor intenta de nuevo.';
      
      if (error.message.includes('rate limit')) {
        errorMessage = 'Demasiados intentos. Por favor espera un momento';
      }

      return {
        success: false,
        error: { message: errorMessage, code: error.status?.toString() },
      };
    }

    // Siempre retornamos éxito por seguridad (no revelamos si el email existe)
    return { success: true, error: null };
  } catch (error: any) {
    return {
      success: false,
      error: {
        message: 'Error inesperado. Por favor intenta de nuevo.',
        code: 'UNKNOWN',
      },
    };
  }
};

/**
 * Cierra la sesión del usuario actual
 */
export const signOut = async (): Promise<{ error: AuthError | null }> => {
  try {
    const { error } = await supabase.auth.signOut();

    if (error) {
      return {
        error: { message: 'Error al cerrar sesión', code: error.status?.toString() },
      };
    }

    return { error: null };
  } catch (error: any) {
    return {
      error: {
        message: 'Error inesperado al cerrar sesión',
        code: 'UNKNOWN',
      },
    };
  }
};

/**
 * Obtiene el usuario actual de la sesión
 */
export const getCurrentUser = async (): Promise<any | null> => {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    return user;
  } catch (error) {
    return null;
  }
};

