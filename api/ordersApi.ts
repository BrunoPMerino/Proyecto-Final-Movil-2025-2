import { supabase } from "../utils/supabase";

export const createOrder = async (branchId: string, items: any[]) => {
  const user = (await supabase.auth.getUser()).data.user;

  // 1️⃣ crear el pedido
  const { data: order, error } = await supabase
    .from("orders")
    .insert({
      user_id: user?.id,
      branch_id: branchId,
      status: "pending",
    })
    .select()
    .single();

  if (error) throw error;

  // 2️⃣ crear items
  const orderItemsPayload = items.map((item) => ({
    order_id: order.id,
    product_id: item.productId,
    quantity: item.quantity,
    price: item.price,
  }));

  const { error: itemsError } = await supabase
    .from("order_items")
    .insert(orderItemsPayload);

  if (itemsError) throw itemsError;

  return order;
};

export const updateOrderStatus = async (orderId: string, status: string) => {
  const { data, error } = await supabase
    .from("orders")
    .update({ status })
    .eq("id", orderId)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const getOrdersByUser = async () => {
  const { data, error } = await supabase
    .from("orders")
    .select("id, status, total, created_at")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
};

