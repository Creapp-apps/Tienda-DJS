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
            <img
              src={
                siteData.logo &&
                siteData.logo !== '/images/logo/LOGO-TRANSPARENTE.png' &&
                siteData.logo.trim() !== ''
                  ? siteData.logo
                  : '/LOZANO - TRANSPARENTE BLANCO.png'
              }
              alt="LOZANO"
              className="footer__logo"
            />
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
            <p className="font-mono">© {new Date().getFullYear()} LOZANO. Todos los derechos reservados.</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
