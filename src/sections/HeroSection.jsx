import { useRef, useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { useSiteData } from '../context/SiteDataContext';
import './HeroSection.css';

gsap.registerPlugin(ScrollTrigger);

export default function HeroSection() {
  const sectionRef = useRef(null);
  const titleRef = useRef(null);
  const subtitleRef = useRef(null);
  const bgImageRef = useRef(null);
  const fgImageRef = useRef(null);
  const { siteData } = useSiteData();

  const hasSilhouette = !!siteData.bioData.heroSilhouette;

  useGSAP(() => {
    if (!sectionRef.current) return;
    const tl = gsap.timeline({ defaults: { ease: 'expo.out' } });

    /* Title logo or characters entrance */
    if (titleRef.current) {
      const logoImg = titleRef.current.querySelector('.hero__logo-img');
      if (logoImg) {
        gsap.set(logoImg, { yPercent: 30, opacity: 0 });
        tl.to(logoImg, {
          yPercent: 0,
          opacity: 1,
          duration: 1.4,
          ease: 'expo.out',
          delay: 0.3,
        });
      } else {
        const chars = titleRef.current.querySelectorAll('.hero__char');
        if (chars?.length) {
          gsap.set(chars, { yPercent: 120, opacity: 0 });
          tl.to(chars, {
            yPercent: 0,
            opacity: 1,
            duration: 1.2,
            stagger: 0.04,
            delay: 0.3,
          });
        }
      }
    }

    /* Subtitle fade in */
    tl.from(subtitleRef.current, {
      y: 30,
      opacity: 0,
      duration: 0.8,
    }, '-=0.6');

    /* Image reveals */
    if (hasSilhouette && bgImageRef.current && fgImageRef.current) {
      tl.from(bgImageRef.current, {
        clipPath: 'inset(100% 0 0 0)',
        duration: 1.4,
      }, '-=1.2');
      tl.from(fgImageRef.current, {
        clipPath: 'inset(100% 0 0 0)',
        duration: 1.4,
      }, '-=1.3'); // slight lag for Awwwards pop-out feel
    } else if (bgImageRef.current) {
      tl.from(bgImageRef.current, {
        clipPath: 'inset(100% 0 0 0)',
        duration: 1.4,
      }, '-=1.2');
    }

    /* Parallax on scroll */
    if (hasSilhouette && bgImageRef.current && fgImageRef.current) {
      gsap.to(bgImageRef.current, {
        yPercent: 10,
        ease: 'none',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top top',
          end: 'bottom top',
          scrub: 1,
        },
      });
      gsap.to(fgImageRef.current, {
        yPercent: 20,
        ease: 'none',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top top',
          end: 'bottom top',
          scrub: 1,
        },
      });
    } else if (bgImageRef.current) {
      gsap.to(bgImageRef.current, {
        yPercent: 15,
        ease: 'none',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top top',
          end: 'bottom top',
          scrub: 1,
        },
      });
    }

  }, { scope: sectionRef, dependencies: [hasSilhouette] });

  /* Mouse parallax for depth */
  useEffect(() => {
    const section = sectionRef.current;
    const bg = bgImageRef.current;
    const fg = fgImageRef.current;
    const title = titleRef.current;
    if (!section) return;

    const onMove = (e) => {
      const rect = section.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;

      if (hasSilhouette && bg && fg && title) {
        gsap.to(bg, {
          x: x * 15,
          y: y * 10,
          duration: 0.8,
          ease: 'power2.out',
        });
        gsap.to(title, {
          x: x * -20,
          y: y * -15,
          duration: 0.8,
          ease: 'power2.out',
        });
        gsap.to(fg, {
          x: x * 35,
          y: y * 25,
          duration: 0.8,
          ease: 'power2.out',
        });
      } else if (bg) {
        gsap.to(bg, {
          x: x * 30,
          y: y * 20,
          duration: 0.8,
          ease: 'power2.out',
        });
      }
    };

    section.addEventListener('mousemove', onMove);
    return () => section.removeEventListener('mousemove', onMove);
  }, [hasSilhouette]);

  const logoSrc = siteData.bioData.heroLogo || siteData.logo || '/LOZANO - TRANSPARENTE BLANCO.png';
  const isCustomHeroLogo = !!siteData.bioData.heroLogo;
  const currentLogoScale = isCustomHeroLogo
    ? (siteData.bioData.heroLogoScale !== undefined ? siteData.bioData.heroLogoScale : 100)
    : (siteData.logoScale !== undefined ? siteData.logoScale : 100);

  const titleText = 'LOZANO';
  const heroImageSrc = siteData.bioData.heroImage &&
    siteData.bioData.heroImage !== '/images/portraits/djmirandocentro.jpg' &&
    siteData.bioData.heroImage.trim() !== ''
      ? siteData.bioData.heroImage
      : 'https://images.unsplash.com/photo-1571266028243-e4bb333c5e14?w=800&q=80';

  return (
    <section ref={sectionRef} className="hero" id="hero">
      <div className="hero__bg-gradient" />

      <div className="hero__content">
        {/* Portrait & Silhouette Stack */}
        <div className={`hero__image-wrap ${hasSilhouette ? 'hero__image-wrap--sandwich' : ''}`}>
          {/* Background Photo */}
          <div ref={bgImageRef} className="hero__image hero__image--bg">
            <img
              src={heroImageSrc}
              alt="LOZANO portrait"
              className="hero__portrait"
            />
          </div>

          {/* Foreground Silhouette (PNG with Transparency) */}
          {hasSilhouette && (
            <div ref={fgImageRef} className="hero__image hero__image--fg">
              <img
                src={siteData.bioData.heroSilhouette}
                alt="LOZANO silhouette"
                className="hero__portrait hero__portrait--silhouette"
              />
            </div>
          )}
        </div>

        {/* Title overlay with text masking or Vector Logo Sandwich */}
        <h1 ref={titleRef} className={`hero__title ${hasSilhouette ? 'hero__title--sandwich' : ''}`} aria-label={titleText}>
          {logoSrc ? (
            <div
              style={{
                transform: `scale(${currentLogoScale / 100}) translateY(${siteData.bioData.heroLogoYOffset !== undefined ? siteData.bioData.heroLogoYOffset : 0}px)`,
                transformOrigin: 'center center',
                display: 'inline-block',
                width: '100%',
                overflow: 'visible'
              }}
            >
              <img 
                src={logoSrc} 
                alt="LOZANO logo" 
                className="hero__logo-img" 
              />
            </div>
          ) : (
            titleText.split('').map((char, i) => (
              <span key={i} className="hero__char">{char}</span>
            ))
          )}
        </h1>

        {/* Subtitle */}
        <div ref={subtitleRef} className="hero__subtitle">
          <span className="hero__tag font-mono">{siteData.bioData.tagline}</span>
          <div className="hero__scroll-indicator">
            <span className="font-mono">Scroll</span>
            <div className="hero__scroll-line" />
          </div>
        </div>
      </div>
    </section>
  );
}
