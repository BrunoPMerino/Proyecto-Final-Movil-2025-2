import AsyncStorage from "@react-native-async-storage/async-storage";

const CART_KEY = "@comida_sabana_cart";

export interface CartItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  imageUrl?: string;
  branchId: string;
}

export interface Cart {
  items: CartItem[];
  total: number;
}

/**
 * Obtiene el carrito actual
 */
export const getCart = async (): Promise<Cart> => {
  try {
    const cartJSON = await AsyncStorage.getItem(CART_KEY);
    if (!cartJSON) {
      return { items: [], total: 0 };
    }
    return JSON.parse(cartJSON);
  } catch (error) {
    console.error("[cartStorage] Error al obtener carrito:", error);
    return { items: [], total: 0 };
  }
};

/**
 * Calcula el total del carrito
 */
const calculateTotal = (items: CartItem[]): number => {
  return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
};

/**
 * Agrega un producto al carrito
 */
export const addItem = async (item: CartItem): Promise<Cart> => {
  try {
    const cart = await getCart();

    // Verificar si el producto ya existe
    const existingIndex = cart.items.findIndex(
      (cartItem) => cartItem.productId === item.productId
    );

    if (existingIndex > -1) {
      // Si existe, aumentar la cantidad
      cart.items[existingIndex].quantity += item.quantity;
    } else {
      // Si no existe, agregar nuevo
      cart.items.push(item);
    }

    // Recalcular total
    cart.total = calculateTotal(cart.items);

    // Guardar en AsyncStorage
    await AsyncStorage.setItem(CART_KEY, JSON.stringify(cart));

    console.log("[cartStorage] Producto agregado:", item.name);
    return cart;
  } catch (error) {
    console.error("[cartStorage] Error al agregar producto:", error);
    throw error;
  }
};

/**
 * Actualiza la cantidad de un producto
 */
export const updateQuantity = async (
  productId: string,
  quantity: number
): Promise<Cart> => {
  try {
    const cart = await getCart();

    if (quantity <= 0) {
      // Si la cantidad es 0 o menos, remover el producto
      return removeItem(productId);
    }

    const itemIndex = cart.items.findIndex(
      (item) => item.productId === productId
    );

    if (itemIndex > -1) {
      cart.items[itemIndex].quantity = quantity;
      cart.total = calculateTotal(cart.items);

      await AsyncStorage.setItem(CART_KEY, JSON.stringify(cart));
      console.log("[cartStorage] Cantidad actualizada para:", productId);
    }

    return cart;
  } catch (error) {
    console.error("[cartStorage] Error al actualizar cantidad:", error);
    throw error;
  }
};

/**
 * Remueve un producto del carrito
 */
export const removeItem = async (productId: string): Promise<Cart> => {
  try {
    const cart = await getCart();

    cart.items = cart.items.filter((item) => item.productId !== productId);
    cart.total = calculateTotal(cart.items);

    await AsyncStorage.setItem(CART_KEY, JSON.stringify(cart));
    console.log("[cartStorage] Producto removido:", productId);

    return cart;
  } catch (error) {
    console.error("[cartStorage] Error al remover producto:", error);
    throw error;
  }
};

/**
 * Vacía el carrito completamente
 */
export const clearCart = async (): Promise<Cart> => {
  try {
    const emptyCart: Cart = { items: [], total: 0 };
    await AsyncStorage.setItem(CART_KEY, JSON.stringify(emptyCart));
    console.log("[cartStorage] Carrito vaciado");
    return emptyCart;
  } catch (error) {
    console.error("[cartStorage] Error al limpiar carrito:", error);
    throw error;
  }
};

/**
 * Obtiene la cantidad total de items en el carrito
 */
export const getItemCount = async (): Promise<number> => {
  try {
    const cart = await getCart();
    return cart.items.reduce((sum, item) => sum + item.quantity, 0);
  } catch (error) {
    console.error("[cartStorage] Error al obtener cantidad de items:", error);
    return 0;
  }
};
