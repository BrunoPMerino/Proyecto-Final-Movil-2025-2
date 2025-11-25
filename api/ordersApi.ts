import { supabase } from "../utils/supabase";

export interface CartItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  imageUrl?: string;
  branchId: string;
}

export interface OrderItem {
  id: string;
  product_id: string;
  quantity: number;
  price: number; // <= price_at_order eliminado
  product?: {
    name: string;
    image_url: string;
    price: number;
  };
}

export interface Order {
  id: string;
  user_id: string;
  branch_id: string;
  total: number;
  status: "pending" | "cooking" | "ready" | "completed" | "cancelled";
  delivery_time?: string;
  created_at: string;
  updated_at: string;
  order_items?: OrderItem[];
}

/* ──────────────────────────────── */
/*         STOCK VALIDATION         */
/* ──────────────────────────────── */

const verifyStock = async (items: CartItem[]): Promise<boolean> => {
  console.log("[ordersApi] Verificando stock...");

  for (const item of items) {
    // Ahora el stock está en product_branches, no en products
    const { data: productBranch, error } = await supabase
      .from("product_branches")
      .select("stock")
      .eq("product_id", item.productId)
      .eq("branch_id", item.branchId)
      .single();

    if (error) {
      console.error(
        `[ordersApi] Error verificando stock de ${item.productId}:`,
        error
      );
      throw new Error(`No se puede verificar stock de ${item.name}`);
    }

    if (!productBranch || productBranch.stock < item.quantity) {
      console.warn(
        `[ordersApi] Stock insuficiente: ${item.name} (disponible: ${
          productBranch?.stock || 0
        }, solicitado: ${item.quantity})`
      );
      return false;
    }
  }

  console.log("[ordersApi] ✅ Stock verificado");
  return true;
};

const decrementStock = async (items: CartItem[]): Promise<void> => {
  console.log("[ordersApi] Descontando stock...");

  for (const item of items) {
    // Actualizar stock en product_branches
    const { data: current, error: fetchError } = await supabase
      .from("product_branches")
      .select("stock")
      .eq("product_id", item.productId)
      .eq("branch_id", item.branchId)
      .single();

    if (fetchError) {
      console.error(
        `[ordersApi] Error obteniendo stock de ${item.productId}:`,
        fetchError
      );
      throw new Error(`Error actualizando stock de ${item.name}`);
    }

    const newStock = (current?.stock || 0) - item.quantity;

    const { error: updateError } = await supabase
      .from("product_branches")
      .update({ stock: newStock })
      .eq("product_id", item.productId)
      .eq("branch_id", item.branchId);

    if (updateError) {
      console.error(
        `[ordersApi] Error descontando stock de ${item.productId}:`,
        updateError
      );
      throw new Error(`Error actualizando stock de ${item.name}`);
    }
  }

  console.log("[ordersApi] ✅ Stock actualizado");
};

/* ──────────────────────────────── */
/*           CREATE ORDER           */
/* ──────────────────────────────── */

export const createOrder = async (
  branchId: string,
  items: CartItem[],
  deliveryTime?: string
): Promise<Order> => {
  try {
    console.log("[ordersApi] Iniciando creación de pedido...");

    // 1️⃣ Verificar stock
    const stockOk = await verifyStock(items);
    if (!stockOk) throw new Error("Stock insuficiente");

    // 2️⃣ Obtener usuario
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();
    if (userError || !user) throw new Error("Usuario no autenticado");

    // 3️⃣ Calcular total
    const total = items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    // 4️⃣ Crear pedido
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        user_id: user.id,
        branch_id: branchId,
        total,
        status: "pending",
        delivery_time: deliveryTime
          ? new Date(deliveryTime).toISOString()
          : null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (orderError) throw orderError;

    // 5️⃣ Crear items (sin product_name ni price_at_order)
    const orderItemsPayload = items.map((item) => ({
      order_id: order.id,
      product_id: item.productId,
      quantity: item.quantity,
      price: item.price, // usa la columna real
      created_at: new Date().toISOString(),
    }));

    const { error: itemsError } = await supabase
      .from("order_items")
      .insert(orderItemsPayload);

    if (itemsError) throw itemsError;

    // 6️⃣ Descontar stock
    await decrementStock(items);

    console.log(`[ordersApi] ✅ Pedido creado: ${order.id}`);

    return {
      ...order,
      order_items: orderItemsPayload.map((item) => ({
        id: "",
        ...item,
      })),
    };
  } catch (error) {
    console.error("[ordersApi] Error creando pedido:", error);
    throw error;
  }
};

/* ──────────────────────────────── */
/*         GET USER ORDERS          */
/* ──────────────────────────────── */

export const getUserOrders = async (): Promise<Order[]> => {
  try {
    const { data, error } = await supabase
      .from("orders")
      .select(
        `
        id,
        user_id,
        branch_id,
        total,
        status,
        delivery_time,
        created_at,
        updated_at,
        order_items (
          id,
          product_id,
          quantity,
          price,
          product:products (
            name,
            image_url,
            price
          )
        )
      `
      )
      .order("created_at", { ascending: false });

    if (error) throw error;

    return data || [];
  } catch (error) {
    console.error("[ordersApi] Error obteniendo pedidos:", error);
    throw error;
  }
};

/* ──────────────────────────────── */
/*           GET ORDER BY ID        */
/* ──────────────────────────────── */

export const getOrderById = async (orderId: string): Promise<Order> => {
  try {
    const { data, error } = await supabase
      .from("orders")
      .select(
        `
        id,
        user_id,
        branch_id,
        total,
        status,
        delivery_time,
        created_at,
        updated_at,
        order_items (
          id,
          product_id,
          quantity,
          price,
          product:products (
            name,
            image_url,
            price
          )
        )
      `
      )
      .eq("id", orderId)
      .single();

    if (error) throw error;

    return data;
  } catch (error) {
    console.error("[ordersApi] Error obteniendo pedido:", error);
    throw error;
  }
};

/* ──────────────────────────────── */
/*         UPDATE ORDER STATUS      */
/* ──────────────────────────────── */

export const updateOrderStatus = async (
  orderId: string,
  status: "pending" | "cooking" | "ready" | "completed" | "cancelled"
): Promise<Order> => {
  try {
    const { data, error } = await supabase
      .from("orders")
      .update({
        status,
        updated_at: new Date().toISOString(),
      })
      .eq("id", orderId)
      .select()
      .single();

    if (error) throw error;

    return data;
  } catch (error) {
    console.error("[ordersApi] Error actualizando estado:", error);
    throw error;
  }
};

/* ──────────────────────────────── */
/*           CANCEL ORDER           */
/* ──────────────────────────────── */

export const cancelOrder = async (orderId: string): Promise<Order> => {
  try {
    const order = await getOrderById(orderId);

    if (order.status !== "pending" && order.status !== "cooking") {
      throw new Error(
        "Solo se pueden cancelar pedidos pendientes o en preparación"
      );
    }

    const updated = await updateOrderStatus(orderId, "cancelled");

    // Restaurar stock en product_branches
    if (order.order_items) {
      for (const item of order.order_items) {
        // Obtener stock actual
        const { data: current, error: fetchError } = await supabase
          .from("product_branches")
          .select("stock")
          .eq("product_id", item.product_id)
          .eq("branch_id", order.branch_id)
          .single();

        if (fetchError) {
          console.error(
            `[ordersApi] Error obteniendo stock para restaurar:`,
            fetchError
          );
          continue; // Continuar con el siguiente item
        }

        // Incrementar stock
        const newStock = (current?.stock || 0) + item.quantity;

        await supabase
          .from("product_branches")
          .update({ stock: newStock })
          .eq("product_id", item.product_id)
          .eq("branch_id", order.branch_id);
      }
    }

    return updated;
  } catch (error) {
    console.error("[ordersApi] Error cancelando pedido:", error);
    throw error;
  }
};
