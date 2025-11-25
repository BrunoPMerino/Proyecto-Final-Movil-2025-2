import React, {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useState,
} from "react";
import * as ordersApi from "../api/ordersApi";
import { CartItem } from "../utils/cartStorage";
import { supabase } from "../utils/supabase";

/**
 * Estructura de un pedido en el sistema.
 * @interface Order
 */
export interface Order {
  id: string;
  user_id: string;
  branch_id: string;
  total: number;
  /** Estado actual del pedido */
  status: "pending" | "cooking" | "ready" | "completed" | "cancelled";
  delivery_time?: string;
  created_at: string;
  updated_at: string;
  order_items?: any[];
}

/**
 * Contexto para la gestión de pedidos.
 * @interface OrderContextType
 */
interface OrderContextType {
  orders: Order[];
  currentOrder: Order | null;
  loading: boolean;
  error: string | null;
  /** Crea un nuevo pedido con los items del carrito */
  createOrder: (
    branchId: string,
    items: CartItem[],
    deliveryTime?: string
  ) => Promise<Order>;
  /** Obtiene el historial de pedidos del usuario */
  getUserOrders: () => Promise<void>;
  /** Obtiene los detalles de un pedido específico */
  getOrderById: (orderId: string) => Promise<Order>;
  /** Actualiza el estado de un pedido */
  updateOrderStatus: (
    orderId: string,
    status: Order["status"]
  ) => Promise<Order>;
  /** Cancela un pedido activo */
  cancelOrder: (orderId: string) => Promise<Order>;
  /** Suscribe a cambios en tiempo real de un pedido */
  subscribeToOrder: (orderId: string, callback: (order: Order) => void) => void;
  clearError: () => void;
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);

/**
 * Proveedor de pedidos.
 * Gestiona el ciclo de vida de los pedidos y la sincronización en tiempo real.
 * 
 * @component
 */
export const OrderProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [currentOrder, setCurrentOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ✅ Cargar pedidos del usuario
  const handleGetUserOrders = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await ordersApi.getUserOrders();
      setOrders(data);
      console.log("[OrderContext] Pedidos cargados:", data.length);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Error cargando pedidos";
      setError(message);
      console.error("[OrderContext] Error:", message);
    } finally {
      setLoading(false);
    }
  }, []);

  // ✅ Crear nuevo pedido
  const handleCreateOrder = useCallback(
    async (
      branchId: string,
      items: CartItem[],
      deliveryTime?: string
    ): Promise<Order> => {
      try {
        setLoading(true);
        setError(null);
        const newOrder = await ordersApi.createOrder(
          branchId,
          items,
          deliveryTime
        );
        setCurrentOrder(newOrder);
        setOrders((prev) => [newOrder, ...prev]);
        console.log("[OrderContext] Pedido creado:", newOrder.id);
        return newOrder;
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Error creando pedido";
        setError(message);
        console.error("[OrderContext] Error:", message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // ✅ Obtener pedido por ID
  const handleGetOrderById = useCallback(
    async (orderId: string): Promise<Order> => {
      try {
        setLoading(true);
        setError(null);
        const order = await ordersApi.getOrderById(orderId);
        setCurrentOrder(order);
        console.log("[OrderContext] Pedido obtenido:", orderId);
        return order;
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Error obteniendo pedido";
        setError(message);
        console.error("[OrderContext] Error:", message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // ✅ Actualizar estado de pedido
  const handleUpdateOrderStatus = useCallback(
    async (orderId: string, status: Order["status"]): Promise<Order> => {
      try {
        setLoading(true);
        setError(null);
        const updated = await ordersApi.updateOrderStatus(orderId, status);
        setOrders((prev) =>
          prev.map((o) => (o.id === orderId ? { ...o, status } : o))
        );
        if (currentOrder?.id === orderId) {
          setCurrentOrder({ ...currentOrder, status });
        }
        console.log("[OrderContext] Estado actualizado:", orderId, status);
        return updated;
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Error actualizando estado";
        setError(message);
        console.error("[OrderContext] Error:", message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [currentOrder]
  );

  // ✅ Cancelar pedido
  const handleCancelOrder = useCallback(
    async (orderId: string): Promise<Order> => {
      try {
        setLoading(true);
        setError(null);
        const cancelled = await ordersApi.cancelOrder(orderId);
        setOrders((prev) =>
          prev.map((o) =>
            o.id === orderId ? { ...o, status: "cancelled" } : o
          )
        );
        if (currentOrder?.id === orderId) {
          setCurrentOrder({ ...currentOrder, status: "cancelled" });
        }
        console.log("[OrderContext] Pedido cancelado:", orderId);
        return cancelled;
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Error cancelando pedido";
        setError(message);
        console.error("[OrderContext] Error:", message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [currentOrder]
  );

  // ✅ Suscribirse a cambios en tiempo real
  const handleSubscribeToOrder = useCallback(
    (orderId: string, callback: (order: Order) => void) => {
      console.log("[OrderContext] Suscribiendo a pedido:", orderId);

      const subscription = supabase
        .channel(`orders:${orderId}`)
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "orders",
            filter: `id=eq.${orderId}`,
          },
          (payload: any) => {
            console.log("[OrderContext] Cambio en pedido:", payload.new);
            callback(payload.new as Order);
          }
        )
        .subscribe();

      return () => {
        subscription.unsubscribe();
      };
    },
    []
  );

  // ✅ Limpiar error
  const handleClearError = useCallback(() => {
    setError(null);
  }, []);

  // ✅ Cargar pedidos al montar
  useEffect(() => {
    handleGetUserOrders();
  }, [handleGetUserOrders]);

  const value: OrderContextType = {
    orders,
    currentOrder,
    loading,
    error,
    createOrder: handleCreateOrder,
    getUserOrders: handleGetUserOrders,
    getOrderById: handleGetOrderById,
    updateOrderStatus: handleUpdateOrderStatus,
    cancelOrder: handleCancelOrder,
    subscribeToOrder: handleSubscribeToOrder,
    clearError: handleClearError,
  };

  return (
    <OrderContext.Provider value={value}>{children}</OrderContext.Provider>
  );
};

// ✅ Hook para usar OrderContext
export const useOrder = (): OrderContextType => {
  const context = useContext(OrderContext);
  if (!context) {
    throw new Error("useOrder debe ser usado dentro de OrderProvider");
  }
  return context;
};
