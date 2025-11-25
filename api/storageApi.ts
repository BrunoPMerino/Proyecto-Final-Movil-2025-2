import { supabase } from "../utils/supabase";

// 📌 Generar UUID v4 simple compatible con React Native
const generateUUID = () => {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

// 📌 1. SUBIR imagen
export const uploadProductImage = async (fileUri: string) => {
  try {
    // 1. Obtener blob (Expo → RN)
    const response = await fetch(fileUri);
    const blob = await response.blob();

    // 2. Nombre aleatorio para evitar colisiones
    const fileExt = fileUri.split(".").pop();
    const fileName = `${generateUUID()}.${fileExt}`;

    const filePath = `${fileName}`;

    // 3. Subir archivo
    const { error } = await supabase.storage
      .from("product-images")
      .upload(filePath, blob, {
        contentType: blob.type,
        upsert: false,
      });

    if (error) throw error;
    return filePath;
  } catch (err) {
    throw err;
  }
};

// 📌 2. Obtener URL pública firmada
export const getPublicUrl = (imagePath: string) => {
  if (!imagePath) {
    console.warn("[getPublicUrl] imagePath está vacío");
    return null;
  }

  try {
    const { data } = supabase.storage
      .from("product-images")
      .getPublicUrl(imagePath);

    console.log(
      "[getPublicUrl] URL generada:",
      data.publicUrl,
      "para:",
      imagePath
    );
    return data.publicUrl;
  } catch (error) {
    console.error("[getPublicUrl] Error al generar URL:", error);
    return null;
  }
};

// 📌 3. Obtener URL pública con transformaciones (resize, optimize)
export const getPublicUrlWithTransform = (
  imagePath: string,
  width?: number,
  height?: number
) => {
  const { data } = supabase.storage
    .from("product-images")
    .getPublicUrl(imagePath, {
      transform: {
        width: width || 300,
        height: height || 300,
        resize: "cover",
      },
    });

  return data.publicUrl;
};

// 📌 4. Eliminar imagen
export const deleteImage = async (imagePath: string) => {
  try {
    const { error } = await supabase.storage
      .from("product-images")
      .remove([imagePath]);

    if (error) throw error;
    return true;
  } catch (err) {
    throw err;
  }
};
