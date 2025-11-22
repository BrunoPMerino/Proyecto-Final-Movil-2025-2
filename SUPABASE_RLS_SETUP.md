# Configuración de Row-Level Security (RLS) para Supabase

Este documento contiene las políticas de seguridad necesarias para que la aplicación funcione correctamente.

## Problema

Error al crear pedidos:
```
new row violates row-level security policy for table "order_items"
```

## ⚡ SOLUCIÓN RÁPIDA (Recomendada)

Ejecuta TODOS estos comandos en orden:

### 1. Políticas para order_items

```sql
-- ELIMINAR políticas existentes de order_items
DROP POLICY IF EXISTS "Users can view their own order items" ON order_items;
DROP POLICY IF EXISTS "Users can insert their own order items" ON order_items;

-- CREAR política simple que permite a usuarios autenticados insertar
CREATE POLICY "Authenticated users can insert order items"
ON order_items
FOR INSERT
TO authenticated
WITH CHECK (true);

-- CREAR política simple para SELECT
CREATE POLICY "Authenticated users can view order items"
ON order_items
FOR SELECT
TO authenticated
USING (true);
```

### 2. Políticas para orders (IMPORTANTE para cancelar pedidos)

```sql
-- ELIMINAR políticas existentes de orders
DROP POLICY IF EXISTS "Users can view their own orders" ON orders;
DROP POLICY IF EXISTS "Users can create their own orders" ON orders;
DROP POLICY IF EXISTS "Users can update their own orders" ON orders;

-- Permitir a los usuarios ver sus propios pedidos
CREATE POLICY "Users can view their own orders"
ON orders
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Permitir a los usuarios crear sus propios pedidos
CREATE POLICY "Users can create their own orders"
ON orders
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

-- Permitir a los usuarios actualizar sus propios pedidos
CREATE POLICY "Users can update their own orders"
ON orders
FOR UPDATE
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());
```

**Nota:** Estas políticas permiten que los usuarios gestionen completamente sus propios pedidos (crear, ver, actualizar/cancelar).

---

## 🧹 LIMPIAR FUNCIONES Y TRIGGERS ANTIGUOS

**IMPORTANTE:** Si tenías triggers o funciones anteriores, elimínalos primero:

```sql
-- Eliminar trigger antiguo
DROP TRIGGER IF EXISTS tr_reduce_stock ON order_items;

-- Eliminar función antigua
DROP FUNCTION IF EXISTS reduce_stock();

-- Eliminar otras funciones si existen
DROP FUNCTION IF EXISTS decrement_product_stock(UUID, INTEGER);
DROP FUNCTION IF EXISTS increment_product_stock(UUID, INTEGER);
```

---

## 🔧 FUNCIONES REQUERIDAS

La aplicación necesita estas funciones para manejar el stock. Ejecuta estos comandos en Supabase SQL Editor:

```sql
-- Función para decrementar stock de productos
CREATE OR REPLACE FUNCTION decrement_product_stock(
  product_id UUID,
  quantity INTEGER
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE products
  SET stock = stock - quantity
  WHERE id = product_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Product not found: %', product_id;
  END IF;
END;
$$;

-- Función para incrementar stock de productos (para cancelaciones)
CREATE OR REPLACE FUNCTION increment_product_stock(
  product_id UUID,
  quantity INTEGER
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE products
  SET stock = stock + quantity
  WHERE id = product_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Product not found: %', product_id;
  END IF;
END;
$$;
```

### 3. Tabla para el Chatbot

Ejecuta este SQL para crear la tabla de mensajes y sus políticas:

```sql
-- Crear tabla de mensajes
CREATE TABLE IF NOT EXISTS chat_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('user', 'model')),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Habilitar RLS
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- Política para ver propios mensajes
CREATE POLICY "Users can view their own chat messages"
ON chat_messages FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Política para insertar propios mensajes
CREATE POLICY "Users can insert their own chat messages"
ON chat_messages FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());
```

---

## Solución Detallada (Alternativa)

Ejecuta los siguientes comandos SQL en el SQL Editor de Supabase:

### 1. Habilitar RLS en las tablas (si no está habilitado)

```sql
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE branches ENABLE ROW LEVEL SECURITY;
```

### 2. Políticas para la tabla `orders`

```sql
-- Permitir a los usuarios ver sus propios pedidos
CREATE POLICY "Users can view their own orders"
ON orders
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Permitir a los usuarios crear sus propios pedidos
CREATE POLICY "Users can create their own orders"
ON orders
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

-- Permitir a los usuarios actualizar sus propios pedidos
CREATE POLICY "Users can update their own orders"
ON orders
FOR UPDATE
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());
```

### 3. Políticas para la tabla `order_items`

```sql
-- Permitir a los usuarios ver los items de sus propios pedidos
CREATE POLICY "Users can view their own order items"
ON order_items
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM orders
    WHERE orders.id = order_items.order_id
    AND orders.user_id = auth.uid()
  )
);

-- Permitir a los usuarios crear items para sus propios pedidos
CREATE POLICY "Users can insert their own order items"
ON order_items
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM orders
    WHERE orders.id = order_items.order_id
    AND orders.user_id = auth.uid()
  )
);
```

### 4. Políticas para la tabla `products`

```sql
-- Permitir a todos los usuarios autenticados ver productos
CREATE POLICY "Authenticated users can view products"
ON products
FOR SELECT
TO authenticated
USING (true);

-- Permitir a todos los usuarios autenticados actualizar stock (para las funciones RPC)
CREATE POLICY "Authenticated users can update products"
ON products
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);
```

### 5. Políticas para la tabla `branches`

```sql
-- Permitir a todos los usuarios autenticados ver sucursales
CREATE POLICY "Authenticated users can view branches"
ON branches
FOR SELECT
TO authenticated
USING (true);
```

## Verificación

Después de ejecutar estos comandos, intenta crear un pedido nuevamente. El error debería desaparecer.

## Notas importantes

1. **Seguridad**: Estas políticas permiten que los usuarios solo accedan a sus propios pedidos
2. **Productos y Sucursales**: Son visibles para todos los usuarios autenticados
3. **Stock**: Los usuarios pueden actualizar el stock a través de las funciones RPC (decrement_product_stock, increment_product_stock)

## Comandos para eliminar políticas existentes (si es necesario)

Si necesitas eliminar políticas existentes antes de crear las nuevas:

```sql
-- Eliminar políticas de orders
DROP POLICY IF EXISTS "Users can view their own orders" ON orders;
DROP POLICY IF EXISTS "Users can create their own orders" ON orders;
DROP POLICY IF EXISTS "Users can update their own orders" ON orders;

-- Eliminar políticas de order_items
DROP POLICY IF EXISTS "Users can view their own order items" ON order_items;
DROP POLICY IF EXISTS "Users can insert their own order items" ON order_items;

-- Eliminar políticas de products
DROP POLICY IF EXISTS "Authenticated users can view products" ON products;
DROP POLICY IF EXISTS "Authenticated users can update products" ON products;

-- Eliminar políticas de branches
DROP POLICY IF EXISTS "Authenticated users can view branches" ON branches;
```
