import { supabase } from "../utils/supabase";

export const getProducts = async (branchId: string) => {
  const { data, error } = await supabase
    .from("products")
    .select("id, name, description, price, stock, image_url, is_available, category_id")
    .eq("branch_id", branchId)
    .order("name", { ascending: true });

  if (error) throw error;
  return data;
};

export const getCategories = async () => {
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .order("name");

  if (error) throw error;
  return data;
};

export const createProduct = async (product: any) => {
  const { data, error } = await supabase
    .from("products")
    .insert(product)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const updateProduct = async (id: string, fields: any) => {
  const { data, error } = await supabase
    .from("products")
    .update(fields)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
};

