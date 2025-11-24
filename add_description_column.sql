-- Agregar columna 'description' a la tabla branches
ALTER TABLE branches 
ADD COLUMN IF NOT EXISTS description TEXT;

-- Ejemplo: Actualizar algunas sucursales con descripciones
-- Reemplaza estos valores con tus datos reales

UPDATE branches 
SET description = 'Nuestra sucursal principal con amplio espacio y estacionamiento disponible.'
WHERE name = 'Sucursal Centro';

UPDATE branches 
SET description = 'Ubicada en la zona norte, ideal para familias con área de juegos infantiles.'
WHERE name = 'Sucursal Norte';

UPDATE branches 
SET description = 'Sucursal moderna con servicio rápido y terraza al aire libre.'
WHERE name = 'Sucursal Sur';

-- Verificar que se agregó la columna
SELECT id, name, address, description FROM branches;
