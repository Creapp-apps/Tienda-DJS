import { useEffect, useRef, useState } from 'react';
import { useSiteData } from '../context/SiteDataContext';
import './FarewellOutro.css';

export default function FarewellOutro() {
  const { siteData } = useSiteData();
  const [active, setActive] = useState(false);
  const triggerRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setActive(true);
          document.body.classList.add('outro-active');
        } else {
          // Deactivate if the trigger element exited through the bottom (user scrolled up)
          if (entry.boundingClientRect.top > 0) {
            setActive(false);
            document.body.classList.remove('outro-active');
          }
        }
      },
      { 
        threshold: 0.01,
        rootMargin: '0px 0px -20px 0px'
      }
    );

    if (triggerRef.current) {
      observer.observe(triggerRef.current);
    }

    return () => {
      observer.disconnect();
      document.body.classList.remove('outro-active');
    };
  }, []);

  const handleClose = () => {
    setActive(false);
    document.body.classList.remove('outro-active');
    // Scroll slightly up to prevent immediate re-trigger
    window.scrollBy({ top: -150, behavior: 'smooth' });
  };

  const data = siteData.outroData || {
    title: "THE SOUND EXPERIENCE",
    subtitle: "¿Listo para llevar los sets híbridos de LOZANO a tu festival, club o evento privado?",
    image: "/LOZANO - TRANSPARENTE BLANCO.png",
    silhouette: "/mirando derecha.png",
    cta1Text: "RESERVAR BOOKING",
    cta1Url: "https://wa.me/5491100000000?text=Hola%20Lozano,%20me%20gustaria%20consultar%20por%20fechas%20de%20booking...",
    cta2Text: "ESCUCHAR MÚSICA",
    cta2Url: "#vault"
  };

  const showSilhouette = siteData.outroData
    ? (!!siteData.outroData.silhouette && siteData.outroData.silhouette !== "")
    : true;

  const silhouetteSrc = siteData.outroData
    ? siteData.outroData.silhouette
    : "/mirando derecha.png";

  const handleScrollToVault = (e) => {
    if (data.cta2Url && data.cta2Url.startsWith('#')) {
      e.preventDefault();
      handleClose();
      setTimeout(() => {
        const el = document.querySelector(data.cta2Url);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 300);
    }
  };

  return (
    <>
      {/* Invisible scroll target element to trigger the fade out blackout */}
      <div ref={triggerRef} className="outro-trigger" />

      {/* The Immersive Fixed Cinematic Overlay */}
      <div className={`outro-overlay ${active ? 'outro-overlay--active' : ''}`}>
        <div className="outro-overlay__backdrop" onClick={handleClose} />
        <div className="outro-overlay__glow" />
        
        <div className="outro-card">
          {/* Sleek top-right glass dismiss button */}
          <button onClick={handleClose} className="outro-card__close" aria-label="Cerrar">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>

          <div className={`outro-card__grid ${showSilhouette ? 'outro-card__grid--3col' : 'outro-card__grid--2col'}`}>
            <div className="outro-card__content">
              <span className="outro-card__label font-mono">CONTRATACIONES / BOOKING</span>
              <h2 className="outro-card__title font-unbounded">{data.title}</h2>
              <p className="outro-card__subtitle">{data.subtitle}</p>
              
              <div className="outro-card__actions">
                <a 
                  href={data.cta1Url} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="outro-card__btn outro-card__btn--primary font-mono"
                >
                  <span>{data.cta1Text}</span>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                  </svg>
                </a>
                
                <a 
                  href={data.cta2Url} 
                  onClick={handleScrollToVault}
                  className="outro-card__btn outro-card__btn--secondary font-mono"
                >
                  <span>{data.cta2Text}</span>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 18V5l12-2v13"/>
                    <circle cx="6" cy="18" r="3"/>
                    <circle cx="18" cy="16" r="3"/>
                  </svg>
                </a>
              </div>
            </div>

            {showSilhouette && (
              <div className="outro-card__silhouette">
                <div className="outro-card__silhouette-wrapper">
                  <div className="outro-card__silhouette-glow" />
                  <img 
                    src={silhouetteSrc} 
                    alt="LOZANO - Artist Silhouette" 
                    className="outro-card__silhouette-img"
                  />
                </div>
              </div>
            )}

            <div className="outro-card__media">
              <div className="outro-card__image-wrapper">
                <img 
                  src={data.image || '/LOZANO - TRANSPARENTE BLANCO.png'} 
                  alt="LOZANO - Outro Logo" 
                  className="outro-card__img"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
