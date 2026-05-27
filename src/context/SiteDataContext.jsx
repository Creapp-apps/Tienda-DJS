"use client";
import { createContext, useContext, useState, useEffect } from 'react';
import * as initialData from '../data/siteData';

const SiteDataContext = createContext();

const FALLBACK_LOGO = '/LOZANO - TRANSPARENTE BLANCO.png';
const FALLBACK_HERO = 'https://images.unsplash.com/photo-1571266028243-e4bb333c5e14?w=800&q=80';
const FALLBACK_BIO = 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=800&q=80';
const FALLBACK_MANIFESTO = '/images/rider-tech.png';

const DEFAULT_LOGO = initialData.logo || FALLBACK_LOGO;
const DEFAULT_HERO_IMAGE = initialData.bioData?.heroImage || FALLBACK_HERO;
const DEFAULT_BIO_IMAGE = initialData.bioData?.bioImage || FALLBACK_BIO;
const DEFAULT_MANIFESTO_IMAGE = initialData.manifestoData?.image || FALLBACK_MANIFESTO;

export function SiteDataProvider({ children }) {
  const [siteData, setSiteData] = useState({
    logo: DEFAULT_LOGO,
    logoScale: initialData.logoScale !== undefined ? initialData.logoScale : 100,
    bioData: {
      heroSilhouette: null,
      heroLogo: null,
      heroLogoScale: 100,
      heroLogoYOffset: 0,
      sectionTitle: 'Biografía',
      ...initialData.bioData,
      heroImage: DEFAULT_HERO_IMAGE,
      bioImage: DEFAULT_BIO_IMAGE,
    },
    manifestoData: {
      image: DEFAULT_MANIFESTO_IMAGE,
      ...initialData.manifestoData
    },
    gigsData: initialData.gigsData || [],
    tourDates: initialData.tourDates || [],
    tracksData: initialData.tracksData || [],
    videosData: initialData.videosData || [],
    outroData: {
      ...initialData.outroData
    },
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('lozano_site_overrides');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          setSiteData({
            logo: parsed.logo || DEFAULT_LOGO,
            logoScale: parsed.logoScale !== undefined ? parsed.logoScale : (initialData.logoScale || 100),
            bioData: {
              heroSilhouette: null,
              heroLogo: null,
              heroLogoScale: 100,
              heroLogoYOffset: 0,
              sectionTitle: 'Biografía',
              ...initialData.bioData,
              ...parsed.bioData,
              heroImage: parsed.bioData?.heroImage !== undefined ? parsed.bioData.heroImage : DEFAULT_HERO_IMAGE,
              bioImage: parsed.bioData?.bioImage !== undefined ? parsed.bioData.bioImage : DEFAULT_BIO_IMAGE,
            },
            manifestoData: (
              !parsed.manifestoData || 
              parsed.manifestoData.sectionTitle === "Sonido & Síntesis" ||
              !parsed.manifestoData.sectionTitle
            ) ? initialData.manifestoData : {
              ...initialData.manifestoData,
              ...parsed.manifestoData,
              image: parsed.manifestoData?.image !== undefined ? parsed.manifestoData.image : DEFAULT_MANIFESTO_IMAGE,
            },
            gigsData: parsed.gigsData || initialData.gigsData || [],
            tourDates: parsed.tourDates || initialData.tourDates || [],
            tracksData: parsed.tracksData || initialData.tracksData || [],
            videosData: parsed.videosData || initialData.videosData || [],
            outroData: {
              ...initialData.outroData,
              ...parsed.outroData,
            },
          });
        } catch (e) {
          console.error('Error parsing site overrides', e);
        }
      }
    }
  }, []);

  const updateSiteData = (newOverrides) => {
    setSiteData((prev) => {
      const merged = { ...prev, ...newOverrides };
      try {
        localStorage.setItem('lozano_site_overrides', JSON.stringify(merged));
        
        // If in development mode, automatically save to disk via the site-data API!
        if (process.env.NODE_ENV === 'development') {
          fetch('/api/site-data', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(merged),
          }).catch(err => console.error('Failed to sync overrides to local file system', err));
        }
      } catch (e) {
        console.error('Error saving overrides to localStorage', e);
      }
      return merged;
    });
  };

  const resetToDefaults = () => {
    localStorage.removeItem('lozano_site_overrides');
    
    // In development mode, reset local file as well!
    if (process.env.NODE_ENV === 'development') {
      fetch('/api/site-data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          logo: DEFAULT_LOGO,
          logoScale: initialData.logoScale !== undefined ? initialData.logoScale : 100,
          bioData: {
            ...initialData.bioData,
            heroImage: DEFAULT_HERO_IMAGE,
            bioImage: DEFAULT_BIO_IMAGE,
          },
          manifestoData: {
            ...initialData.manifestoData,
            image: DEFAULT_MANIFESTO_IMAGE,
          },
          gigsData: initialData.gigsData || [],
          tourDates: initialData.tourDates || [],
          tracksData: initialData.tracksData || [],
          videosData: initialData.videosData || [],
          outroData: {
            ...initialData.outroData
          }
        }),
      }).catch(err => console.error('Failed to reset overrides in local file system', err));
    }
    
    setSiteData({
      logo: DEFAULT_LOGO,
      logoScale: initialData.logoScale !== undefined ? initialData.logoScale : 100,
      bioData: {
        heroSilhouette: null,
        heroLogo: null,
        heroLogoScale: 100,
        heroLogoYOffset: 0,
        sectionTitle: 'Biografía',
        ...initialData.bioData,
        heroImage: DEFAULT_HERO_IMAGE,
        bioImage: DEFAULT_BIO_IMAGE,
      },
      manifestoData: {
        image: DEFAULT_MANIFESTO_IMAGE,
        ...initialData.manifestoData
      },
      gigsData: initialData.gigsData || [],
      tourDates: initialData.tourDates || [],
      tracksData: initialData.tracksData || [],
      videosData: initialData.videosData || [],
      outroData: {
        ...initialData.outroData
      },
    });
  };

  return (
    <SiteDataContext.Provider value={{ siteData, updateSiteData, resetToDefaults }}>
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

