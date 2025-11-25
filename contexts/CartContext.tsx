import React, {
    createContext,
    ReactNode,
    useContext,
    useEffect,
    useState,
} from "react";
import {
    addItem as addItemStorage,
    Cart,
    CartItem,
    clearCart as clearCartStorage,
    getCart as getCartStorage,
    removeItem as removeItemStorage,
    updateQuantity as updateQuantityStorage,
} from "../utils/cartStorage";

/**
 * Definición del contexto del carrito de compras.
 * @interface CartContextType
 */
interface CartContextType {
  /** Estado actual del carrito (items y total) */
  cart: Cart;
  /** Agrega un item al carrito o actualiza su cantidad si ya existe */
  addItem: (item: CartItem) => Promise<void>;
  /** Elimina un item del carrito por su ID */
  removeItem: (productId: string) => Promise<void>;
  /** Actualiza la cantidad de un producto específico */
  updateQuantity: (productId: string, quantity: number) => Promise<void>;
  /** Elimina todos los items del carrito */
  clearCart: () => Promise<void>;
  /** Cantidad total de items en el carrito */
  itemCount: number;
  /** Estado de carga de las operaciones del carrito */
  loading: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

/**
 * Proveedor del contexto del carrito.
 * Gestiona el estado local del carrito y su persistencia en AsyncStorage.
 * 
 * @component
 * @param {ReactNode} children - Componentes hijos
 */
export const CartProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [cart, setCart] = useState<Cart>({ items: [], total: 0 });
  const [loading, setLoading] = useState(true);

  // Cargar carrito al montar el provider
  useEffect(() => {
    loadCart();
  }, []);

  /**
   * Carga el carrito desde AsyncStorage
   */
  const loadCart = async () => {
    try {
      setLoading(true);
      const savedCart = await getCartStorage();
      setCart(savedCart);
      console.log(
        "[CartContext] Carrito cargado:",
        savedCart.items.length,
        "items"
      );
    } catch (error) {
      console.error("[CartContext] Error al cargar carrito:", error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Agrega un item al carrito
   */
  const addItem = async (item: CartItem) => {
    try {
      const updatedCart = await addItemStorage(item);
      setCart(updatedCart);
      console.log("[CartContext] Item agregado:", item.name);
    } catch (error) {
      console.error("[CartContext] Error al agregar item:", error);
      throw error;
    }
  };

  /**
   * Remueve un item del carrito
   */
  const removeItem = async (productId: string) => {
    try {
      const updatedCart = await removeItemStorage(productId);
      setCart(updatedCart);
      console.log("[CartContext] Item removido:", productId);
    } catch (error) {
      console.error("[CartContext] Error al remover item:", error);
      throw error;
    }
  };

  /**
   * Actualiza la cantidad de un item
   */
  const updateQuantity = async (productId: string, quantity: number) => {
    try {
      const updatedCart = await updateQuantityStorage(productId, quantity);
      setCart(updatedCart);
      console.log("[CartContext] Cantidad actualizada:", productId);
    } catch (error) {
      console.error("[CartContext] Error al actualizar cantidad:", error);
      throw error;
    }
  };

  /**
   * Vacía el carrito
   */
  const clearCart = async () => {
    try {
      const emptyCart = await clearCartStorage();
      setCart(emptyCart);
      console.log("[CartContext] Carrito vaciado");
    } catch (error) {
      console.error("[CartContext] Error al limpiar carrito:", error);
      throw error;
    }
  };

  // Calcular cantidad total de items
  const itemCount = cart.items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cart,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        itemCount,
        loading,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = (): CartContextType => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};
