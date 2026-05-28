import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

// GET: Listar todos los artistas para el panel de administración
export async function GET(req) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey || supabaseUrl.includes('your-supabase-project')) {
    // Si no hay variables de Supabase, devolver un mock de desarrollo
    return NextResponse.json([
      {
        id: '1',
        name: 'LOZANO',
        slug: 'nehuen-lozano',
        custom_domain: 'lozano.com',
        billing_status: 'active',
        created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: '2',
        name: 'MARTINEZ',
        slug: 'martinez',
        custom_domain: null,
        billing_status: 'active',
        created_at: new Date().toISOString()
      }
    ]);
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey);

  try {
    const { data: artists, error } = await supabase
      .from('artists')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return NextResponse.json(artists);
  } catch (error) {
    console.error('Error al listar artistas en Superadmin:', error);
    return NextResponse.json({ error: 'Error al obtener artistas de la base de datos' }, { status: 500 });
  }
}

// POST: Registrar un nuevo artista
export async function POST(req) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const body = await req.json();

  if (!body.name || !body.slug) {
    return NextResponse.json({ error: 'Nombre y slug son requeridos' }, { status: 400 });
  }

  // Sanitizar el slug a minúsculas y sin caracteres especiales
  const cleanSlug = body.slug.toLowerCase().replace(/[^a-z0-9-]/g, '');

  if (!supabaseUrl || !supabaseAnonKey || supabaseUrl.includes('your-supabase-project')) {
    return NextResponse.json({
      success: true,
      localMock: true,
      artist: {
        id: Math.random().toString(36).substring(7),
        name: body.name,
        slug: cleanSlug,
        custom_domain: body.custom_domain || null,
        billing_status: 'active',
        created_at: new Date().toISOString()
      }
    });
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey);

  try {
    // 1. Validar si ya existe un artista con el mismo slug
    const { data: existing } = await supabase
      .from('artists')
      .select('id')
      .eq('slug', cleanSlug)
      .maybeSingle();

    if (existing) {
      return NextResponse.json({ error: `El slug "${cleanSlug}" ya se encuentra registrado.` }, { status: 409 });
    }

    // 2. Insertar el nuevo artista
    const { data: newArtist, error: insertError } = await supabase
      .from('artists')
      .insert({
        name: body.name,
        slug: cleanSlug,
        custom_domain: body.custom_domain || null,
        billing_status: 'active',
      })
      .select()
      .single();

    if (insertError) throw insertError;

    // 3. Crear registros base en cascada para evitar errores en el primer fetch
    // (Por ejemplo, una biografía vacía para que no tire nulls)
    await supabase.from('artist_bio').insert({
      artist_id: newArtist.id,
      section_title: 'Biografía',
      tagline: 'Nueva cuenta de artista',
      intro: 'Biografía en construcción...',
      paragraphs: [
        {
          text: 'Haz clic en la consola de contenidos para comenzar a diseñar tu biografía.',
          highlight: 'consola de contenidos'
        }
      ],
      stats: [
        { value: '0+', label: 'Shows en vivo' },
        { value: '0', label: 'Seguidores' },
        { value: '0', label: 'Tracks editados' },
        { value: '0', label: 'Ciudades' }
      ]
    });

    await supabase.from('artist_manifesto').insert({
      artist_id: newArtist.id,
      section_title: 'Sonido & Síntesis',
      tagline: 'Mi Manifiesto',
      intro: 'Sonido en construcción...',
      paragraphs: [
        {
          text: 'Haz clic en la consola de contenidos para comenzar a diseñar tu manifiesto técnico.',
          highlight: 'consola de contenidos'
        }
      ]
    });

    await supabase.from('artist_outro').insert({
      artist_id: newArtist.id,
      title: 'THE SOUND EXPERIENCE',
      cta1_text: 'RESERVAR BOOKING',
      cta2_text: 'ESCUCHAR MÚSICA'
    });

    return NextResponse.json({ success: true, artist: newArtist });

  } catch (error) {
    console.error('Error al insertar artista:', error);
    return NextResponse.json({ error: 'Error al registrar el artista en la base de datos' }, { status: 500 });
  }
}
