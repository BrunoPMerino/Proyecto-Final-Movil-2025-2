-- Script para agregar sucursales de ejemplo con coordenadas en Bogotá, Colombia
-- Ejecuta este SQL en el SQL Editor de Supabase para probar el mapa

-- Insertar sucursales de ejemplo
INSERT INTO branches (name, address, latitude, longitude) VALUES
('Sucursal Centro', 'Calle 72 #10-34, Bogotá', 4.6533, -74.0625),
('Sucursal Norte', 'Calle 127 #15-45, Bogotá', 4.7110, -74.0721),
('Sucursal Sur', 'Autopista Sur #45-67, Bogotá', 4.5709, -74.1273),
('Sucursal Chapinero', 'Carrera 13 #53-45, Bogotá', 4.6486, -74.0625),
('Sucursal Suba', 'Calle 145 #91-19, Bogotá', 4.7519, -74.0836);

-- Verificar que se insertaron correctamente
SELECT id, name, address, latitude, longitude FROM branches;
