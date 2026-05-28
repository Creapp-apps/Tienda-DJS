import { useSiteData } from '../../context/SiteDataContext';
import './Footer.css';

export default function Footer() {
  const { siteData } = useSiteData();
  const socials = [
    { label: 'Instagram', url: 'https://instagram.com', icon: 'IG' },
    { label: 'SoundCloud', url: 'https://soundcloud.com', icon: 'SC' },
    { label: 'Spotify', url: 'https://spotify.com', icon: 'SP' },
    { label: 'YouTube', url: 'https://youtube.com', icon: 'YT' },
  ];

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer__inner">
          <div className="footer__brand">
            {siteData.logo &&
            siteData.logo !== '/images/logo/LOGO-TRANSPARENTE.png' &&
            siteData.logo !== '/LOZANO - TRANSPARENTE BLANCO.png' &&
            siteData.logo.trim() !== '' ? (
              <img
                src={siteData.logo}
                alt={siteData.name || 'Logo'}
                className="footer__logo"
              />
            ) : (
              <span className="footer__logo-text font-display" style={{
                fontWeight: '900',
                fontSize: '1.25rem',
                letterSpacing: '0.1em',
                color: 'var(--white-pure)',
                textTransform: 'uppercase',
                display: 'block',
                marginBottom: '10px'
              }}>
                {siteData.name || 'ARTISTA'}
              </span>
            )}
            <p className="footer__tagline font-mono">{siteData.bioData.tagline || 'Electronic / Urban'}</p>
          </div>

          <div className="footer__socials">
            {socials.map((s) => (
              <a
                key={s.label}
                href={s.url}
                target="_blank"
                rel="noopener noreferrer"
                className="footer__social-link"
                aria-label={s.label}
              >
                {s.icon}
              </a>
            ))}
          </div>

          <div className="footer__legal">
            <p className="font-mono">© {new Date().getFullYear()} {siteData.name || 'ARTISTA'}. Todos los derechos reservados.</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
