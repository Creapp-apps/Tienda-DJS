import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(req, { params }) {
  const { slug } = await params;

  // Inicializar Supabase Client con variables del servidor
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // Si no está configurada la base de datos de producción real, usar fallback
  if (!supabaseUrl || !supabaseAnonKey || supabaseUrl.includes('your-supabase-project')) {
    if (slug === 'nehuen-lozano') {
      return returnFallbackLocal();
    }
    return NextResponse.json(getCleanArtistFallback(slug));
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey);

  try {
    // 1. Buscar el artista por slug o custom_domain
    // Si el slug incluye un punto (ej: "lozano.com"), buscamos por custom_domain
    const isCustomDomain = slug.includes('.');
    let query = supabase.from('artists').select('*');
    
    if (isCustomDomain) {
      query = query.eq('custom_domain', slug);
    } else {
      query = query.eq('slug', slug);
    }

    const { data: artist, error: artistError } = await query.single();

    if (artistError || !artist) {
      console.warn(`Artista con slug/dominio "${slug}" no encontrado en Supabase.`);
      return NextResponse.json({ error: 'Artista no encontrado' }, { status: 404 });
    }

    // 2. Si el artista está suspendido por falta de pago (Fase 1 del Superadmin)
    if (artist.billing_status === 'suspended') {
      return NextResponse.json({
        suspended: true,
        name: artist.name,
      }, { status: 403 });
    }

    // 3. Consultar toda la información relacionada del artista en paralelo
    const [
      { data: bio },
      { data: manifesto },
      { data: gigs },
      { data: tracks },
      { data: videos },
      { data: outro }
    ] = await Promise.all([
      supabase.from('artist_bio').select('*').eq('artist_id', artist.id).maybeSingle(),
      supabase.from('artist_manifesto').select('*').eq('artist_id', artist.id).maybeSingle(),
      supabase.from('artist_gigs').select('*').eq('artist_id', artist.id).order('date', { ascending: true }),
      supabase.from('artist_tracks').select('*').eq('artist_id', artist.id).order('created_at', { ascending: true }),
      supabase.from('artist_videos').select('*').eq('artist_id', artist.id).order('created_at', { ascending: true }),
      supabase.from('artist_outro').select('*').eq('artist_id', artist.id).maybeSingle()
    ]);

    // 4. Formatear la respuesta unificada adaptada a las propiedades actuales del frontend
    const siteData = {
      logo: artist.logo_url || (artist.slug === 'nehuen-lozano' ? '/LOZANO - TRANSPARENTE BLANCO.png' : ''),
      logoScale: artist.logo_scale !== null ? artist.logo_scale : 110,
      slug: artist.slug,
      name: artist.name,
      bioData: bio ? {
        heroImage: bio.hero_image,
        heroSilhouette: bio.hero_silhouette,
        heroLogo: bio.hero_logo,
        heroLogoScale: bio.hero_logo_scale,
        heroLogoYOffset: bio.hero_logo_y_offset,
        tagline: bio.tagline,
        intro: bio.intro,
        stats: bio.stats || [],
        paragraphs: bio.paragraphs || [],
        sectionTitle: bio.section_title || 'Biografía',
        bioImage: bio.bio_image
      } : {
        heroImage: 'https://images.unsplash.com/photo-1571266028243-e4bb333c5e14?w=800&q=80',
        heroSilhouette: null,
        heroLogo: null,
        heroLogoScale: 100,
        heroLogoYOffset: 0,
        tagline: 'Latin Tech / After mix',
        intro: '',
        stats: [],
        paragraphs: [],
        sectionTitle: 'Biografía',
        bioImage: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=800&q=80'
      },
      manifestoData: manifesto ? {
        sectionTitle: manifesto.section_title || 'Sonido & Síntesis',
        tagline: manifesto.tagline,
        intro: manifesto.intro,
        paragraphs: manifesto.paragraphs || [],
        image: manifesto.image
      } : {
        sectionTitle: 'Sonido & Síntesis',
        tagline: '',
        intro: '',
        paragraphs: [],
        image: '/images/rider-tech.png'
      },
      gigsData: gigs || [],
      tourDates: gigs || [], // Sincronizado para doble compatibilidad en código
      tracksData: tracks || [],
      videosData: videos || [],
      outroData: outro ? {
        title: outro.title,
        subtitle: outro.subtitle,
        image: outro.image,
        cta1Text: outro.cta1_text,
        cta1Url: outro.cta1_url,
        cta2Text: outro.cta2_text,
        cta2Url: outro.cta2_url
      } : {
        title: 'THE SOUND EXPERIENCE',
        subtitle: '',
        image: '',
        cta1Text: 'RESERVAR BOOKING',
        cta1Url: '',
        cta2Text: 'ESCUCHAR MÚSICA',
        cta2Url: ''
      }
    };

    return NextResponse.json(siteData);

  } catch (error) {
    console.error('Error al obtener datos del artista de Supabase:', error);
    return NextResponse.json({ error: 'Artista no encontrado o error interno' }, { status: 404 });
  }
}

// Función auxiliar para leer y devolver el fallback estático local
function returnFallbackLocal() {
  try {
    const jsonPath = path.join(process.cwd(), 'src/data/siteData.json');
    if (fs.existsSync(jsonPath)) {
      const fileContent = fs.readFileSync(jsonPath, 'utf8');
      return NextResponse.json(JSON.parse(fileContent));
    }
  } catch (err) {
    console.error('Error al leer fallback local:', err);
  }
  return NextResponse.json({ error: 'No se pudo cargar la información.' }, { status: 500 });
}

// Helper to generate a clean empty layout for new dynamic artists
function getCleanArtistFallback(slug) {
  const getInitialName = (s) => {
    if (!s) return 'ARTISTA';
    return s
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const name = getInitialName(slug);

  return {
    logo: '',
    logoScale: 110,
    slug: slug || '',
    name: name,
    bioData: {
      heroImage: 'https://images.unsplash.com/photo-1571266028243-e4bb333c5e14?w=800&q=80',
      heroSilhouette: null,
      heroLogo: null,
      heroLogoScale: 100,
      heroLogoYOffset: 0,
      tagline: 'INITIALIZING SYSTEMS',
      intro: '',
      stats: [],
      paragraphs: [],
      sectionTitle: 'Biografía',
      bioImage: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=800&q=80'
    },
    manifestoData: {
      sectionTitle: 'Sonido & Síntesis',
      tagline: '',
      intro: '',
      paragraphs: [],
      image: '/images/rider-tech.png'
    },
    gigsData: [],
    tourDates: [],
    tracksData: [],
    videosData: [],
    outroData: {
      title: 'THE SOUND EXPERIENCE',
      subtitle: '',
      image: '',
      cta1Text: 'RESERVAR BOOKING',
      cta1Url: '',
      cta2Text: 'ESCUCHAR MÚSICA',
      cta2Url: ''
    }
  };
}
