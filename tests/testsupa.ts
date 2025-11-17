import { createOrder } from "../api/ordersApi";
import { createProduct, getProducts } from "../api/productsApi";
import { supabase } from "../utils/supabase";

async function runTests() {
  console.log("========== 🧪 INICIANDO PRUEBAS ==========");

  // 1️⃣ Verificar autenticación actual
  const user = (await supabase.auth.getUser()).data.user;
  if (!user) {
    console.error("❌ No hay sesión, inicia sesión antes de usar tempTest.");
    return;
  }
  console.log("✔ Usuario autenticado:", user.email);

  // 2️⃣ Crear categoría si no existe
  console.log("➡ Creando categoría temporal...");
  const { data: cat, error: catError } = await supabase
    .from("categories")
    .insert({ name: "TestCategory" })
    .select()
    .single();

  const categoryId = cat?.id;
  if (categoryId) console.log("✔ Categoría creada:", categoryId);
  if (catError) console.log("⚠ Categoría ya existe o error:", catError.message);

  // 3️⃣ Crear sucursal si no existe
  console.log("➡ Creando branch temporal...");
  const { data: branch, error: branchError } = await supabase
    .from("branches")
    .insert({ name: "Sucursal Test", address: "Calle Falsa 123" })
    .select()
    .single();

  const branchId = branch?.id;
  if (branchId) console.log("✔ Sucursal creada:", branchId);
  if (branchError) console.log("⚠ Sucursal ya existe o error:", branchError.message);

  // 4️⃣ Crear producto para pruebas
  console.log("➡ Creando producto de prueba...");
  const product = await createProduct({
    name: "Hamburguesa Test",
    description: "Producto de prueba",
    price: 20000,
    stock: 5,
    category_id: categoryId,
    branch_id: branchId,
  });

  console.log("✔ Producto creado:", product);

  // 5️⃣ Obtener productos
  console.log("➡ Obteniendo productos...");
  const products = await getProducts(branchId);
  console.log("✔ Productos encontrados:", products.length);

  // 6️⃣ Crear una orden EXITOSA
  console.log("➡ Creando orden válida...");
  const order = await createOrder(branchId, [
    {
      productId: product.id,
      quantity: 2,
      price: product.price,
    },
  ]);

  console.log("✔ Orden creada:", order);

  // 7️⃣ Verificar stock actualizado
  console.log("➡ Verificando stock...");
  const { data: updated, error: updatedError } = await supabase
    .from("products")
    .select("stock")
    .eq("id", product.id)
    .single();

  if (updated) {
    console.log("✔ Stock actualizado:", updated.stock);
  } else if (updatedError) {
    console.log("⚠ Error al verificar stock:", updatedError.message);
  }

  // 8️⃣ Crear una orden con stock insuficiente (DEBE FALLAR)
  console.log("➡ Probando orden con stock insuficiente...");

  try {
    const failOrder = await createOrder(branchId, [
      {
        productId: product.id,
        quantity: 10, // mayor al stock actual
        price: product.price,
      },
    ]);
    console.error("❌ ERROR: Esto no debería haber pasado", failOrder);
  } catch (err: any) {
    console.log("✔ Error esperado por stock insuficiente:", err.message);
  }

  // 9️⃣ Leer órdenes del usuario
  console.log("➡ Obteniendo órdenes del usuario...");
  const orders = await supabase
    .from("orders")
    .select("*");

  console.log("✔ Órdenes visibles (según policies):", orders.data?.length);

  console.log("========== ✅ PRUEBAS COMPLETADAS ==========");
}

runTests();
export default runTests;
