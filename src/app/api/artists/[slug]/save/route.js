import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function POST(req, { params }) {
  const { slug } = await params;
  const body = await req.json();

  // Inicializar Supabase Client con variables del servidor
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // Si no está configurada la base de datos de producción, escribir localmente en dev
  const isDev = process.env.NODE_ENV === 'development';
  const isMissingEnv = !supabaseUrl || !supabaseAnonKey || supabaseUrl.includes('your-supabase-project');

  if (isMissingEnv) {
    if (isDev) {
      return writeToFallbackLocal(body);
    }
    return NextResponse.json({ error: 'Variables de Supabase ausentes en producción.' }, { status: 500 });
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey);

  try {
    // 1. Buscar al artista por slug
    let query = supabase.from('artists').select('*');
    const isCustomDomain = slug.includes('.');
    if (isCustomDomain) {
      query = query.eq('custom_domain', slug);
    } else {
      query = query.eq('slug', slug);
    }

    const { data: artist, error: artistError } = await query.single();

    // Si el artista no existe en Supabase y estamos en desarrollo, crearlo o usar fallback local
    if (artistError || !artist) {
      if (isDev) {
        // En modo dev local, si no existe el artista en la DB remota, guardamos de respaldo en el JSON
        return writeToFallbackLocal(body);
      }
      return NextResponse.json({ error: `El artista con slug "${slug}" no está registrado en el sistema.` }, { status: 404 });
    }

    const artistId = artist.id;

    // 2. Ejecutar transacciones de actualización en Supabase
    
    // 2.a. Actualizar el registro base del Artista (logo y escala)
    await supabase.from('artists').update({
      logo_url: body.logo,
      logo_scale: body.logoScale !== undefined ? body.logoScale : 110,
    }).eq('id', artistId);

    // 2.b. Upsert de Biografía (artist_bio)
    if (body.bioData) {
      await supabase.from('artist_bio').upsert({
        artist_id: artistId,
        tagline: body.bioData.tagline,
        intro: body.bioData.intro,
        stats: body.bioData.stats || [],
        paragraphs: body.bioData.paragraphs || [],
        hero_image: body.bioData.heroImage,
        hero_silhouette: body.bioData.heroSilhouette,
        hero_logo: body.bioData.heroLogo,
        hero_logo_scale: body.bioData.heroLogoScale !== undefined ? body.bioData.heroLogoScale : 100,
        hero_logo_y_offset: body.bioData.heroLogoYOffset !== undefined ? body.bioData.heroLogoYOffset : 0,
        section_title: body.bioData.sectionTitle || 'Biografía',
        bio_image: body.bioData.bioImage
      });
    }

    // 2.c. Upsert de Manifiesto (artist_manifesto)
    if (body.manifestoData) {
      await supabase.from('artist_manifesto').upsert({
        artist_id: artistId,
        section_title: body.manifestoData.sectionTitle || 'Sonido & Síntesis',
        tagline: body.manifestoData.tagline,
        intro: body.manifestoData.intro,
        paragraphs: body.manifestoData.paragraphs || [],
        image: body.manifestoData.image
      });
    }

    // 2.d. Sincronizar Shows/Gigs (artist_gigs)
    // El flujo más limpio es eliminar los shows antiguos de este artista e insertar los nuevos
    const tourDates = body.tourDates || body.gigsData || [];
    if (Array.isArray(tourDates)) {
      // Eliminar previos
      await supabase.from('artist_gigs').delete().eq('artist_id', artistId);
      
      if (tourDates.length > 0) {
        const gigsToInsert = tourDates.map(gig => ({
          artist_id: artistId,
          date: gig.date,
          venue: gig.venue,
          city: gig.city,
          ticket_url: gig.ticket_url || gig.ticketUrl
        }));
        await supabase.from('artist_gigs').insert(gigsToInsert);
      }
    }

    // 2.e. Sincronizar Tracks de la tienda (artist_tracks)
    const tracks = body.tracksData || [];
    if (Array.isArray(tracks)) {
      // Eliminar previos
      await supabase.from('artist_tracks').delete().eq('artist_id', artistId);

      if (tracks.length > 0) {
        const tracksToInsert = tracks.map(track => ({
          artist_id: artistId,
          title: track.title,
          type: track.type || 'Original Mix',
          genre: track.genre,
          bpm: track.bpm ? parseInt(track.bpm) : null,
          price: parseFloat(track.price),
          currency: track.currency || 'ARS',
          duration: track.duration,
          cover_color: track.cover_color || track.coverColor || '#E11D48',
          mp3_url: track.mp3_url || track.mp3Url,
          waveform: track.waveform || [30, 45, 60, 40, 70, 85, 55, 30, 45, 60, 75, 90, 50, 40, 60, 80, 65, 45, 50, 30]
        }));
        await supabase.from('artist_tracks').insert(tracksToInsert);
      }
    }

    // 2.f. Sincronizar Videos (artist_videos)
    const videos = body.videosData || [];
    if (Array.isArray(videos)) {
      await supabase.from('artist_videos').delete().eq('artist_id', artistId);

      if (videos.length > 0) {
        const videosToInsert = videos.map(vid => ({
          artist_id: artistId,
          title: vid.title,
          youtube_url: vid.youtube_url || vid.youtubeUrl,
          thumbnail_url: vid.thumbnail_url || vid.thumbnailUrl
        }));
        await supabase.from('artist_videos').insert(videosToInsert);
      }
    }

    // 2.g. Upsert de Despedida (artist_outro)
    if (body.outroData) {
      await supabase.from('artist_outro').upsert({
        artist_id: artistId,
        title: body.outroData.title || 'THE SOUND EXPERIENCE',
        subtitle: body.outroData.subtitle,
        image: body.outroData.image,
        cta1_text: body.outroData.cta1Text || body.outroData.cta1_text,
        cta1_url: body.outroData.cta1Url || body.outroData.cta1_url,
        cta2_text: body.outroData.cta2Text || body.outroData.cta2_text,
        cta2_url: body.outroData.cta2Url || body.outroData.cta2_url
      });
    }

    return NextResponse.json({ success: true, message: 'Información guardada en Supabase correctamente.' });

  } catch (error) {
    console.error('Error al guardar datos del artista en Supabase:', error);
    if (isDev) {
      // Fallback local ante fallas
      return writeToFallbackLocal(body);
    }
    return NextResponse.json({ error: 'Error interno al sincronizar con el servidor.' }, { status: 500 });
  }
}

// Función auxiliar para escribir al JSON local de desarrollo
function writeToFallbackLocal(data) {
  try {
    const jsonPath = path.join(process.cwd(), 'src/data/siteData.json');
    fs.writeFileSync(jsonPath, JSON.stringify(data, null, 2), 'utf8');
    return NextResponse.json({ success: true, localSync: true, message: 'Guardado localmente en siteData.json.' });
  } catch (err) {
    console.error('Error escribiendo fallback local:', err);
    return NextResponse.json({ error: 'Error al escribir el archivo local.' }, { status: 500 });
  }
}
