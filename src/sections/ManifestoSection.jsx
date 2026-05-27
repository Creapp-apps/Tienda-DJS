import { useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { useSiteData } from '../context/SiteDataContext';
import './ManifestoSection.css';

gsap.registerPlugin(ScrollTrigger);

export default function ManifestoSection() {
  const sectionRef = useRef(null);
  const { siteData } = useSiteData();
  const manifesto = siteData.manifestoData;

  useGSAP(() => {
    if (!sectionRef.current) return;
    /* Reveal each paragraph block */
    const blocks = sectionRef.current.querySelectorAll('.manifesto__block');
    blocks.forEach((block, i) => {
      gsap.from(block, {
        y: 50,
        opacity: 0,
        duration: 1,
        ease: 'expo.out',
        scrollTrigger: {
          trigger: block,
          start: 'top 85%',
          end: 'top 45%',
          toggleActions: 'play none none none',
        },
      });
    });

    /* Stat counters */
    const stats = sectionRef.current.querySelectorAll('.manifesto__stat-value');
    stats.forEach((stat) => {
      const originalText = stat.textContent || '';
      const isNumeric = /^\d+%?$/.test(originalText.replace(/[^a-zA-Z0-9%]/g, ''));
      
      if (isNumeric) {
        const numericVal = parseInt(originalText.replace(/[^0-9]/g, ''), 10);
        const suffix = originalText.includes('%') ? '%' : '';
        
        gsap.from(stat, {
          textContent: 0,
          duration: 1.5,
          ease: 'power2.out',
          snap: { textContent: 1 },
          scrollTrigger: {
            trigger: stat,
            start: 'top 85%',
          },
          onUpdate: function () {
            stat.textContent = Math.round(Number(stat.textContent)) + suffix;
          }
        });
      } else {
        // Fade in for non-numeric stats (like "Analog")
        gsap.from(stat, {
          opacity: 0,
          y: 20,
          duration: 1,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: stat,
            start: 'top 85%',
          }
        });
      }
    });

    /* Side image parallax */
    const img = sectionRef.current.querySelector('.manifesto__side-image');
    if (img) {
      gsap.to(img, {
        yPercent: -12,
        ease: 'none',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top bottom',
          end: 'bottom top',
          scrub: 1.2,
        },
      });
    }

  }, { scope: sectionRef });

  if (!manifesto) return null;

  return (
    <section ref={sectionRef} className="manifesto section" id="manifesto">
      <div className="container">
        <span className="section-label">{manifesto.sectionTitle || 'Rider Técnico'}</span>

        <div className="manifesto__layout">
          {/* Left Column: Image */}
          <div className="manifesto__image-col">
            <div className="manifesto__side-image">
              <img
                src={
                  manifesto.image && manifesto.image.trim() !== ''
                    ? manifesto.image
                    : '/images/rider-tech.png'
                }
                alt="LOZANO - Rider Técnico"
                loading="lazy"
              />
            </div>
          </div>

          {/* Right Column: Narrative Content */}
          <div className="manifesto__text-col">
            <span className="font-mono" style={{ color: 'var(--neon-magenta)', fontSize: '0.8rem', letterSpacing: '0.2em', textTransform: 'uppercase', display: 'block', marginBottom: '15px' }}>
              {manifesto.tagline || 'Especificaciones'}
            </span>
            <h2 className="manifesto__intro">{manifesto.intro}</h2>

            {manifesto.paragraphs && manifesto.paragraphs.map((p, i) => (
              <div key={i} className="manifesto__block">
                <p className="manifesto__paragraph">
                  {p.text.split(p.highlight).map((part, j, arr) => (
                    <span key={j}>
                      {part}
                      {j < arr.length - 1 && (
                        <em className="manifesto__highlight">{p.highlight}</em>
                      )}
                    </span>
                  ))}
                </p>
              </div>
            ))}

          </div>
        </div>
      </div>
    </section>
  );
}
