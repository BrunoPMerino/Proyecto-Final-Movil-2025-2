-- ============================================
-- POBLAR RELACIONES PRODUCTO-SUCURSAL
-- ============================================
-- Este script crea las relaciones faltantes entre productos y sucursales
-- en la tabla product_branches

-- Insertar relaciones para todos los productos en todas las sucursales
-- Esto asigna cada producto a cada sucursal con stock aleatorio
INSERT INTO product_branches (product_id, branch_id, stock, is_available)
SELECT 
  p.id as product_id,
  b.id as branch_id,
  FLOOR(RANDOM() * 41 + 10)::INTEGER as stock, -- Stock entre 10 y 50 unidades
  true as is_available
FROM products p
CROSS JOIN branches b
ON CONFLICT (product_id, branch_id) DO NOTHING; -- Evitar duplicados si ya existen

-- ============================================
-- VERIFICACIÓN
-- ============================================
-- Ejecuta estas consultas para verificar:

-- 1. Contar relaciones creadas
SELECT COUNT(*) as total_relaciones FROM product_branches;

-- 2. Ver algunas relaciones
SELECT 
  p.name as producto,
  b.name as sucursal,
  pb.stock,
  pb.is_available
FROM product_branches pb
JOIN products p ON pb.product_id = p.id
JOIN branches b ON pb.branch_id = b.id
LIMIT 10;

-- 3. Verificar hamburguesas específicamente
SELECT 
  p.name as producto,
  b.name as sucursal,
  pb.stock,
  pb.is_available
FROM product_branches pb
JOIN products p ON pb.product_id = p.id
JOIN branches b ON pb.branch_id = b.id
WHERE p.name ILIKE '%hamburguesa%'
ORDER BY p.name, b.name;
