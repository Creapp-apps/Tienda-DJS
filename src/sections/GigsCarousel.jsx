import { useRef, useState, useEffect } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useSiteData } from '../context/SiteDataContext';
import { useLenis } from 'lenis/react';
import './GigsCarousel.css';

gsap.registerPlugin(ScrollTrigger);

export default function GigsCarousel() {
  const sectionRef = useRef(null);
  const trackRef = useRef(null);
  const { siteData } = useSiteData();
  const [paused, setPaused] = useState(false);
  const [selectedGig, setSelectedGig] = useState(null);
  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const lenis = useLenis();

  // Scroll locking for modal
  useEffect(() => {
    if (selectedGig) {
      lenis?.stop();
    } else {
      lenis?.start();
    }
    return () => {
      lenis?.start();
    };
  }, [selectedGig, lenis]);

  // Escape key handler to close modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setSelectedGig(null);
      }
    };
    if (selectedGig) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedGig]);

  useGSAP(() => {
    /* Section title reveal */
    const title = sectionRef.current.querySelector('.gigs__title');
    if (title) {
      gsap.from(title, {
        y: 40,
        opacity: 0,
        duration: 1,
        ease: 'expo.out',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 75%',
        },
      });
    }
  }, { scope: sectionRef });

  // Filter out any gigs that don't have a valid image uploaded/specified
  const validGigs = (siteData.gigsData || []).filter(
    (gig) => {
      const gigImages = Array.isArray(gig?.images) ? gig.images : [gig?.image];
      const hasAnyValidPhoto = gigImages.some(img => img && img.trim() !== '');
      return gig && hasAnyValidPhoto;
    }
  );

  if (validGigs.length === 0) {
    return null; // Hide the section completely if there are no loaded photos
  }

  // If there are less than 4 shows, render them statically without duplication or marquee animation
  const isStatic = validGigs.length < 4;
  const items = isStatic ? validGigs : [...validGigs, ...validGigs];

  const handleOpenGig = (gig) => {
    setSelectedGig(gig);
    setActiveImageIdx(0);
  };

  const getGigCover = (gig) => {
    if (Array.isArray(gig.images) && gig.images.length > 0) {
      const firstValid = gig.images.find(img => img && img.trim() !== '');
      if (firstValid) return firstValid;
    }
    return gig.image || '';
  };

  // Helper to extract valid loaded images inside selected gig
  const selectedGigImages = selectedGig 
    ? (Array.isArray(selectedGig.images) 
        ? selectedGig.images 
        : [selectedGig.image || '']
      ).filter(img => img && img.trim() !== '')
    : [];

  return (
    <section ref={sectionRef} className="gigs section" id="gigs">
      <div className="container">
        <span className="section-label">Gigs & Live Sets</span>
        <h2 className="gigs__title">On Stage</h2>
      </div>

      <div
        className={`gigs__carousel ${isStatic ? 'gigs__carousel--static' : ''}`}
        onMouseEnter={() => !isStatic && setPaused(true)}
        onMouseLeave={() => !isStatic && setPaused(false)}
      >
        <div
          ref={trackRef}
          className={`gigs__track ${isStatic ? 'gigs__track--static' : 'gigs__track--animate'}`}
          style={{ animationPlayState: paused ? 'paused' : 'running' }}
        >
          {items.map((gig, i) => {
            const coverImage = getGigCover(gig);
            return (
              <article 
                key={`${gig.id}-${i}`} 
                className="gigs__card" 
                data-cursor-hover
                onClick={() => handleOpenGig(gig)}
              >
                <div className="gigs__card-image">
                  <img src={coverImage} alt={gig.venue} loading="lazy" />
                  <div className="gigs__card-overlay">
                    <span className="gigs__card-venue font-display">{gig.venue}</span>
                    <div className="gigs__card-meta font-mono">
                      <span>{gig.city}</span>
                      <span>{gig.date}</span>
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>

      {/* Central Floating Premium Toast-Style Modal */}
      {selectedGig && (
        <div className="gigs-modal" onClick={() => setSelectedGig(null)}>
          <div className="gigs-modal__card" onClick={(e) => e.stopPropagation()}>
            <button 
              className="gigs-modal__close" 
              onClick={() => setSelectedGig(null)}
              aria-label="Cerrar modal"
            >
              ✕
            </button>
            
            <div className="gigs-modal__grid">
              {/* Photo Gallery Side */}
              <div className="gigs-modal__gallery">
                {selectedGigImages.length > 0 ? (
                  <>
                    <div className="gigs-modal__main-box">
                      <img 
                        src={selectedGigImages[activeImageIdx]} 
                        alt={`${selectedGig.venue} - Vista ${activeImageIdx + 1}`} 
                        className="gigs-modal__main-img"
                      />
                    </div>
                    {selectedGigImages.length > 1 && (
                      <div className="gigs-modal__thumbnails">
                        {selectedGigImages.map((img, index) => (
                          <button
                            key={index}
                            className={`gigs-modal__thumb ${index === activeImageIdx ? 'gigs-modal__thumb--active' : ''}`}
                            onClick={() => setActiveImageIdx(index)}
                          >
                            <img src={img} alt={`Miniatura ${index + 1}`} />
                          </button>
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <div className="gigs-modal__no-media font-mono">
                    <span>[ SIN FOTOS CARGADAS ]</span>
                  </div>
                )}
              </div>

              {/* Information / Details Side */}
              <div className="gigs-modal__info">
                <span className="gigs-modal__date font-mono">{selectedGig.date}</span>
                <h3 className="gigs-modal__venue font-display">{selectedGig.venue}</h3>
                <h4 className="gigs-modal__city font-mono">{selectedGig.city}</h4>
                
                <div className="gigs-modal__divider"></div>
                
                <p className="gigs-modal__description">
                  {selectedGig.description || 'Una noche increíble repleta de sonidos vanguardistas y una atmósfera única en directo. Reviví los momentos destacados del show.'}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
