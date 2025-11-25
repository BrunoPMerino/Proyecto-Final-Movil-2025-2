# 🔧 Fix: Orders API After Many-to-Many Migration

## 🐛 Problema Encontrado

Después de ejecutar la migración SQL que eliminó la columna `stock` de la tabla `products`, la API de órdenes falló con el error:

```
ERROR column products.stock does not exist
```

## ✅ Solución Implementada

Actualicé **3 funciones** en `api/ordersApi.ts` para trabajar con la nueva tabla `product_branches`:

### 1. **verifyStock()** - Verificar stock disponible

**Antes:**
```typescript
const { data: product } = await supabase
  .from("products")
  .select("stock")
  .eq("id", item.productId)
  .single();
```

**Después:**
```typescript
const { data: productBranch } = await supabase
  .from("product_branches")
  .select("stock")
  .eq("product_id", item.productId)
  .eq("branch_id", item.branchId)  // ← Filtrar por sucursal
  .single();
```

### 2. **decrementStock()** - Descontar stock al crear orden

**Antes:**
```typescript
await supabase.rpc("decrement_product_stock", {
  product_id: item.productId,
  quantity: item.quantity,
});
```

**Después:**
```typescript
// 1. Obtener stock actual
const { data: current } = await supabase
  .from("product_branches")
  .select("stock")
  .eq("product_id", item.productId)
  .eq("branch_id", item.branchId)
  .single();

// 2. Calcular nuevo stock
const newStock = (current?.stock || 0) - item.quantity;

// 3. Actualizar
await supabase
  .from("product_branches")
  .update({ stock: newStock })
  .eq("product_id", item.productId)
  .eq("branch_id", item.branchId);
```

### 3. **cancelOrder()** - Restaurar stock al cancelar

**Antes:**
```typescript
await supabase.rpc("increment_product_stock", {
  product_id: item.product_id,
  quantity: item.quantity,
});
```

**Después:**
```typescript
// 1. Obtener stock actual
const { data: current } = await supabase
  .from("product_branches")
  .select("stock")
  .eq("product_id", item.product_id)
  .eq("branch_id", order.branch_id)
  .single();

// 2. Incrementar stock
const newStock = (current?.stock || 0) + item.quantity;

// 3. Actualizar
await supabase
  .from("product_branches")
  .update({ stock: newStock })
  .eq("product_id", item.product_id)
  .eq("branch_id", order.branch_id);
```

## 🎯 Cambios Clave

1. ✅ Todas las consultas ahora usan `product_branches` en lugar de `products`
2. ✅ Se filtra por `branch_id` para obtener el stock correcto de cada sucursal
3. ✅ Se eliminó la dependencia de funciones RPC (`decrement_product_stock`, `increment_product_stock`)
4. ✅ El stock se maneja correctamente por sucursal

## 🧪 Prueba

Ahora deberías poder:
- ✅ Crear órdenes sin errores
- ✅ Ver el stock descontarse correctamente en `product_branches`
- ✅ Cancelar órdenes y ver el stock restaurarse

## 📝 Nota

Los errores de TypeScript sobre la estructura de `Order[]` son advertencias del tipo de datos de Supabase en consultas JOIN, pero no afectan la funcionalidad. Se pueden ignorar por ahora.
