import { supabase } from "../utils/supabase";
import { deleteImage, getPublicUrl, uploadProductImage } from "./storageApi";

/**
 * Obtiene los productos disponibles para una sucursal específica.
 * Realiza un join con la tabla product_branches para obtener stock y disponibilidad.
 * 
 * @param {string} branchId - ID de la sucursal
 * @returns {Promise<any[]>} Lista de productos con stock y disponibilidad
 */
export const getProducts = async (branchId: string) => {
  const { data, error } = await supabase
    .from("products")
    .select(`
      id, 
      name, 
      description, 
      price, 
      image_url, 
      category_id,
      product_branches!inner(stock, is_available, branch_id)
    `)
    .eq("product_branches.branch_id", branchId)
    .order("name", { ascending: true });

  if (error) throw error;
  
  // Aplanar la estructura para mantener compatibilidad
  return data?.map((item: any) => ({
    ...item,
    stock: item.product_branches[0]?.stock ?? 0,
    is_available: item.product_branches[0]?.is_available ?? false,
    branch_id: item.product_branches[0]?.branch_id,
    product_branches: undefined
  }));
};

/**
 * Obtiene todos los productos de todas las sucursales.
 * Útil para el catálogo general.
 * 
 * @returns {Promise<any[]>} Lista aplanada de productos por sucursal
 */
export const getAllProducts = async () => {
  const { data, error } = await supabase
    .from("products")
    .select(`
      id, 
      name, 
      description, 
      price, 
      image_url, 
      category_id,
      product_branches(stock, is_available, branch_id)
    `)
    .order("name", { ascending: true });

  if (error) throw error;
  
  // Aplanar: crear un item por cada combinación producto-sucursal
  const flattened: any[] = [];
  data?.forEach((product: any) => {
    if (product.product_branches && product.product_branches.length > 0) {
      product.product_branches.forEach((pb: any) => {
        flattened.push({
          ...product,
          stock: pb.stock,
          is_available: pb.is_available,
          branch_id: pb.branch_id,
          product_branches: undefined
        });
      });
    } else {
      // Producto sin sucursales asignadas
      flattened.push({
        ...product,
        stock: 0,
        is_available: false,
        branch_id: null,
        product_branches: undefined
      });
    }
  });
  
  return flattened;
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
