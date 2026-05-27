"use client";
import { createContext, useContext, useState, useEffect } from 'react';
import * as initialData from '../data/siteData';

const SiteDataContext = createContext();

const DEFAULT_HERO_IMAGE = 'https://images.unsplash.com/photo-1571266028243-e4bb333c5e14?w=800&q=80';
const DEFAULT_BIO_IMAGE = 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=800&q=80';
const DEFAULT_MANIFESTO_IMAGE = '/images/rider-tech.png';
const DEFAULT_LOGO = '/LOZANO - TRANSPARENTE BLANCO.png';

export function SiteDataProvider({ children }) {
  const [siteData, setSiteData] = useState({
    logo: DEFAULT_LOGO,
    logoScale: 100,
    bioData: {
      heroImage: DEFAULT_HERO_IMAGE,
      heroSilhouette: null,
      heroLogo: null,
      heroLogoScale: 100,
      heroLogoYOffset: 0,
      sectionTitle: 'Biografía',
      bioImage: DEFAULT_BIO_IMAGE,
      ...initialData.bioData
    },
    manifestoData: {
      image: DEFAULT_MANIFESTO_IMAGE,
      ...initialData.manifestoData
    },
    gigsData: initialData.gigsData,
    tourDates: initialData.tourDates,
    tracksData: initialData.tracksData,
    videosData: initialData.videosData,
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
            logoScale: parsed.logoScale !== undefined ? parsed.logoScale : 100,
            bioData: {
              ...initialData.bioData,
              ...parsed.bioData,
              heroImage: parsed.bioData?.heroImage !== undefined ? parsed.bioData.heroImage : DEFAULT_HERO_IMAGE,
              heroSilhouette: parsed.bioData?.heroSilhouette !== undefined ? parsed.bioData.heroSilhouette : null,
              heroLogo: parsed.bioData?.heroLogo !== undefined ? parsed.bioData.heroLogo : null,
              heroLogoScale: parsed.bioData?.heroLogoScale !== undefined ? parsed.bioData.heroLogoScale : 100,
              heroLogoYOffset: parsed.bioData?.heroLogoYOffset !== undefined ? parsed.bioData.heroLogoYOffset : 0,
              sectionTitle: parsed.bioData?.sectionTitle !== undefined ? parsed.bioData.sectionTitle : 'Biografía',
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
            gigsData: parsed.gigsData || initialData.gigsData,
            tourDates: parsed.tourDates || initialData.tourDates,
            tracksData: parsed.tracksData || initialData.tracksData,
            videosData: parsed.videosData || initialData.videosData,
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
      } catch (e) {
        console.error('Error saving overrides to localStorage', e);
        // Fail silently or log error, but never throw and crash the React rendering loop
      }
      return merged;
    });
  };

  const resetToDefaults = () => {
    localStorage.removeItem('lozano_site_overrides');
    setSiteData({
      logo: DEFAULT_LOGO,
      logoScale: 100,
      bioData: {
        heroImage: DEFAULT_HERO_IMAGE,
        heroSilhouette: null,
        heroLogo: null,
        heroLogoScale: 100,
        heroLogoYOffset: 0,
        sectionTitle: 'Biografía',
        bioImage: DEFAULT_BIO_IMAGE,
        ...initialData.bioData
      },
      manifestoData: {
        image: DEFAULT_MANIFESTO_IMAGE,
        ...initialData.manifestoData
      },
      gigsData: initialData.gigsData,
      tourDates: initialData.tourDates,
      tracksData: initialData.tracksData,
      videosData: initialData.videosData,
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
