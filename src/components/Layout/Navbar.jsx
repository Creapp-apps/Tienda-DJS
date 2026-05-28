import { useState, useEffect, useRef } from 'react';
import { useCart } from '../../context/CartContext';
import { useSiteData } from '../../context/SiteDataContext';
import './Navbar.css';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { toggleCart, itemCount } = useCart();
  const { siteData } = useSiteData();
  const navRef = useRef(null);

  useEffect(() => {
    let lastScroll = 0;
    const handleScroll = () => {
      const current = window.scrollY;
      setScrolled(current > 50);
      lastScroll = current;
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const links = [
    { label: 'Bio', href: '#biography' },
    { label: 'Shows', href: '#gigs' },
    { label: 'Videos', href: '#videos' },
    { label: 'Tienda', href: '#vault' },
  ];

  const handleLinkClick = (e, href) => {
    e.preventDefault();
    setMenuOpen(false);
    const el = document.querySelector(href);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <>
      <nav ref={navRef} className={`navbar ${scrolled ? 'navbar--scrolled' : ''}`}>
        <div className="navbar__inner">
          <div className="navbar__left">
            <a href="#" className="navbar__logo" onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>
              {siteData.logo &&
              siteData.logo !== '/images/logo/LOGO-TRANSPARENTE.png' &&
              siteData.logo !== '/LOZANO - TRANSPARENTE BLANCO.png' &&
              siteData.logo.trim() !== '' ? (
                <img
                  src={siteData.logo}
                  alt={siteData.name || 'Logo'}
                  className="navbar__logo-img"
                />
              ) : (
                <span className="navbar__logo-text font-display" style={{
                  fontWeight: '900',
                  fontSize: '1.25rem',
                  letterSpacing: '0.1em',
                  color: 'var(--white-pure)',
                  textTransform: 'uppercase'
                }}>
                  {siteData.name || 'ARTISTA'}
                </span>
              )}
            </a>

            {/* Music Streaming Platforms */}
            <div className="navbar__streaming">
              <a href="https://open.spotify.com" target="_blank" rel="noopener noreferrer" className="navbar__streaming-link" aria-label="Spotify" data-cursor-hover>
                <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
                  <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm4.586 14.424c-.18.295-.565.387-.86.207-2.377-1.454-5.37-1.783-8.892-.982-.336.075-.668-.135-.744-.47-.077-.337.135-.668.47-.745 3.856-.88 7.15-.494 9.822 1.14.296.18.387.563.207.86zm1.225-2.72c-.227.367-.707.487-1.074.26-2.72-1.672-6.87-2.157-10.076-1.182-.413.127-.85-.104-.977-.516-.126-.412.105-.848.517-.975 3.66-1.11 8.225-.568 11.35 1.355.367.226.488.706.26 1.073zm.106-2.833C14.77 8.87 9.53 8.697 6.496 9.617c-.476.144-.977-.123-1.12-.6-.144-.475.123-.976.6-1.12 3.5-1.06 9.27-.857 12.89 1.29.43.255.57.81.314 1.24-.254.43-.808.57-1.238.314z"/>
                </svg>
              </a>
              <a href="https://soundcloud.com" target="_blank" rel="noopener noreferrer" className="navbar__streaming-link" aria-label="SoundCloud" data-cursor-hover>
                <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
                  <path d="M11.56 16.5c0-.07.03-.13.06-.18L12.5 15c.18-.28.18-.63 0-.91l-.88-1.32c-.03-.05-.06-.11-.06-.18V8.16c0-.46.33-.84.77-.91.56-.09 1.07.29 1.12.85l.17 2.06c.02.26.19.49.44.57.57.19.98.71.98 1.33 0 .61-.41 1.14-.98 1.33-.25.08-.42.31-.44.57l-.17 2.06c-.05.56-.56.94-1.12.85-.44-.07-.77-.45-.77-.91v-4.43zm-2.92-2.52c-.44 0-.8-.36-.8-.8v-2.33c0-.44.36-.8.8-.8s.8.36.8.8v2.33c0 .44-.36.8-.8.8zm-1.87-1.2c-.44 0-.8-.36-.8-.8v-.93c0-.44.36-.8.8-.8s.8.36.8.8v.93c0 .44-.36.8-.8.8zm-1.88-.4c-.44 0-.8-.36-.8-.8v-.13c0-.44.36-.8.8-.8s.8.36.8.8v.13c0 .44-.36.8-.8.8zm14.88-.86c.03-.68.21-1.33.52-1.92.51-.97 1.5-1.63 2.65-1.63 1.08 0 2.03.58 2.55 1.45.31.52.5 1.13.52 1.78v.32H24v.2c0 2.15-1.75 3.9-3.9 3.9H13.6c-.23 0-.44-.06-.63-.16l-.07-.04v-7.8c.2-.12.44-.2.7-.2h7.82v.2c0 .61-.31 1.15-.78 1.48-.28.2-.62.32-.99.32h-1.88z"/>
                </svg>
              </a>
              <a href="https://music.apple.com" target="_blank" rel="noopener noreferrer" className="navbar__streaming-link" aria-label="Apple Music" data-cursor-hover>
                <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
                  <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm1.616 11.238c-.372.157-.75.297-1.127.424-.51.17-.61.436-.61.944v2.793c0 .914-.52 1.343-1.3 1.343-.765 0-1.285-.43-1.285-1.343v-3.79c0-.986.536-1.5 1.55-1.84 1.196-.403 2.163-.82 2.772-1.118v-1.656c0-.978-.51-1.393-1.353-1.393-.82 0-1.464.444-1.666 1.183l-.75-.246c.307-1.047 1.258-1.644 2.457-1.644 1.385 0 2.13.687 2.13 1.944v4.44c0 .324.085.495.272.495h.363v.703c-.22.043-.45.068-.667.068-.68 0-.962-.236-.962-.907v-.403z"/>
                </svg>
              </a>
              <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="navbar__streaming-link" aria-label="YouTube Music" data-cursor-hover>
                <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
                  <path d="M23.498 6.163a3.003 3.003 0 00-2.11-2.11C19.517 3.545 12 3.545 12 3.545s-7.516 0-9.387.507a3.003 3.003 0 00-2.11 2.11C0 8.033 0 12 0 12s0 3.967.502 5.837a3.003 3.003 0 002.11 2.11c1.871.507 9.387.507 9.387.507s7.517 0 9.387-.507a3.003 3.003 0 002.11-2.11C24 15.967 24 12 24 12s0-3.967-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
              </a>
            </div>
          </div>

          <div className="navbar__links">
            {links.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="navbar__link"
                onClick={(e) => handleLinkClick(e, link.href)}
              >
                <span className="navbar__link-text">{link.label}</span>
              </a>
            ))}
          </div>

          <div className="navbar__actions">
            <button className="navbar__cart" onClick={toggleCart} aria-label="Carrito">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <path d="M16 10a4 4 0 01-8 0" />
              </svg>
              {itemCount > 0 && <span className="navbar__cart-badge">{itemCount}</span>}
            </button>

            <button
              className={`navbar__hamburger ${menuOpen ? 'navbar__hamburger--open' : ''}`}
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Menu"
            >
              <span /><span /><span />
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <div className={`mobile-menu ${menuOpen ? 'mobile-menu--open' : ''}`}>
        <div className="mobile-menu__inner">
          {links.map((link, i) => (
            <a
              key={link.label}
              href={link.href}
              className="mobile-menu__link"
              style={{ transitionDelay: `${i * 80}ms` }}
              onClick={(e) => handleLinkClick(e, link.href)}
            >
              {link.label}
            </a>
          ))}
        </div>
      </div>
    </>
  );
}
