"use client";
import { createContext, useContext, useState, useEffect } from 'react';
import { useParams } from 'next/navigation';

const SiteDataContext = createContext();

const FALLBACK_LOGO = '/LOZANO - TRANSPARENTE BLANCO.png';
const FALLBACK_HERO = 'https://images.unsplash.com/photo-1571266028243-e4bb333c5e14?w=800&q=80';
const FALLBACK_BIO = 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=800&q=80';

export function SiteDataProvider({ children }) {
  const params = useParams();
  const slug = params?.slug || '';
  
  const getInitialName = (s) => {
    if (!s) return 'Tienda DJS';
    if (s === 'nehuen-lozano') return 'LOZANO';
    return s
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const [siteData, setSiteData] = useState({
    logo: slug === 'nehuen-lozano' ? FALLBACK_LOGO : '',
    logoScale: 110,
    slug: slug || 'template',
    name: getInitialName(slug),
    bioData: {
      heroImage: FALLBACK_HERO,
      heroSilhouette: null,
      heroLogo: null,
      heroLogoScale: 100,
      heroLogoYOffset: 0,
      tagline: slug === 'nehuen-lozano' ? 'Latin Tech / After mix' : 'NUEVA CUENTA DE ARTISTA',
      intro: '',
      stats: [],
      paragraphs: [],
      sectionTitle: 'Biografía',
      bioImage: FALLBACK_BIO,
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
    },
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isSuspended, setIsSuspended] = useState(false);
  const [isNotFound, setIsNotFound] = useState(false);

  useEffect(() => {
    // 1. Si no hay slug dinámico en la ruta (ej. estamos en localhost:3000/ o /superadmin),
    // servimos de inmediato la maqueta o "template" base sin bloqueos de base de datos.
    if (!params?.slug) {
      setSiteData({
        logo: '',
        logoScale: 110,
        slug: 'template',
        name: 'Tienda DJS',
        bioData: {
          heroImage: FALLBACK_HERO,
          heroSilhouette: null,
          heroLogo: null,
          heroLogoScale: 100,
          heroLogoYOffset: 0,
          tagline: 'PLATAFORMA BASE / TEMPLATE Y DISPOSICIÓN',
          intro: 'Esta es la página de demostración base de Tienda DJS. Aquí puedes ver la disposición estructural y el template predeterminado antes de inicializar la cuenta de un artista.',
          stats: [
            { value: '100%', label: 'Disposición' },
            { value: 'SaaS', label: 'Multi-Tenant' },
            { value: 'V2', label: 'Engine' }
          ],
          paragraphs: [
            {
              text: 'Para personalizar los contenidos, crea una cuenta de artista a través de la consola de Superadmin y accede con su slug correspondiente.',
              highlight: 'consola de Superadmin'
            }
          ],
          sectionTitle: 'Estructura Base',
          bioImage: FALLBACK_BIO,
        },
        manifestoData: {
          sectionTitle: 'Sonido & Síntesis',
          tagline: 'TEMPLATE DE MANIFIESTO',
          intro: 'Este es el texto del manifiesto por defecto del template base.',
          paragraphs: [],
          image: '/images/rider-tech.png'
        },
        gigsData: [],
        tourDates: [],
        tracksData: [],
        videosData: [],
        outroData: {
          title: 'PLATAFORMA DE ARTISTAS',
          subtitle: 'Diseña tu experiencia sonora interactiva',
          image: '',
          cta1Text: 'SUPERADMIN',
          cta1Url: '/superadmin',
          cta2Text: 'VER ARTISTAS',
          cta2Url: '/superadmin'
        },
      });
      setIsLoading(false);
      setIsSuspended(false);
      setIsNotFound(false);
      return;
    }

    let isMounted = true;
    setIsLoading(true);
    setIsSuspended(false);
    setIsNotFound(false);

    // Fetch the live artist data from our new API route
    fetch(`/api/artists/${slug}`)
      .then(res => {
        if (res.status === 403) {
          setIsSuspended(true);
          return null;
        }
        if (res.status === 404) {
          setIsNotFound(true);
          return null;
        }
        return res.json();
      })
      .then(data => {
        if (!data || !isMounted) return;

        // Apply local storage overrides ONLY for preview/local testing
        let finalData = data;
        const saved = localStorage.getItem(`site_overrides_${slug}`);
        if (saved) {
          try {
            const parsed = JSON.parse(saved);
            
            // Clean up stale fallback logo overrides for new SaaS tenants
            if (slug !== 'nehuen-lozano' && parsed.logo === '/LOZANO - TRANSPARENTE BLANCO.png') {
              delete parsed.logo;
            }
            
            finalData = {
              ...finalData,
              ...parsed,
              bioData: { ...finalData.bioData, ...parsed.bioData },
              manifestoData: { ...finalData.manifestoData, ...parsed.manifestoData },
              outroData: { ...finalData.outroData, ...parsed.outroData },
            };
          } catch (e) {
            console.error('Error parsing local site overrides:', e);
          }
        }

        setSiteData(finalData);
        setIsLoading(false);
      })
      .catch(err => {
        console.error('Error fetching artist data:', err);
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [params?.slug]);

  const updateSiteData = (newOverrides) => {
    setSiteData((prev) => {
      const merged = {
        ...prev,
        ...newOverrides,
        bioData: prev.bioData && newOverrides.bioData
          ? { ...prev.bioData, ...newOverrides.bioData }
          : (newOverrides.bioData || prev.bioData),
        manifestoData: prev.manifestoData && newOverrides.manifestoData
          ? { ...prev.manifestoData, ...newOverrides.manifestoData }
          : (newOverrides.manifestoData || prev.manifestoData),
        outroData: prev.outroData && newOverrides.outroData
          ? { ...prev.outroData, ...newOverrides.outroData }
          : (newOverrides.outroData || prev.outroData),
      };

      try {
        localStorage.setItem(`site_overrides_${slug}`, JSON.stringify(merged));
        
        // Sincronizar cambios en tiempo real con nuestra API de Supabase
        fetch(`/api/artists/${slug}/save`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(merged),
        })
        .then(res => res.json())
        .then(res => {
          if (res.success) {
            console.log(res.message);
          } else {
            console.error('Error al sincronizar cambios con la base de datos:', res.error);
          }
        })
        .catch(err => console.error('Error de red al sincronizar con la base de datos:', err));
      } catch (e) {
        console.error('Error al guardar overrides en localStorage:', e);
      }
      return merged;
    });
  };

  const resetToDefaults = () => {
    localStorage.removeItem(`site_overrides_${slug}`);
    
    // Si estamos en desarrollo, reseteamos también el JSON local
    if (process.env.NODE_ENV === 'development') {
      fetch('/api/site-data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          logo: FALLBACK_LOGO,
          logoScale: 110,
          slug: 'nehuen-lozano',
          name: 'LOZANO',
          bioData: {
            heroImage: FALLBACK_HERO,
            heroSilhouette: null,
            heroLogo: null,
            heroLogoScale: 100,
            heroLogoYOffset: 0,
            tagline: 'Latin Tech / After mix',
            intro: '',
            stats: [],
            paragraphs: [],
            sectionTitle: 'Biografía',
            bioImage: FALLBACK_HERO,
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
        }),
      }).catch(err => console.error('Error al resetear fallback local:', err));
    }
    
    // Disparar recarga fresca desde el servidor
    setIsLoading(true);
    fetch(`/api/artists/${slug}`)
      .then(res => res.json())
      .then(data => {
        setSiteData(data);
        setIsLoading(false);
      })
      .catch(() => setIsLoading(false));
  };

  // Render 404 screen if artist slug is not registered in our system
  if (isNotFound) {
    return (
      <div 
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh',
          backgroundColor: '#050507',
          color: '#ffffff',
          fontFamily: 'monospace',
          textAlign: 'center',
          padding: '20px',
          backgroundImage: 'radial-gradient(circle at 50% 50%, rgba(139, 92, 246, 0.08) 0%, transparent 50%)'
        }}
      >
        <div
          style={{
            border: '1px dashed rgba(244, 63, 94, 0.3)',
            padding: '40px',
            borderRadius: '20px',
            background: 'rgba(255, 255, 255, 0.01)',
            backdropFilter: 'blur(10px)',
            boxShadow: '0 20px 50px rgba(0,0,0,0.3)',
            maxWidth: '500px'
          }}
        >
          <h1 style={{ color: '#f43f5e', fontSize: '1.8rem', marginBottom: '15px', fontWeight: '900', letterSpacing: '4px' }}>404 - TIENDA NO ENCONTRADA</h1>
          <p style={{ fontSize: '1rem', color: '#a0a0a0', lineHeight: '1.6', marginBottom: '25px' }}>
            El slug o dominio <span style={{ color: '#a78bfa', fontWeight: 'bold' }}>"{slug}"</span> no está registrado en nuestra plataforma de Tienda DJS.
          </p>
          <div style={{ fontSize: '0.85rem', color: '#8e9aaf', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '20px' }}>
            Consola de Contenidos V2.1.4
          </div>
        </div>
      </div>
    );
  }

  // Render suspension screen if artist account is suspended (SaaS billing Phase 1)
  if (isSuspended) {
    return (
      <div 
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh',
          backgroundColor: '#0a0a0a',
          color: '#ffffff',
          fontFamily: 'monospace',
          textAlign: 'center',
          padding: '20px'
        }}
      >
        <h1 style={{ color: '#E11D48', fontSize: '2rem', marginBottom: '10px', fontWeight: 'bold', letterSpacing: '4px' }}>SERVICIO SUSPENDIDO</h1>
        <p style={{ fontSize: '1.1rem', maxWidth: '500px', color: '#a0a0a0', lineHeight: '1.6' }}>
          La cuenta de esta tienda/artista se encuentra temporalmente inactiva debido a falta de pago. Por favor, póngase en contacto con el administrador para restablecer el servicio.
        </p>
      </div>
    );
  }

  return (
    <SiteDataContext.Provider value={{ siteData, updateSiteData, resetToDefaults, isLoading }}>
      {children}
    </SiteDataContext.Provider>
  );
}

export function useSiteData() {
  const context = useContext(SiteDataContext);
  if (!context) {
    throw new Error('useSiteData must be used within a SiteDataProvider');
  }
  return context;
}
