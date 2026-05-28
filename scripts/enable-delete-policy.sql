-- ====================================================================
-- SCRIPT DE MIGRACIÓN: HABILITAR POLÍTICAS DE ELIMINACIÓN (DELETE) EN SUPABASE
-- ====================================================================
-- ¿Por qué es necesario este script?
-- Por defecto, Supabase activa Row Level Security (RLS) en las tablas.
-- Aunque permite INSERT y SELECT para el rol 'anon' (público), bloquea
-- de forma silenciosa cualquier operación de DELETE regresando un estado 204
-- pero afectando 0 filas.
--
-- Ejecuta este script en el editor de SQL de tu panel de Supabase para
-- habilitar permisos de eliminación y permitir dar de baja clientes de forma limpia.
-- ====================================================================

-- 1. Políticas de eliminación para la tabla principal 'artists'
CREATE POLICY "Permitir DELETE para anon en artists" 
ON artists FOR DELETE TO anon USING (true);

-- 2. Políticas de eliminación para 'artist_bio'
CREATE POLICY "Permitir DELETE para anon en artist_bio" 
ON artist_bio FOR DELETE TO anon USING (true);

-- 3. Políticas de eliminación para 'artist_manifesto'
CREATE POLICY "Permitir DELETE para anon en artist_manifesto" 
ON artist_manifesto FOR DELETE TO anon USING (true);

-- 4. Políticas de eliminación para 'artist_outro'
CREATE POLICY "Permitir DELETE para anon en artist_outro" 
ON artist_outro FOR DELETE TO anon USING (true);

-- 5. Políticas de eliminación para 'artist_gigs'
CREATE POLICY "Permitir DELETE para anon en artist_gigs" 
ON artist_gigs FOR DELETE TO anon USING (true);

-- 6. Políticas de eliminación para 'artist_tracks'
CREATE POLICY "Permitir DELETE para anon en artist_tracks" 
ON artist_tracks FOR DELETE TO anon USING (true);

-- 7. Políticas de eliminación para 'artist_videos'
CREATE POLICY "Permitir DELETE para anon en artist_videos" 
ON artist_videos FOR DELETE TO anon USING (true);

-- ====================================================================
-- ¡Listo! Una vez ejecutado, haz clic en "Eliminar" en la consola de
-- Superadmin y el cliente se borrará permanentemente de forma inmediata.
-- ====================================================================
