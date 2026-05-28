import { useState, useEffect } from 'react';
import { useSiteData } from '../../context/SiteDataContext';
import { useLenis } from 'lenis/react';
import './AdminDashboard.css';

/* High-contrast DJ, electronic, club, neon party photo assets from Unsplash */
const STOCK_PHOTOS = {
  logo: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200&q=80',
  heroPortrait: 'https://images.unsplash.com/photo-1571266028243-e4bb333c5e14?w=800&q=80', // mysterious cool DJ in shadow
  bioSide: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=800&q=80', // DJ hands on mixer, intense lighting
  gigs: [
    'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=600&q=80', // crowded lasers arena
    'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=600&q=80', // DJ controller neon
    'https://images.unsplash.com/photo-1506157786151-b8491531f063?w=600&q=80', // festival vibe
    'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&q=80', // crowd hands
    'https://images.unsplash.com/photo-1489641493513-ba4ee84ccee9?w=600&q=80', // dark stage smoke
    'https://images.unsplash.com/photo-1520110120185-6078d7a8501c?w=600&q=80', // lasers in forest festival
    'https://images.unsplash.com/photo-1516873240891-4bf014598ab4?w=600&q=80', // abstract club lights
    'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=600&q=80'  // red party smoke
  ]
};

export default function AdminDashboard() {
  const { siteData, updateSiteData, resetToDefaults } = useSiteData();
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('brand');
  const lenis = useLenis();

  /* Close/Open panel via keyboard shortcut Option + A */
  useEffect(() => {
    const handleKey = (e) => {
      if (e.altKey && e.key.toLowerCase() === 'a') {
        setIsOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  /* Lock background body scroll and stop Lenis when admin console is open to prevent double scroll */
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      if (lenis) {
        lenis.stop();
      }
    } else {
      document.body.style.overflow = '';
      if (lenis) {
        lenis.start();
      }
    }
    return () => {
      document.body.style.overflow = '';
      if (lenis) {
        lenis.start();
      }
    };
  }, [isOpen, lenis]);

  const handleTextChange = (section, field, value) => {
    updateSiteData({
      [section]: {
        ...siteData[section],
        [field]: value
      }
    });
  };
  const uploadToR2 = async (file, cleanName) => {
    try {
      const formData = new FormData();
      formData.append('file', file, cleanName || file.name);

      const artistSlug = siteData.slug || 'global';
      const res = await fetch(`/api/upload?slug=${artistSlug}`, {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) throw new Error('Error al subir archivo al servidor');
      
      const { publicUrl } = await res.json();
      return publicUrl;
    } catch (e) {
      console.error('R2 upload failed:', e);
      throw e;
    }
  };

  const compressImage = (file, callback, format = 'image/jpeg', targetName = 'asset') => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 1200;
        const MAX_HEIGHT = 1200;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          callback(event.target.result);
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(async (blob) => {
          if (!blob) {
            const fallback = format === 'image/png' 
              ? canvas.toDataURL('image/png') 
              : canvas.toDataURL('image/jpeg', 0.70);
            callback(fallback);
            return;
          }
          try {
            const cleanExt = format === 'image/png' ? 'png' : 'jpg';
            const uploadFile = new File([blob], `${targetName}.${cleanExt}`, { type: format });
            const r2Url = await uploadToR2(uploadFile, `${targetName}.${cleanExt}`);
            callback(r2Url);
          } catch (err) {
            console.warn('Fallback to Local Base64 storage due to R2 error:', err);
            const fallback = format === 'image/png' 
              ? canvas.toDataURL('image/png') 
              : canvas.toDataURL('image/jpeg', 0.70);
            callback(fallback);
          }
        }, format, format === 'image/jpeg' ? 0.70 : undefined);
      };
      img.onerror = () => {
        callback(event.target.result);
      };
    };
    reader.readAsDataURL(file);
  };

  const handleLogoUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    compressImage(file, (r2Url) => {
      updateSiteData({ logo: r2Url });
    }, 'image/png', 'logo');
  };

  const handleImageUpload = (targetKey, index = null, subIndex = null) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const file = e.target.files?.[0];
      if (!file) return;
      
      const format = (
        file.type === 'image/png' || 
        file.type === 'image/gif' ||
        targetKey === 'silhouette' || 
        targetKey === 'outroSilhouette' || 
        targetKey === 'logo' || 
        targetKey === 'heroLogo'
      ) ? 'image/png' : 'image/jpeg';

      const suffix = index !== null ? `_${index}` : '';
      const subSuffix = subIndex !== null ? `_${subIndex}` : '';
      const cleanName = `${targetKey}${suffix}${subSuffix}`;

      compressImage(file, (r2Url) => {
        if (targetKey === 'hero') {
          updateSiteData({
            bioData: { ...siteData.bioData, heroImage: r2Url }
          });
        } else if (targetKey === 'silhouette') {
          updateSiteData({
            bioData: { ...siteData.bioData, heroSilhouette: r2Url }
          });
        } else if (targetKey === 'heroLogo') {
          updateSiteData({
            bioData: { ...siteData.bioData, heroLogo: r2Url }
          });
        } else if (targetKey === 'bio') {
          updateSiteData({
            bioData: { ...siteData.bioData, bioImage: r2Url }
          });
        } else if (targetKey === 'manifesto') {
          updateSiteData({
            manifestoData: { ...siteData.manifestoData, image: r2Url }
          });
        } else if (targetKey === 'gig') {
          const nextGigs = [...siteData.gigsData];
          const currentGig = nextGigs[index];
          let gigImages = Array.isArray(currentGig.images) 
            ? [...currentGig.images] 
            : [currentGig.image || '', '', '', '', ''];
          
          while (gigImages.length < 5) gigImages.push('');
          
          if (subIndex !== null) {
            gigImages[subIndex] = r2Url;
          } else {
            gigImages[0] = r2Url;
          }
          
          nextGigs[index] = { 
            ...currentGig, 
            images: gigImages,
            image: gigImages[0] || '' 
          };
          updateSiteData({ gigsData: nextGigs });
        } else if (targetKey === 'video') {
          const nextVideos = [...siteData.videosData];
          nextVideos[index] = { ...nextVideos[index], thumbnail: r2Url };
          updateSiteData({ videosData: nextVideos });
        } else if (targetKey === 'outro') {
          updateSiteData({
            outroData: { ...siteData.outroData, image: r2Url }
          });
        } else if (targetKey === 'outroSilhouette') {
          updateSiteData({
            outroData: { ...siteData.outroData, silhouette: r2Url }
          });
        }
      }, format, cleanName);
    };
    input.click();
  };
  const handleImageDelete = (targetKey, index = null, subIndex = null) => {
    if (targetKey === 'logo') {
      updateSiteData({ logo: '' });
    } else if (targetKey === 'hero') {
      updateSiteData({
        bioData: { ...siteData.bioData, heroImage: '' }
      });
    } else if (targetKey === 'silhouette') {
      updateSiteData({
        bioData: { ...siteData.bioData, heroSilhouette: null }
      });
    } else if (targetKey === 'heroLogo') {
      updateSiteData({
        bioData: { ...siteData.bioData, heroLogo: null }
      });
    } else if (targetKey === 'bio') {
      updateSiteData({
        bioData: { ...siteData.bioData, bioImage: '' }
      });
    } else if (targetKey === 'manifesto') {
      updateSiteData({
        manifestoData: { ...siteData.manifestoData, image: '' }
      });
    } else if (targetKey === 'gig') {
      const nextGigs = [...siteData.gigsData];
      const currentGig = nextGigs[index];
      let gigImages = Array.isArray(currentGig.images) 
        ? [...currentGig.images] 
        : [currentGig.image || '', '', '', '', ''];
      
      while (gigImages.length < 5) gigImages.push('');
      
      if (subIndex !== null) {
        gigImages[subIndex] = '';
      } else {
        gigImages[0] = '';
      }
      
      nextGigs[index] = { 
        ...currentGig, 
        images: gigImages,
        image: gigImages[0] || '' 
      };
      updateSiteData({ gigsData: nextGigs });
    } else if (targetKey === 'video') {
      const nextVideos = [...siteData.videosData];
      nextVideos[index] = { ...nextVideos[index], thumbnail: '' };
      updateSiteData({ videosData: nextVideos });
    } else if (targetKey === 'outro') {
      updateSiteData({
        outroData: { ...siteData.outroData, image: '' }
      });
    } else if (targetKey === 'outroSilhouette') {
      updateSiteData({
        outroData: { ...siteData.outroData, silhouette: '' }
      });
    }
  };

  const addGig = () => {
    const newGig = {
      id: Date.now(),
      venue: 'Nuevo Club / Show',
      city: 'Ciudad, País',
      date: 'Ene 2026',
      image: '',
      images: ['', '', '', '', ''],
      description: ''
    };
    updateSiteData({ gigsData: [...(siteData.gigsData || []), newGig] });
  };

  const removeGig = (id) => {
    const nextGigs = (siteData.gigsData || []).filter((gig) => gig.id !== id);
    updateSiteData({ gigsData: nextGigs });
  };

  const addVideo = () => {
    const newVideo = {
      id: Date.now(),
      title: 'Nuevo Video / Set',
      thumbnail: '',
      videoUrl: '#',
      duration: '1:00:00',
      featured: false
    };
    updateSiteData({ videosData: [...(siteData.videosData || []), newVideo] });
  };

  const removeVideo = (id) => {
    const nextVideos = (siteData.videosData || []).filter((vid) => vid.id !== id);
    updateSiteData({ videosData: nextVideos });
  };

  const autofillStockPhotos = () => {
    updateSiteData({
      bioData: {
        ...siteData.bioData,
        heroImage: STOCK_PHOTOS.heroPortrait,
        heroSilhouette: null,
        heroLogo: null,
        bioImage: STOCK_PHOTOS.bioSide
      },
      manifestoData: {
        ...siteData.manifestoData,
        image: STOCK_PHOTOS.bioSide
      },
      gigsData: (siteData.gigsData || []).length > 0
        ? siteData.gigsData.map((gig, idx) => ({
            ...gig,
            image: STOCK_PHOTOS.gigs[idx] || STOCK_PHOTOS.gigs[0]
          }))
        : [
            { id: 1, venue: "AfterParty Buenos Aires", city: "CABA", date: "Mar 2026", image: STOCK_PHOTOS.gigs[0] },
            { id: 2, venue: "Club Viento", city: "Córdoba", date: "Feb 2026", image: STOCK_PHOTOS.gigs[1] },
            { id: 3, venue: "Mandarine Park", city: "Buenos Aires", date: "Ene 2026", image: STOCK_PHOTOS.gigs[2] },
          ],
      videosData: (siteData.videosData || []).length > 0
        ? siteData.videosData.map((vid, idx) => ({
            ...vid,
            thumbnail: STOCK_PHOTOS.gigs[(idx + 4) % 8]
          }))
        : [
            { id: 1, title: "AfterParty Buenos Aires — Live Set", thumbnail: STOCK_PHOTOS.gigs[4], videoUrl: "#", duration: "1:23:45", featured: true },
            { id: 2, title: "Club Viento — Opening Set", thumbnail: STOCK_PHOTOS.gigs[5], videoUrl: "#", duration: "58:30", featured: false },
            { id: 3, title: "Mandarine Park — Main Stage", thumbnail: STOCK_PHOTOS.gigs[6], videoUrl: "#", duration: "1:45:00", featured: false },
          ]
    });
  };

  return (
    <>
      {/* Floating activation pill */}
      <button
        className="admin-pill font-mono"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Abrir consola de contenidos"
        data-cursor-hover
      >
        <span>🛠 CONSOLA DE CONTENIDOS</span>
      </button>

      {/* Slide-Up Control Center */}
      <div 
        className={`admin-console ${isOpen ? 'admin-console--open' : ''}`}
        onWheel={(e) => e.stopPropagation()}
      >
        <header className="admin-console__header">
          <div className="admin-console__title-wrap" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <span className="admin-console__accent font-mono">[CONSOLE_V1]</span>
            <h2 className="admin-console__title font-display">Consola de contenidos</h2>
            
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: 'rgba(16, 185, 129, 0.08)',
              border: '1px solid rgba(16, 185, 129, 0.2)',
              borderRadius: '20px',
              padding: '6px 14px',
              color: '#10b981',
              fontSize: '0.75rem',
              fontWeight: '700',
              letterSpacing: '0.05em'
            }} className="font-mono">
              <span className="sync-dot-pulse" style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                background: '#10b981',
                boxShadow: '0 0 8px #10b981',
                display: 'inline-block'
              }}></span>
              AUTOSAVE ACTIVO (NUBE)
            </div>
          </div>

          <div className="admin-console__actions">
            <button
              className="admin-action-btn admin-action-btn--glow font-mono"
              onClick={autofillStockPhotos}
            >
              ⚡ AUTO-COMPLETAR FOTOS DJ
            </button>
            <button
              className="admin-action-btn font-mono"
              onClick={resetToDefaults}
            >
              RESETEAR
            </button>
            <button
              className="admin-console__close font-mono"
              onClick={() => setIsOpen(false)}
            >
              ✕ MINIMIZAR
            </button>
          </div>
        </header>

        <div className="admin-console__body">
          {/* Sub Navigation */}
          <nav className="admin-console__nav">
            <button
              className={`admin-nav-btn font-mono ${activeTab === 'brand' ? 'admin-nav-btn--active' : ''}`}
              onClick={() => setActiveTab('brand')}
            >
              IDENTIDAD & LOGO
            </button>
            <button
              className={`admin-nav-btn font-mono ${activeTab === 'hero-bio' ? 'admin-nav-btn--active' : ''}`}
              onClick={() => setActiveTab('hero-bio')}
            >
              HERO & BIOGRAFÍA
            </button>
            <button
              className={`admin-nav-btn font-mono ${activeTab === 'manifesto' ? 'admin-nav-btn--active' : ''}`}
              onClick={() => setActiveTab('manifesto')}
            >
              RIDER TÉCNICO
            </button>
            <button
              className={`admin-nav-btn font-mono ${activeTab === 'gigs' ? 'admin-nav-btn--active' : ''}`}
              onClick={() => setActiveTab('gigs')}
            >
              CARRUSEL & GIGS
            </button>
            <button
              className={`admin-nav-btn font-mono ${activeTab === 'videos' ? 'admin-nav-btn--active' : ''}`}
              onClick={() => setActiveTab('videos')}
            >
              VIDEOS
            </button>
            <button
              className={`admin-nav-btn font-mono ${activeTab === 'vault' ? 'admin-nav-btn--active' : ''}`}
              onClick={() => setActiveTab('vault')}
            >
              VAULT TRACKS
            </button>
            <button
              className={`admin-nav-btn font-mono ${activeTab === 'outro' ? 'admin-nav-btn--active' : ''}`}
              onClick={() => setActiveTab('outro')}
            >
              OUTRO & CONTACTO
            </button>
            <button
              className={`admin-nav-btn font-mono ${activeTab === 'backup' ? 'admin-nav-btn--active' : ''}`}
              onClick={() => setActiveTab('backup')}
              style={{ borderLeft: '2px solid var(--neon-magenta)', color: 'var(--neon-magenta)' }}
            >
              💾 RESPALDO JSON
            </button>
          </nav>

          {/* Tab Contents */}
          <div className="admin-console__content">
            {activeTab === 'brand' && (
              <div className="admin-form">

                <div className="admin-field">
                  <label className="font-mono">Logotipo Principal (PNG/SVG recomendado)</label>
                  <div className="admin-file-wrapper">
                    <input
                      type="file"
                      accept="image/*"
                      id="logo-upload"
                      onChange={handleLogoUpload}
                      style={{ display: 'none' }}
                    />
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                      <label htmlFor="logo-upload" className="admin-upload-box font-mono" data-cursor-hover style={{ margin: 0 }}>
                        {siteData.logo && siteData.logo.trim() !== '' ? '✓ Logo Cargado (Cambiar)' : 'Subir Imagen de Logo'}
                      </label>
                      {siteData.logo && siteData.logo.trim() !== '' && (
                        <button
                          className="admin-delete-btn font-mono"
                          onClick={() => handleImageDelete('logo')}
                        >
                          ELIMINAR
                        </button>
                      )}
                    </div>
                    {siteData.logo && siteData.logo.trim() !== '' && (
                      <div className="admin-logo-preview">
                        <img src={siteData.logo} alt="Preview" />
                      </div>
                    )}

                    {/* Dynamic main logo scale range slider */}
                    <div style={{ marginTop: '15px', maxWidth: '400px' }}>
                      <label className="font-mono" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '0.65rem', color: 'var(--white-muted)' }}>
                        <span>ESCALADO DEL LOGOTIPO (NAVBAR / HERO)</span>
                        <span style={{ color: 'var(--neon-magenta)', fontWeight: 'bold' }}>{siteData.logoScale !== undefined ? siteData.logoScale : 100}%</span>
                      </label>
                      <input
                        type="range"
                        min="30"
                        max="250"
                        value={siteData.logoScale !== undefined ? siteData.logoScale : 100}
                        onChange={(e) => updateSiteData({ logoScale: parseInt(e.target.value) })}
                        style={{
                          width: '100%',
                          accentColor: 'var(--neon-magenta)',
                          background: 'rgba(255, 255, 255, 0.1)',
                          height: '4px',
                          borderRadius: '2px',
                          cursor: 'pointer',
                          outline: 'none'
                        }}
                      />
                    </div>

                    {/* Dynamic main logo vertical offset slider */}
                    <div style={{ marginTop: '15px', maxWidth: '400px' }}>
                      <label className="font-mono" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '0.65rem', color: 'var(--white-muted)' }}>
                        <span>POSICIÓN VERTICAL DEL LOGO (HERO)</span>
                        <span style={{ color: 'var(--neon-magenta)', fontWeight: 'bold' }}>{siteData.bioData.heroLogoYOffset !== undefined ? siteData.bioData.heroLogoYOffset : 0}px</span>
                      </label>
                      <input
                        type="range"
                        min="-150"
                        max="350"
                        value={siteData.bioData.heroLogoYOffset !== undefined ? siteData.bioData.heroLogoYOffset : 0}
                        onChange={(e) => handleTextChange('bioData', 'heroLogoYOffset', parseInt(e.target.value))}
                        style={{
                          width: '100%',
                          accentColor: 'var(--neon-magenta)',
                          background: 'rgba(255, 255, 255, 0.1)',
                          height: '4px',
                          borderRadius: '2px',
                          cursor: 'pointer',
                          outline: 'none'
                        }}
                      />
                    </div>
                  </div>
                </div>

                <div className="admin-field">
                  <label className="font-mono">Copiar URL / Base64</label>
                  <input
                    type="text"
                    value={siteData.logo}
                    onChange={(e) => updateSiteData({ logo: e.target.value })}
                    className="admin-input font-mono"
                  />
                </div>
              </div>
            )}

            {activeTab === 'hero-bio' && (
              <div className="admin-form admin-form--split">
                <div className="admin-form__column">
                  <h3 className="admin-subtitle font-display">Hero Content</h3>
                  <div className="admin-field">
                    <label className="font-mono">Tagline Musical</label>
                    <input
                      type="text"
                      value={siteData.bioData.tagline || ''}
                      onChange={(e) => handleTextChange('bioData', 'tagline', e.target.value)}
                      className="admin-input"
                    />
                  </div>

                  <div className="admin-field">
                    <label className="font-mono">Imagen Retrato Principal (Hero)</label>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <button
                        className="admin-upload-box font-mono"
                        onClick={() => handleImageUpload('hero')}
                        style={{ flex: 1, margin: 0 }}
                      >
                        {siteData.bioData.heroImage ? '✓ Cambiar Retrato' : 'Subir Retrato Principal'}
                      </button>
                      {siteData.bioData.heroImage && (
                        <button
                          className="admin-delete-btn font-mono"
                          onClick={() => handleImageDelete('hero')}
                        >
                          ELIMINAR
                        </button>
                      )}
                    </div>
                    {siteData.bioData.heroImage && (
                      <img src={siteData.bioData.heroImage} alt="Hero portrait preview" className="admin-img-preview" />
                    )}
                  </div>
                  
                  <div className="admin-field">
                    <label className="font-mono">Silueta Recortada (PNG Transparente)</label>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <button
                        className="admin-upload-box font-mono"
                        onClick={() => handleImageUpload('silhouette')}
                        style={{ flex: 1, margin: 0 }}
                      >
                        {siteData.bioData.heroSilhouette ? '✓ Cambiar Silueta Recortada' : 'Subir Silueta PNG'}
                      </button>
                      {siteData.bioData.heroSilhouette && (
                        <button
                          className="admin-delete-btn font-mono"
                          onClick={() => handleImageDelete('silhouette')}
                        >
                          ELIMINAR
                        </button>
                      )}
                    </div>
                    {siteData.bioData.heroSilhouette && (
                      <img src={siteData.bioData.heroSilhouette} alt="Silhouette preview" className="admin-img-preview" />
                    )}
                  </div>

                  <div className="admin-field">
                    <label className="font-mono">Logotipo Central (Hero Vector Sandwich)</label>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <button
                        className="admin-upload-box font-mono"
                        onClick={() => handleImageUpload('heroLogo')}
                        style={{ flex: 1, margin: 0 }}
                      >
                        {siteData.bioData.heroLogo ? '✓ Cambiar Logotipo Central' : 'Subir Logotipo Vector (PNG)'}
                      </button>
                      {siteData.bioData.heroLogo && (
                        <button
                          className="admin-delete-btn font-mono"
                          onClick={() => handleImageDelete('heroLogo')}
                        >
                          ELIMINAR
                        </button>
                      )}
                    </div>
                    {siteData.bioData.heroLogo && (
                      <div className="admin-img-preview admin-img-preview--logo-box" style={{ background: '#111', padding: '10px', display: 'flex', justifyContent: 'center', borderRadius: '4px', border: '1px solid #333' }}>
                        <img src={siteData.bioData.heroLogo} alt="Hero logo preview" style={{ maxHeight: '60px', objectFit: 'contain' }} />
                      </div>
                    )}
                    
                    {/* Dynamic logo scale range slider */}
                    <div style={{ marginTop: '12px' }}>
                      <label className="font-mono" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '0.6rem', color: 'var(--white-muted)' }}>
                        <span>ESCALADO DEL LOGOTIPO</span>
                        <span style={{ color: 'var(--neon-magenta)', fontWeight: 'bold' }}>{siteData.bioData.heroLogoScale !== undefined ? siteData.bioData.heroLogoScale : 100}%</span>
                      </label>
                      <input
                        type="range"
                        min="30"
                        max="250"
                        value={siteData.bioData.heroLogoScale !== undefined ? siteData.bioData.heroLogoScale : 100}
                        onChange={(e) => handleTextChange('bioData', 'heroLogoScale', parseInt(e.target.value))}
                        style={{
                          width: '100%',
                          accentColor: 'var(--neon-magenta)',
                          background: 'rgba(255, 255, 255, 0.1)',
                          height: '4px',
                          borderRadius: '2px',
                          cursor: 'pointer',
                          outline: 'none'
                        }}
                      />
                    </div>

                    {/* Dynamic logo vertical offset range slider */}
                    <div style={{ marginTop: '12px' }}>
                      <label className="font-mono" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '0.6rem', color: 'var(--white-muted)' }}>
                        <span>POSICIÓN VERTICAL DEL LOGO</span>
                        <span style={{ color: 'var(--neon-magenta)', fontWeight: 'bold' }}>{siteData.bioData.heroLogoYOffset !== undefined ? siteData.bioData.heroLogoYOffset : 0}px</span>
                      </label>
                      <input
                        type="range"
                        min="-150"
                        max="350"
                        value={siteData.bioData.heroLogoYOffset !== undefined ? siteData.bioData.heroLogoYOffset : 0}
                        onChange={(e) => handleTextChange('bioData', 'heroLogoYOffset', parseInt(e.target.value))}
                        style={{
                          width: '100%',
                          accentColor: 'var(--neon-magenta)',
                          background: 'rgba(255, 255, 255, 0.1)',
                          height: '4px',
                          borderRadius: '2px',
                          cursor: 'pointer',
                          outline: 'none'
                        }}
                      />
                    </div>
                  </div>
                </div>

                <div className="admin-form__column">
                  <h3 className="admin-subtitle font-display">Bio Narrativa</h3>
                  <div className="admin-field">
                    <label className="font-mono">Título de la Sección (Biografía)</label>
                    <input
                      type="text"
                      value={siteData.bioData.sectionTitle || 'Biografía'}
                      onChange={(e) => handleTextChange('bioData', 'sectionTitle', e.target.value)}
                      className="admin-input"
                    />
                  </div>

                  <div className="admin-field">
                    <label className="font-mono">Intro destacada</label>
                    <textarea
                      value={siteData.bioData.intro || ''}
                      onChange={(e) => handleTextChange('bioData', 'intro', e.target.value)}
                      className="admin-input"
                      rows={2}
                    />
                  </div>

                  <div className="admin-field">
                    <label className="font-mono">Párrafo 1 de la Biografía</label>
                    <textarea
                      value={siteData.bioData?.paragraphs?.[0]?.text || ''}
                      onChange={(e) => {
                        const newParagraphs = [...(siteData.bioData?.paragraphs || [])];
                        newParagraphs[0] = { ...newParagraphs[0], text: e.target.value };
                        handleTextChange('bioData', 'paragraphs', newParagraphs);
                      }}
                      className="admin-input"
                      rows={2}
                    />
                  </div>
                  <div className="admin-field" style={{ marginTop: '-8px' }}>
                    <label className="font-mono" style={{ fontSize: '0.55rem', color: 'var(--neon-magenta)' }}>Texto Destacado (Párrafo 1)</label>
                    <input
                      type="text"
                      value={siteData.bioData?.paragraphs?.[0]?.highlight || ''}
                      onChange={(e) => {
                        const newParagraphs = [...(siteData.bioData?.paragraphs || [])];
                        newParagraphs[0] = { ...newParagraphs[0], highlight: e.target.value };
                        handleTextChange('bioData', 'paragraphs', newParagraphs);
                      }}
                      className="admin-input"
                      style={{ padding: '6px 10px', fontSize: '0.75rem' }}
                    />
                  </div>

                  <div className="admin-field">
                    <label className="font-mono">Párrafo 2 de la Biografía</label>
                    <textarea
                      value={siteData.bioData?.paragraphs?.[1]?.text || ''}
                      onChange={(e) => {
                        const newParagraphs = [...(siteData.bioData?.paragraphs || [])];
                        newParagraphs[1] = { ...newParagraphs[1], text: e.target.value };
                        handleTextChange('bioData', 'paragraphs', newParagraphs);
                      }}
                      className="admin-input"
                      rows={2}
                    />
                  </div>
                  <div className="admin-field" style={{ marginTop: '-8px' }}>
                    <label className="font-mono" style={{ fontSize: '0.55rem', color: 'var(--neon-magenta)' }}>Texto Destacado (Párrafo 2)</label>
                    <input
                      type="text"
                      value={siteData.bioData?.paragraphs?.[1]?.highlight || ''}
                      onChange={(e) => {
                        const newParagraphs = [...(siteData.bioData?.paragraphs || [])];
                        newParagraphs[1] = { ...newParagraphs[1], highlight: e.target.value };
                        handleTextChange('bioData', 'paragraphs', newParagraphs);
                      }}
                      className="admin-input"
                      style={{ padding: '6px 10px', fontSize: '0.75rem' }}
                    />
                  </div>

                  <div className="admin-field">
                    <label className="font-mono">Imagen Lateral (Bio)</label>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <button
                        className="admin-upload-box font-mono"
                        onClick={() => handleImageUpload('bio')}
                        style={{ flex: 1, margin: 0 }}
                      >
                        {siteData.bioData.bioImage ? '✓ Cambiar Imagen Bio' : 'Subir Imagen Lateral'}
                      </button>
                      {siteData.bioData.bioImage && (
                        <button
                          className="admin-delete-btn font-mono"
                          onClick={() => handleImageDelete('bio')}
                        >
                          ELIMINAR
                        </button>
                      )}
                    </div>
                    {siteData.bioData.bioImage && (
                      <img src={siteData.bioData.bioImage} alt="Bio preview" className="admin-img-preview" />
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'manifesto' && (
              <div className="admin-form admin-form--split">
                <div className="admin-form__column">
                  <h3 className="admin-subtitle font-display">Rider Técnico</h3>
                  <div className="admin-field">
                    <label className="font-mono">Título de la Sección</label>
                    <input
                      type="text"
                      value={siteData.manifestoData?.sectionTitle || ''}
                      onChange={(e) => handleTextChange('manifestoData', 'sectionTitle', e.target.value)}
                      className="admin-input"
                    />
                  </div>

                  <div className="admin-field">
                    <label className="font-mono">Tagline</label>
                    <input
                      type="text"
                      value={siteData.manifestoData?.tagline || ''}
                      onChange={(e) => handleTextChange('manifestoData', 'tagline', e.target.value)}
                      className="admin-input"
                    />
                  </div>

                  <div className="admin-field">
                    <label className="font-mono">Introducción Destacada</label>
                    <textarea
                      value={siteData.manifestoData?.intro || ''}
                      onChange={(e) => handleTextChange('manifestoData', 'intro', e.target.value)}
                      className="admin-input"
                      rows={3}
                    />
                  </div>
                </div>

                <div className="admin-form__column">
                  <h3 className="admin-subtitle font-display">Especificaciones & Cabina</h3>
                  <div className="admin-field">
                    <label className="font-mono">Párrafo 1 (Requerimientos de Hardware)</label>
                    <textarea
                      value={siteData.manifestoData?.paragraphs?.[0]?.text || ''}
                      onChange={(e) => {
                        const newParagraphs = [...(siteData.manifestoData?.paragraphs || [])];
                        newParagraphs[0] = { ...newParagraphs[0], text: e.target.value };
                        handleTextChange('manifestoData', 'paragraphs', newParagraphs);
                      }}
                      className="admin-input"
                      rows={2}
                    />
                  </div>
                  <div className="admin-field" style={{ marginTop: '-8px' }}>
                    <label className="font-mono" style={{ fontSize: '0.55rem', color: 'var(--neon-magenta)' }}>Texto Destacado (Párrafo 1)</label>
                    <input
                      type="text"
                      value={siteData.manifestoData?.paragraphs?.[0]?.highlight || ''}
                      onChange={(e) => {
                        const newParagraphs = [...(siteData.manifestoData?.paragraphs || [])];
                        newParagraphs[0] = { ...newParagraphs[0], highlight: e.target.value };
                        handleTextChange('manifestoData', 'paragraphs', newParagraphs);
                      }}
                      className="admin-input"
                      style={{ padding: '6px 10px', fontSize: '0.75rem' }}
                    />
                  </div>

                  <div className="admin-field">
                    <label className="font-mono">Párrafo 2 (Monitoreo & Soporte)</label>
                    <textarea
                      value={siteData.manifestoData?.paragraphs?.[1]?.text || ''}
                      onChange={(e) => {
                        const newParagraphs = [...(siteData.manifestoData?.paragraphs || [])];
                        newParagraphs[1] = { ...newParagraphs[1], text: e.target.value };
                        handleTextChange('manifestoData', 'paragraphs', newParagraphs);
                      }}
                      className="admin-input"
                      rows={2}
                    />
                  </div>
                  <div className="admin-field" style={{ marginTop: '-8px' }}>
                    <label className="font-mono" style={{ fontSize: '0.55rem', color: 'var(--neon-magenta)' }}>Texto Destacado (Párrafo 2)</label>
                    <input
                      type="text"
                      value={siteData.manifestoData?.paragraphs?.[1]?.highlight || ''}
                      onChange={(e) => {
                        const newParagraphs = [...(siteData.manifestoData?.paragraphs || [])];
                        newParagraphs[1] = { ...newParagraphs[1], highlight: e.target.value };
                        handleTextChange('manifestoData', 'paragraphs', newParagraphs);
                      }}
                      className="admin-input"
                      style={{ padding: '6px 10px', fontSize: '0.75rem' }}
                    />
                  </div>

                  <div className="admin-field">
                    <label className="font-mono">Imagen Lateral (Manifiesto)</label>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <button
                        className="admin-upload-box font-mono"
                        onClick={() => handleImageUpload('manifesto')}
                        style={{ flex: 1, margin: 0 }}
                      >
                        {siteData.manifestoData?.image ? '✓ Cambiar Imagen' : 'Subir Imagen'}
                      </button>
                      {siteData.manifestoData?.image && (
                        <button
                          className="admin-delete-btn font-mono"
                          onClick={() => handleImageDelete('manifesto')}
                        >
                          ELIMINAR
                        </button>
                      )}
                    </div>
                    {siteData.manifestoData?.image && (
                      <img src={siteData.manifestoData.image} alt="Manifesto preview" className="admin-img-preview" />
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'gigs' && (
              <div className="admin-gigs-section">
                <div className="admin-gigs-header">
                  <h3 className="admin-subtitle font-display" style={{ margin: 0 }}>
                    Carrusel de Fotografías (Sección Gigs)
                  </h3>
                  <button
                    className="admin-btn-primary font-mono"
                    onClick={addGig}
                  >
                    ➕ AGREGAR NUEVO SHOW
                  </button>
                </div>

                <div className="admin-gigs-list">
                  {(siteData.gigsData || []).map((gig, idx) => (
                    <div key={gig.id} className="admin-gig-card">
                      <div className="admin-gig-card__media-grid">
                        <label className="admin-label font-mono" style={{ display: 'block', marginBottom: '8px', color: 'var(--neon-magenta)', fontSize: '0.6rem' }}>
                          Fotos del Show (Máx 5 — Foto 1 es la principal de portada)
                        </label>
                        <div className="admin-gig-photos-grid">
                          {[0, 1, 2, 3, 4].map((subIdx) => {
                            const gigImages = Array.isArray(gig.images)
                              ? gig.images
                              : [gig.image || '', '', '', '', ''];
                            const imgVal = gigImages[subIdx] || '';
                            return (
                              <div key={subIdx} className="admin-gig-photo-slot">
                                <div className="admin-gallery__img-box mini-box">
                                  {imgVal ? (
                                    <img src={imgVal} alt={`Foto ${subIdx + 1}`} />
                                  ) : (
                                    <div className="admin-gallery__placeholder mini font-mono">
                                      <span>[ FOTO {subIdx + 1} ]</span>
                                    </div>
                                  )}
                                  <div className="admin-gallery__replace-btn mini">
                                    <button
                                      className="admin-gallery__btn font-mono"
                                      onClick={() => handleImageUpload('gig', idx, subIdx)}
                                    >
                                      {imgVal ? 'CAMBIAR' : 'SUBIR'}
                                    </button>
                                    {imgVal && (
                                      <button
                                        className="admin-gallery__btn admin-gallery__btn--delete font-mono"
                                        onClick={() => handleImageDelete('gig', idx, subIdx)}
                                      >
                                        BORRAR
                                      </button>
                                    )}
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      <div className="admin-gig-card__fields">
                        <div className="admin-form__group">
                          <label className="admin-label font-mono">Nombre / Club</label>
                          <input
                            type="text"
                            value={gig.venue}
                            onChange={(e) => {
                              const nextGigs = [...siteData.gigsData];
                              nextGigs[idx] = { ...nextGigs[idx], venue: e.target.value };
                              updateSiteData({ gigsData: nextGigs });
                            }}
                            className="admin-input"
                            placeholder="Ej: Crobar Club"
                          />
                        </div>

                        <div className="admin-form__group">
                          <label className="admin-label font-mono">Fecha del Gig</label>
                          <input
                            type="text"
                            value={gig.date}
                            onChange={(e) => {
                              const nextGigs = [...siteData.gigsData];
                              nextGigs[idx] = { ...nextGigs[idx], date: e.target.value };
                              updateSiteData({ gigsData: nextGigs });
                            }}
                            className="admin-input"
                            placeholder="Ej: Ene 2026"
                          />
                        </div>

                        <div className="admin-form__group">
                          <label className="admin-label font-mono">Ciudad / País</label>
                          <input
                            type="text"
                            value={gig.city}
                            onChange={(e) => {
                              const nextGigs = [...siteData.gigsData];
                              nextGigs[idx] = { ...nextGigs[idx], city: e.target.value };
                              updateSiteData({ gigsData: nextGigs });
                            }}
                            className="admin-input"
                            placeholder="Ej: Buenos Aires, AR"
                          />
                        </div>

                        <div className="admin-form__group admin-gig-card__fields-full">
                          <label className="admin-label font-mono">Descripción del Show</label>
                          <textarea
                            value={gig.description || ''}
                            onChange={(e) => {
                              const nextGigs = [...siteData.gigsData];
                              nextGigs[idx] = { ...nextGigs[idx], description: e.target.value };
                              updateSiteData({ gigsData: nextGigs });
                            }}
                            className="admin-input"
                            style={{ resize: 'vertical', minHeight: '60px' }}
                            placeholder="Ej: Show principal y apertura del festival, con set extendido de 3 horas..."
                          />
                        </div>
                      </div>

                      <div className="admin-gig-card__actions">
                        <button
                          className="admin-btn-danger-outline font-mono"
                          onClick={() => removeGig(gig.id)}
                        >
                          ELIMINAR SHOW
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'videos' && (
              <div className="admin-form">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                  <h3 className="admin-subtitle font-display" style={{ margin: 0 }}>Videos & Sets (Media Center)</h3>
                  <button
                    type="button"
                    className="admin-action-btn admin-action-btn--add font-mono"
                    onClick={addVideo}
                  >
                    ➕ AGREGAR NUEVO VIDEO
                  </button>
                </div>

                <div className="admin-gigs-list">
                  {(siteData.videosData || []).map((vid, idx) => (
                    <div key={vid.id} className="admin-gig-card">
                      {/* Media (Thumbnail) */}
                      <div className="admin-gig-card__media" style={{ width: '160px' }}>
                        <label className="admin-label font-mono" style={{ display: 'block', marginBottom: '8px', color: 'var(--neon-magenta)', fontSize: '0.6rem' }}>
                          Miniatura del Video
                        </label>
                        <div className="admin-gallery__img-box" style={{ height: '100px', width: '100%' }}>
                          {vid.thumbnail ? (
                            <img src={vid.thumbnail} alt={vid.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          ) : (
                            <div className="admin-gallery__placeholder font-mono" style={{ fontSize: '0.55rem' }}>
                              <span>[ SIN FOTO ]</span>
                            </div>
                          )}
                          <div className="admin-gallery__replace-btn">
                            <button
                              type="button"
                              className="admin-gallery__btn font-mono"
                              onClick={() => handleImageUpload('video', idx)}
                            >
                              {vid.thumbnail ? 'CAMBIAR' : 'SUBIR'}
                            </button>
                            {vid.thumbnail && (
                              <button
                                type="button"
                                className="admin-gallery__btn admin-gallery__btn--delete font-mono"
                                onClick={() => handleImageDelete('video', idx)}
                              >
                                ELIMINAR
                              </button>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Fields */}
                      <div className="admin-gig-card__fields">
                        <div className="admin-form__group">
                          <label className="admin-label font-mono">Título del Video / Set</label>
                          <input
                            type="text"
                            value={vid.title || ''}
                            onChange={(e) => {
                              const nextVideos = [...siteData.videosData];
                              nextVideos[idx] = { ...nextVideos[idx], title: e.target.value };
                              updateSiteData({ videosData: nextVideos });
                            }}
                            className="admin-input"
                            placeholder="Ej: Club Viento — Opening Set"
                          />
                        </div>

                        <div className="admin-form__group">
                          <label className="admin-label font-mono">Duración</label>
                          <input
                            type="text"
                            value={vid.duration || ''}
                            onChange={(e) => {
                              const nextVideos = [...siteData.videosData];
                              nextVideos[idx] = { ...nextVideos[idx], duration: e.target.value };
                              updateSiteData({ videosData: nextVideos });
                            }}
                            className="admin-input"
                            placeholder="Ej: 1:20:00"
                          />
                        </div>

                        <div className="admin-form__group" style={{ gridColumn: 'span 2' }}>
                          <label className="admin-label font-mono">Enlace de Video (URL)</label>
                          <input
                            type="text"
                            value={vid.videoUrl || ''}
                            onChange={(e) => {
                              const nextVideos = [...siteData.videosData];
                              nextVideos[idx] = { ...nextVideos[idx], videoUrl: e.target.value };
                              updateSiteData({ videosData: nextVideos });
                            }}
                            className="admin-input"
                            placeholder="Ej: https://youtube.com/watch?v=..."
                          />
                        </div>

                        <div className="admin-form__group admin-gig-card__fields-full" style={{ display: 'flex', alignItems: 'center', marginTop: '4px' }}>
                          <label className="admin-checkbox-label font-mono" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', userSelect: 'none', color: 'var(--white-ghost)', fontSize: '0.65rem' }}>
                            <input
                              type="checkbox"
                              checked={vid.featured || false}
                              onChange={(e) => {
                                const nextVideos = [...siteData.videosData];
                                nextVideos[idx] = { ...nextVideos[idx], featured: e.target.checked };
                                updateSiteData({ videosData: nextVideos });
                              }}
                              style={{ width: 'auto', margin: 0 }}
                            />
                            <span>Celda Ancha (Destacado en el Media Center)</span>
                          </label>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="admin-gig-card__actions">
                        <button
                          type="button"
                          className="admin-btn-danger-outline font-mono"
                          onClick={() => removeVideo(vid.id)}
                        >
                          ELIMINAR VIDEO
                        </button>
                      </div>
                    </div>
                  ))}

                  {(siteData.videosData || []).length === 0 && (
                    <div className="admin-empty-state font-mono">
                      No hay videos cargados. Haz clic en "➕ AGREGAR NUEVO VIDEO" o "AUTO-COMPLETAR" para comenzar.
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'vault' && (
              <div className="admin-form">
                <h3 className="admin-subtitle font-display">Tracks de la Bóveda (Tienda)</h3>
                <div className="admin-table-wrapper">
                  <table className="admin-table">
                    <thead>
                      <tr className="font-mono">
                        <th>Título</th>
                        <th>Tipo</th>
                        <th>BPM</th>
                        <th>Precio ($)</th>
                        <th>Color de Resplandor</th>
                      </tr>
                    </thead>
                    <tbody>
                      {siteData.tracksData.map((track, idx) => (
                        <tr key={track.id}>
                          <td>
                            <input
                              type="text"
                              value={track.title}
                              onChange={(e) => {
                                const nextTracks = [...siteData.tracksData];
                                nextTracks[idx] = { ...nextTracks[idx], title: e.target.value };
                                updateSiteData({ tracksData: nextTracks });
                              }}
                              className="admin-table-input"
                            />
                          </td>
                          <td>
                            <select
                              value={track.type}
                              onChange={(e) => {
                                const nextTracks = [...siteData.tracksData];
                                nextTracks[idx] = { ...nextTracks[idx], type: e.target.value };
                                updateSiteData({ tracksData: nextTracks });
                              }}
                              className="admin-table-input font-mono"
                            >
                              <option value="Edit">Edit</option>
                              <option value="Remix Pack">Remix Pack</option>
                              <option value="Extended">Extended</option>
                              <option value="Sample Pack">Sample Pack</option>
                            </select>
                          </td>
                          <td>
                            <input
                              type="number"
                              value={track.bpm}
                              onChange={(e) => {
                                const nextTracks = [...siteData.tracksData];
                                nextTracks[idx] = { ...nextTracks[idx], bpm: parseInt(e.target.value) || 120 };
                                updateSiteData({ tracksData: nextTracks });
                              }}
                              className="admin-table-input font-mono"
                              style={{ width: '60px' }}
                            />
                          </td>
                          <td>
                            <input
                              type="number"
                              value={track.price}
                              onChange={(e) => {
                                const nextTracks = [...siteData.tracksData];
                                nextTracks[idx] = { ...nextTracks[idx], price: parseInt(e.target.value) || 0 };
                                updateSiteData({ tracksData: nextTracks });
                              }}
                              className="admin-table-input font-mono"
                              style={{ width: '80px' }}
                            />
                          </td>
                          <td>
                            <input
                              type="color"
                              value={track.coverColor}
                              onChange={(e) => {
                                const nextTracks = [...siteData.tracksData];
                                nextTracks[idx] = { ...nextTracks[idx], coverColor: e.target.value };
                                updateSiteData({ tracksData: nextTracks });
                              }}
                              className="admin-color-picker"
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'outro' && (
              <div className="admin-form">
                <div className="admin-field">
                  <label className="font-mono">Título del Outro</label>
                  <input
                    type="text"
                    value={siteData.outroData?.title || ''}
                    onChange={(e) => {
                      updateSiteData({
                        outroData: { ...siteData.outroData, title: e.target.value }
                      });
                    }}
                    className="admin-input"
                    placeholder="THE SOUND EXPERIENCE"
                  />
                </div>

                <div className="admin-field">
                  <label className="font-mono">Subtítulo / Mensaje de Despedida</label>
                  <textarea
                    value={siteData.outroData?.subtitle || ''}
                    onChange={(e) => {
                      updateSiteData({
                        outroData: { ...siteData.outroData, subtitle: e.target.value }
                      });
                    }}
                    className="admin-textarea"
                    placeholder="¿Listo para llevar los sets híbridos de LOZANO a tu festival, club o evento privado?"
                    rows={3}
                  />
                </div>

                <div className="admin-field" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                  <div>
                    <label className="font-mono">Foto de Despedida (PNG/JPG recomendado)</label>
                    <div className="admin-file-wrapper">
                      {siteData.outroData?.image && (
                        <div className="admin-preview-img-wrap" style={{ marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '15px' }}>
                          <img 
                            src={siteData.outroData.image} 
                            alt="Outro Preview" 
                            className="admin-preview-img" 
                            style={{ height: '50px', width: 'auto', borderRadius: '4px', objectFit: 'contain', background: '#0e0e0e', padding: '4px', border: '1px solid rgba(255,255,255,0.08)' }}
                          />
                          <button 
                            onClick={() => handleImageDelete('outro')}
                            className="admin-delete-btn font-mono"
                            style={{ background: '#ef4444', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '4px', fontSize: '0.7rem', cursor: 'pointer' }}
                          >
                            ELIMINAR
                          </button>
                        </div>
                      )}
                      <button 
                        onClick={() => handleImageUpload('outro')}
                        className="admin-upload-btn font-mono"
                      >
                        SUBIR LOGO/FOTO
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="font-mono">Silueta del Artista (PNG transparente recomendado)</label>
                    <div className="admin-file-wrapper">
                      {siteData.outroData?.silhouette && (
                        <div className="admin-preview-img-wrap" style={{ marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '15px' }}>
                          <img 
                            src={siteData.outroData.silhouette} 
                            alt="Silhouette Preview" 
                            className="admin-preview-img" 
                            style={{ height: '50px', width: 'auto', borderRadius: '4px', objectFit: 'contain', background: '#0e0e0e', padding: '4px', border: '1px solid rgba(255,255,255,0.08)' }}
                          />
                          <button 
                            onClick={() => handleImageDelete('outroSilhouette')}
                            className="admin-delete-btn font-mono"
                            style={{ background: '#ef4444', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '4px', fontSize: '0.7rem', cursor: 'pointer' }}
                          >
                            ELIMINAR
                          </button>
                        </div>
                      )}
                      <button 
                        onClick={() => handleImageUpload('outroSilhouette')}
                        className="admin-upload-btn font-mono"
                      >
                        SUBIR SILUETA
                      </button>
                    </div>
                  </div>
                </div>

                <div className="admin-field-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', width: '100%' }}>
                  <div className="admin-field">
                    <label className="font-mono">Botón Primario - Texto</label>
                    <input
                      type="text"
                      value={siteData.outroData?.cta1Text || ''}
                      onChange={(e) => {
                        updateSiteData({
                          outroData: { ...siteData.outroData, cta1Text: e.target.value }
                        });
                      }}
                      className="admin-input"
                    />
                  </div>
                  <div className="admin-field">
                    <label className="font-mono">Botón Primario - Enlace (WhatsApp / URL)</label>
                    <input
                      type="text"
                      value={siteData.outroData?.cta1Url || ''}
                      onChange={(e) => {
                        updateSiteData({
                          outroData: { ...siteData.outroData, cta1Url: e.target.value }
                        });
                      }}
                      className="admin-input"
                    />
                  </div>
                </div>

                <div className="admin-field-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', width: '100%', marginTop: '12px' }}>
                  <div className="admin-field">
                    <label className="font-mono">Botón Secundario - Texto</label>
                    <input
                      type="text"
                      value={siteData.outroData?.cta2Text || ''}
                      onChange={(e) => {
                        updateSiteData({
                          outroData: { ...siteData.outroData, cta2Text: e.target.value }
                        });
                      }}
                      className="admin-input"
                    />
                  </div>
                  <div className="admin-field">
                    <label className="font-mono">Botón Secundario - Enlace (e.g. #vault)</label>
                    <input
                      type="text"
                      value={siteData.outroData?.cta2Url || ''}
                      onChange={(e) => {
                        updateSiteData({
                          outroData: { ...siteData.outroData, cta2Url: e.target.value }
                        });
                      }}
                      className="admin-input"
                    />
                  </div>
                </div>
              </div>
            )}
            {activeTab === 'backup' && (
              <div className="admin-form">
                <h3 className="admin-subtitle font-display">Copia de Seguridad & Despliegue</h3>
                <p className="font-mono" style={{ fontSize: '0.75rem', color: 'var(--white-muted)', marginBottom: '1.5rem', lineHeight: '1.4' }}>
                  El diseño y los cambios del sitio se guardan localmente en tu navegador. Para que estos cambios aparezcan en el servidor de producción (Vercel) de manera fija, puedes exportar la configuración actual en formato JSON, enviarla al asistente para que la guarde como la base de datos nativa del sitio, o pegarla en otro navegador.
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                  <div>
                    <h4 className="font-mono" style={{ fontSize: '0.8rem', color: 'var(--neon-magenta)', marginBottom: '10px' }}>[ EXPORTAR ]</h4>
                    <button
                      type="button"
                      className="admin-action-btn admin-action-btn--glow font-mono"
                      style={{ width: '100%', padding: '12px', cursor: 'pointer' }}
                      onClick={() => {
                        const dataStr = JSON.stringify(siteData, null, 2);
                        navigator.clipboard.writeText(dataStr);
                        alert('¡Configuración copiada al portapapeles! Pégala en el chat con tu desarrollador para hacerla permanente en el servidor.');
                      }}
                    >
                      📋 COPIAR RESPALDO JSON
                    </button>
                  </div>

                  <div>
                    <h4 className="font-mono" style={{ fontSize: '0.8rem', color: 'var(--neon-cyan)', marginBottom: '10px' }}>[ IMPORTAR ]</h4>
                    <textarea
                      id="import-json-area"
                      className="admin-textarea font-mono"
                      placeholder="Pega aquí el código JSON de respaldo..."
                      rows={4}
                      style={{ fontSize: '0.7rem', padding: '10px', background: 'rgba(255,255,255,0.03)', color: '#fff', width: '100%', border: '1px solid rgba(255,255,255,0.1)' }}
                    />
                    <button
                      type="button"
                      className="admin-action-btn font-mono"
                      style={{ width: '100%', marginTop: '10px', padding: '8px', cursor: 'pointer' }}
                      onClick={() => {
                        try {
                          const jsonText = document.getElementById('import-json-area').value;
                          if (!jsonText.trim()) {
                            alert('Por favor, pega un JSON válido.');
                            return;
                          }
                          const parsed = JSON.parse(jsonText);
                          if (parsed.bioData || parsed.manifestoData || parsed.gigsData) {
                            updateSiteData(parsed);
                            alert('¡Configuración importada con éxito! La página se actualizará.');
                            window.location.reload();
                          } else {
                            alert('El formato JSON no parece ser una copia de seguridad válida.');
                          }
                        } catch (err) {
                          alert('Error al parsear el JSON: ' + err.message);
                        }
                      }}
                    >
                      📥 APLICAR CONFIGURACIÓN
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
