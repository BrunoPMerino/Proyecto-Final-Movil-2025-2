-- ============================================
-- MIGRACIÓN: Products-Branches Many-to-Many
-- ============================================
-- Este script migra de una relación uno-a-muchos a muchos-a-muchos
-- ADVERTENCIA: Este script eliminará todos los productos existentes

-- Paso 1: Eliminar todos los productos existentes (según confirmación del usuario)
DELETE FROM products;

-- Paso 2: Crear la tabla de relación (junction table)
CREATE TABLE IF NOT EXISTS product_branches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE NOT NULL,
  branch_id UUID REFERENCES branches(id) ON DELETE CASCADE NOT NULL,
  stock INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
  is_available BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  -- Evitar duplicados: un producto solo puede estar una vez en cada sucursal
  UNIQUE(product_id, branch_id)
);

-- Paso 3: Crear índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_product_branches_product ON product_branches(product_id);
CREATE INDEX IF NOT EXISTS idx_product_branches_branch ON product_branches(branch_id);

-- Paso 4: Configurar Row Level Security (RLS)
ALTER TABLE product_branches ENABLE ROW LEVEL SECURITY;

-- Eliminar políticas existentes si existen
DROP POLICY IF EXISTS "Product branches are viewable by everyone" ON product_branches;
DROP POLICY IF EXISTS "Product branches are insertable by authenticated users" ON product_branches;
DROP POLICY IF EXISTS "Product branches are updatable by authenticated users" ON product_branches;
DROP POLICY IF EXISTS "Product branches are deletable by authenticated users" ON product_branches;

-- Crear políticas RLS
CREATE POLICY "Product branches are viewable by everyone"
  ON product_branches FOR SELECT
  USING (true);

CREATE POLICY "Product branches are insertable by authenticated users"
  ON product_branches FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Product branches are updatable by authenticated users"
  ON product_branches FOR UPDATE
  USING (auth.role() = 'authenticated');

CREATE POLICY "Product branches are deletable by authenticated users"
  ON product_branches FOR DELETE
  USING (auth.role() = 'authenticated');

-- Paso 5: Eliminar columnas antiguas de la tabla products
ALTER TABLE products DROP COLUMN IF EXISTS branch_id;
ALTER TABLE products DROP COLUMN IF EXISTS stock;
ALTER TABLE products DROP COLUMN IF EXISTS is_available;

-- ============================================
-- VERIFICACIÓN
-- ============================================
-- Ejecuta estas consultas para verificar la migración:

-- Ver estructura de product_branches
-- SELECT * FROM product_branches LIMIT 5;

-- Ver estructura actualizada de products
-- SELECT * FROM products LIMIT 5;

-- Contar registros
-- SELECT COUNT(*) as total_products FROM products;
-- SELECT COUNT(*) as total_product_branches FROM product_branches;
