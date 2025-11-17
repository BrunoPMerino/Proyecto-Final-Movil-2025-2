import { supabase } from "../utils/supabase";
import { uploadProductImage, getPublicUrl, deleteImage } from "./storageApi";

export const getProducts = async (branchId: string) => {
  const { data, error } = await supabase
    .from("products")
    .select(
      "id, name, description, price, stock, image_url, is_available, category_id, branch_id"
    )
    .eq("branch_id", branchId)
    .order("name", { ascending: true });

  if (error) throw error;
  return data;
};

export const getAllProducts = async () => {
  const { data, error } = await supabase
    .from("products")
    .select(
      "id, name, description, price, stock, image_url, is_available, category_id, branch_id"
    )
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

// ✔ Crear producto con imagen
export const createProductWithImage = async (
  product: any,
  localImageUri?: string
) => {
  let imagePath = null;

  if (localImageUri) {
    imagePath = await uploadProductImage(localImageUri);
  }

  const { data, error } = await supabase
    .from("products")
    .insert({
      ...product,
      image_url: imagePath,
    })
    .select()
    .single();

  if (error) throw error;

  return {
    ...data,
    image_url_public: imagePath ? getPublicUrl(imagePath) : null,
  };
};

// ✔ Actualizar producto con imagen
export const updateProductWithImage = async (
  id: string,
  product: any,
  localImageUri?: string,
  oldImagePath?: string
) => {
  let imagePath = oldImagePath;

  // Si hay nueva imagen, subirla y eliminar la antigua
  if (localImageUri) {
    imagePath = await uploadProductImage(localImageUri);
    if (oldImagePath) {
      await deleteImage(oldImagePath);
    }
  }

  const { data, error } = await supabase
    .from("products")
    .update({
      ...product,
      image_url: imagePath,
    })
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;

  return {
    ...data,
    image_url_public: imagePath ? getPublicUrl(imagePath) : null,
  };
};
