import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export async function DELETE(req, { params }) {
  const { id } = await params;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey || supabaseUrl.includes('your-supabase-project')) {
    return NextResponse.json({ success: true, localMock: true });
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey);

  try {
    // 1. Delete all related tables in parallel first to prevent foreign key errors
    await Promise.all([
      supabase.from('artist_bio').delete().eq('artist_id', id),
      supabase.from('artist_manifesto').delete().eq('artist_id', id),
      supabase.from('artist_outro').delete().eq('artist_id', id),
      supabase.from('artist_gigs').delete().eq('artist_id', id),
      supabase.from('artist_tracks').delete().eq('artist_id', id),
      supabase.from('artist_videos').delete().eq('artist_id', id),
    ]);

    // 2. Delete the artist record
    const { data: deletedArtists, error } = await supabase
      .from('artists')
      .delete()
      .eq('id', id)
      .select();

    if (error) throw error;

    // Si no se eliminó ninguna fila, es porque las políticas RLS de Supabase están bloqueando el DELETE para el rol anon
    if (!deletedArtists || deletedArtists.length === 0) {
      return NextResponse.json({
        error: 'Las políticas de Row Level Security (RLS) en Supabase están bloqueando la eliminación. Por favor ejecuta el script de migración SQL provisto para habilitar permisos DELETE.'
      }, { status: 403 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error al eliminar artista de Supabase:', error);
    return NextResponse.json({ error: 'Error al eliminar el artista de la base de datos' }, { status: 500 });
  }
}

