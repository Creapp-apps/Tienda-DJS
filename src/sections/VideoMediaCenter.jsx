import { useRef, useState } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useSiteData } from '../context/SiteDataContext';
import './VideoMediaCenter.css';

gsap.registerPlugin(ScrollTrigger);

export default function VideoMediaCenter() {
  const sectionRef = useRef(null);
  const { siteData } = useSiteData();
  const [lightbox, setLightbox] = useState(null);

  useGSAP(() => {
    if (!sectionRef.current) return;
    const cards = sectionRef.current.querySelectorAll('.video-card');
    cards.forEach((card, i) => {
      gsap.from(card, {
        y: 80,
        opacity: 0,
        duration: 0.8,
        ease: 'expo.out',
        scrollTrigger: {
          trigger: card,
          start: 'top 85%',
        },
        delay: i * 0.1,
      });
    });
  }, { scope: sectionRef });

  return (
    <section ref={sectionRef} className="videos section" id="videos">
      <div className="container">
        <span className="section-label">Media Center</span>
        <h2 className="videos__title">Videos & Sets</h2>

        <div className="videos__grid">
          {siteData.videosData
            .filter((video) => video && video.thumbnail && video.thumbnail.trim() !== '')
            .map((video) => (
              <article
                key={video.id}
                className={`video-card ${video.featured ? 'video-card--featured' : ''}`}
                onClick={() => setLightbox(video)}
                data-cursor-hover
              >
                <div className="video-card__thumbnail">
                  <img src={video.thumbnail} alt={video.title} loading="lazy" />
                  <div className="video-card__play">
                    <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                      <circle cx="24" cy="24" r="23" stroke="white" strokeWidth="1" opacity="0.6" />
                      <polygon points="20,16 34,24 20,32" fill="white" />
                    </svg>
                  </div>
                  <span className="video-card__duration font-mono">{video.duration}</span>
                </div>
                <h3 className="video-card__title">{video.title}</h3>
              </article>
            ))}
        </div>
      </div>

      {/* Lightbox */}
      {lightbox && (
        <div className="video-lightbox" onClick={() => setLightbox(null)}>
          <div className="video-lightbox__content" onClick={(e) => e.stopPropagation()}>
            <button className="video-lightbox__close" onClick={() => setLightbox(null)} aria-label="Cerrar">
              ✕
            </button>
            <div className="video-lightbox__player">
              <img src={lightbox.thumbnail} alt={lightbox.title} />
              <div className="video-lightbox__overlay">
                <svg width="80" height="80" viewBox="0 0 48 48" fill="none">
                  <circle cx="24" cy="24" r="23" stroke="white" strokeWidth="1" />
                  <polygon points="20,16 34,24 20,32" fill="white" />
                </svg>
                <p className="font-mono" style={{ marginTop: '1rem', color: 'var(--white-ghost)' }}>
                  Video próximamente
                </p>
              </div>
            </div>
            <h3 className="font-display" style={{ padding: '1.5rem', fontSize: '1.2rem' }}>
              {lightbox.title}
            </h3>
          </div>
        </div>
      )}
    </section>
  );
}
