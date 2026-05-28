"use client";

import { useEffect, useState } from 'react';
import { useSiteData } from '../../context/SiteDataContext';
import './Preloader.css';

export default function Preloader({ slug, onComplete }) {
  const { siteData, isLoading } = useSiteData();
  const [progress, setProgress] = useState(0);
  const [isFadingOut, setIsFadingOut] = useState(false);
  const [shouldRender, setShouldRender] = useState(true);

  // Helper to generate a clean capitalized display name from slug
  const getInitialName = (s) => {
    if (!s || s === 'template') return 'TIENDA DJS';
    if (s === 'nehuen-lozano') return 'LOZANO';
    return s
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  // Derive artist display name dynamically based on slug prop directly to avoid hydration flash!
  const artistName = getInitialName(slug);
  
  // Tagline fallback dynamically based on slug directly
  const artistTagline = slug === 'nehuen-lozano' 
    ? 'LATIN TECH / AFTER MIX' 
    : (!slug || slug === 'template')
      ? 'PLATAFORMA DE ARTISTAS'
      : 'INITIALIZING SYSTEMS';

  // Only render a logo image if we have a valid, non-empty logo in siteData
  // We strictly allow the default fallback logo ONLY if the active slug is 'nehuen-lozano'
  const logoSrc = siteData?.logo && siteData.logo.trim() !== '' && (siteData.logo !== '/LOZANO - TRANSPARENTE BLANCO.png' || slug === 'nehuen-lozano')
    ? siteData.logo
    : null;

  useEffect(() => {
    // 1. Simular carga suave y cinemática de 0 a 100%
    let start = 0;
    const duration = 1500; // 1.5 segundos garantizados para dar espacio a la carga
    const intervalTime = 15;
    const step = 100 / (duration / intervalTime);

    const timer = setInterval(() => {
      start += step;
      if (start >= 100) {
        start = 100;
        clearInterval(timer);
      }
      setProgress(Math.floor(start));
    }, intervalTime);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    // 2. Esperar a que se den ambas condiciones: animación al 100% Y API de Supabase resuelta
    if (progress === 100 && !isLoading) {
      const fadeTimeout = setTimeout(() => {
        setIsFadingOut(true);
        
        const removeTimeout = setTimeout(() => {
          setShouldRender(false);
          if (onComplete) onComplete();
        }, 800); // Duración de la animación CSS de fadeout

        return () => clearTimeout(removeTimeout);
      }, 300); // Breve retención al 100% para impacto estético

      return () => clearTimeout(fadeTimeout);
    }
  }, [progress, isLoading, onComplete]);

  if (!shouldRender) return null;

  return (
    <div className={`preloader-overlay ${isFadingOut ? 'preloader-overlay--fadeout' : ''}`}>
      {/* Dynamic scanline and grid backgrounds */}
      <div className="preloader-grid" />
      <div className="preloader-scanlines" />

      <div className="preloader-content">
        {/* Logo / Name Stack */}
        <div className="preloader-brand">
          {logoSrc ? (
            <img 
              src={logoSrc} 
              alt="Logo" 
              className="preloader-logo animate-pulse-gentle"
            />
          ) : (
            <div className="preloader-no-logo">
              <h1 className="preloader-title font-display tracking-widest animate-pulse-gentle">
                {artistName.toUpperCase()}
              </h1>
              <span className="preloader-instruction font-mono">
                Cargue su logo para visualizarlo en la carga de la web
              </span>
            </div>
          )}
          <span className="preloader-sub font-mono tracking-wider">
            {artistTagline}
          </span>
        </div>

        {/* Counter & Technical Details */}
        <div className="preloader-loader-wrap">
          <div className="preloader-bar-bg">
            <div 
              className="preloader-bar-fill" 
              style={{ width: `${progress}%` }}
            />
          </div>
          
          <div className="preloader-meta font-mono">
            <span className="preloader-status">
              {progress < 30 && "CONECTANDO A BASE DE DATOS..."}
              {progress >= 30 && progress < 70 && "CARGANDO ESTRUCTURA DE MEDIOS..."}
              {progress >= 70 && progress < 99 && "SINCRONIZANDO INTERFAZ..."}
              {progress === 100 && "SISTEMA LISTO"}
            </span>
            <span className="preloader-number font-mono">
              {progress.toString().padStart(3, '0')}%
            </span>
          </div>
        </div>
      </div>
      
      {/* Futuristic bottom label */}
      <div className="preloader-footer font-mono">
        <span>CONSOLA DE CONTENIDOS v2.1.4</span>
        <span>©{new Date().getFullYear()} {slug === 'nehuen-lozano' ? 'LOZANO MUSIC GROUP' : (!slug || slug === 'template') ? 'TIENDA DJS' : artistName.toUpperCase()}</span>
      </div>
    </div>
  );
}
