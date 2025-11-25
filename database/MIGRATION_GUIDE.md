# Migración de Base de Datos: Relación Muchos-a-Muchos Products-Branches

## 📋 Resumen

Se ha migrado la estructura de base de datos de una relación **uno-a-muchos** (un producto pertenece a una sucursal) a una relación **muchos-a-muchos** (un producto puede estar disponible en múltiples sucursales con diferente stock en cada una).

## 🗂️ Cambios Realizados

### 1. SQL Migration Script

**Archivo:** [`database/migration_many_to_many.sql`](file:///c:/Users/SANTIAGO/OneDrive/Escritorio/movil/FinalMovil/ComidaSabanaApp/database/migration_many_to_many.sql)

Este script incluye:
- ✅ Eliminación de productos existentes (según confirmación del usuario)
- ✅ Creación de tabla `product_branches` (junction table)
- ✅ Índices para optimizar consultas
- ✅ Políticas RLS (Row Level Security)
- ✅ Eliminación de columnas obsoletas (`branch_id`, `stock`, `is_available`) de la tabla `products`

**⚠️ IMPORTANTE:** Debes ejecutar este script en tu Supabase Dashboard antes de usar la aplicación.

### 2. TypeScript Interfaces

**Archivo:** [`contexts/DataContext.tsx`](file:///c:/Users/SANTIAGO/OneDrive/Escritorio/movil/FinalMovil/ComidaSabanaApp/contexts/DataContext.tsx)

```typescript
interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url: string;
  image_url_public?: string | null;
  category_id: string;
  // Campos opcionales que vienen de product_branches
  stock?: number;
  is_available?: boolean;
  branch_id?: string;
}
```

Los campos `stock`, `is_available` y `branch_id` ahora son **opcionales** porque dependen del contexto de la sucursal.

### 3. API Queries

**Archivo:** [`api/productsApi.ts`](file:///c:/Users/SANTIAGO/OneDrive/Escritorio/movil/FinalMovil/ComidaSabanaApp/api/productsApi.ts)

#### `getProducts(branchId)` - Productos por sucursal
```typescript
// Usa JOIN con product_branches y filtra por branch_id
.select(`
  id, name, description, price, image_url, category_id,
  product_branches!inner(stock, is_available, branch_id)
`)
.eq("product_branches.branch_id", branchId)
```

#### `getAllProducts()` - Todos los productos
```typescript
// Retorna cada combinación producto-sucursal como un item separado
.select(`
  id, name, description, price, image_url, category_id,
  product_branches(stock, is_available, branch_id)
`)
```

La estructura anidada se **aplana automáticamente** para mantener compatibilidad con el código existente.

## 📊 Nueva Estructura de Tablas

### `products` (información general)
- `id`, `category_id`, `name`, `description`, `price`, `image_url`, `created_at`

### `branches` (sucursales)
- `id`, `name`, `address`, `latitude`, `longitude`, `descriptionbranch`, `created_at`

### `product_branches` (relación + stock)
- `id`, `product_id`, `branch_id`, `stock`, `is_available`, `created_at`
- **Constraint:** `UNIQUE(product_id, branch_id)` - evita duplicados

## 🚀 Próximos Pasos

1. **Ejecutar el script SQL** en Supabase Dashboard:
   - Ir a SQL Editor en Supabase
   - Copiar y pegar el contenido de `database/migration_many_to_many.sql`
   - Ejecutar el script

2. **Agregar productos a sucursales:**
   ```sql
   -- Ejemplo: Agregar un producto a una sucursal
   INSERT INTO product_branches (product_id, branch_id, stock, is_available)
   VALUES ('uuid-del-producto', 'uuid-de-la-sucursal', 10, true);
   ```

3. **Verificar que funciona:**
   - Recargar la app
   - Verificar que los productos se cargan correctamente
   - Probar cambio entre sucursales

## ⚠️ Notas Importantes

- El código mantiene **compatibilidad hacia atrás**: los componentes existentes seguirán funcionando sin cambios
- Si un producto no tiene sucursales asignadas, se mostrará con `stock: 0` e `is_available: false`
- Las funciones `createProduct` y `updateProduct` necesitarán actualizarse cuando quieras crear/editar productos (no implementado aún)
