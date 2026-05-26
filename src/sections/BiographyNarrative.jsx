import { useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { useSiteData } from '../context/SiteDataContext';
import './BiographyNarrative.css';

gsap.registerPlugin(ScrollTrigger);

export default function BiographyNarrative() {
  const sectionRef = useRef(null);
  const { siteData } = useSiteData();
  const bio = siteData.bioData;

  useGSAP(() => {
    /* Reveal each paragraph block */
    const blocks = sectionRef.current.querySelectorAll('.bio__block');
    blocks.forEach((block, i) => {
      gsap.from(block, {
        y: 60,
        opacity: 0,
        duration: 1,
        ease: 'expo.out',
        scrollTrigger: {
          trigger: block,
          start: 'top 80%',
          end: 'top 40%',
          toggleActions: 'play none none none',
        },
      });
    });

    /* Stat counters */
    const stats = sectionRef.current.querySelectorAll('.bio__stat-value');
    stats.forEach((stat) => {
      gsap.from(stat, {
        textContent: 0,
        duration: 1.5,
        ease: 'power2.out',
        snap: { textContent: 1 },
        scrollTrigger: {
          trigger: stat,
          start: 'top 85%',
        },
      });
    });

    /* Side image parallax */
    const img = sectionRef.current.querySelector('.bio__side-image');
    if (img) {
      gsap.to(img, {
        yPercent: -15,
        ease: 'none',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top bottom',
          end: 'bottom top',
          scrub: 1,
        },
      });
    }

  }, { scope: sectionRef });

  return (
    <section ref={sectionRef} className="bio section" id="biography">
      <div className="container">
        <span className="section-label">{bio.sectionTitle || 'Biografía'}</span>

        <div className="bio__layout">
          <div className="bio__text-col">
            <h2 className="bio__intro">{bio.intro}</h2>

            {bio.paragraphs.map((p, i) => (
              <div key={i} className="bio__block">
                <p className="bio__paragraph">
                  {p.text.split(p.highlight).map((part, j, arr) => (
                    <span key={j}>
                      {part}
                      {j < arr.length - 1 && (
                        <em className="bio__highlight">{p.highlight}</em>
                      )}
                    </span>
                  ))}
                </p>
              </div>
            ))}
          </div>

          <div className="bio__image-col">
            <div className="bio__side-image">
              <img
                src={
                  bio.bioImage &&
                  bio.bioImage !== '/images/portraits/dj1.jpg' &&
                  bio.bioImage.trim() !== ''
                    ? bio.bioImage
                    : 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=800&q=80'
                }
                alt="LOZANO en estudio"
                loading="lazy"
              />
            </div>
          </div>
        </div>

        {/* Stats row */}
        <div className="bio__stats">
          {bio.stats.map((stat, i) => (
            <div key={i} className="bio__stat">
              <span className="bio__stat-value font-display">{stat.value}</span>
              <span className="bio__stat-label font-mono">{stat.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
