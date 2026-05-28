"use client";

import { useState, useEffect } from 'react';
import './superadmin.css';

export default function SuperadminPage() {
  const [artists, setArtists] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  
  // Form State
  const [newArtistName, setNewArtistName] = useState('');
  const [newArtistSlug, setNewArtistSlug] = useState('');
  const [newArtistDomain, setNewArtistDomain] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState({ type: null, text: '' });

  // Cargar artistas al montar la página
  useEffect(() => {
    fetchArtists();
  }, []);

  // Autofill Slug based on Name
  useEffect(() => {
    const generatedSlug = newArtistName
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '') // Eliminar caracteres especiales
      .replace(/\s+/g, '-');        // Reemplazar espacios por guiones
    setNewArtistSlug(generatedSlug);
  }, [newArtistName]);

  const fetchArtists = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/superadmin/artists');
      const data = await res.json();
      if (Array.isArray(data)) {
        setArtists(data);
      }
    } catch (e) {
      console.error('Error fetching tenants:', e);
    } finally {
      setLoading(false);
    }
  };

  // Alternar estado de facturación (Active/Suspended)
  const toggleStatus = async (artistId, currentStatus) => {
    const newStatus = currentStatus === 'active' ? 'suspended' : 'active';
    try {
      const res = await fetch(`/api/superadmin/artists/${artistId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      const data = await res.json();
      
      if (data.success) {
        // Actualizar estado localmente
        setArtists(prev => prev.map(art => 
          art.id === artistId ? { ...art, billing_status: newStatus } : art
        ));
      } else {
        alert('Error al cambiar el estado: ' + data.error);
      }
    } catch (e) {
      console.error('Error toggling status:', e);
      alert('Error de conexión al cambiar el estado.');
    }
  };

  // Eliminar artista por completo
  const handleDelete = async (artistId, artistName) => {
    const confirmDelete = window.confirm(`¿Estás seguro de que deseas eliminar por completo a "${artistName}"? Esta acción no se puede deshacer y liberará su slug de inmediato.`);
    if (!confirmDelete) return;

    try {
      const res = await fetch(`/api/superadmin/artists/${artistId}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      
      if (data.success) {
        // Remover de la lista local
        setArtists(prev => prev.filter(art => art.id !== artistId));
      } else {
        alert('Error al eliminar: ' + data.error);
      }
    } catch (e) {
      console.error('Error deleting artist:', e);
      alert('Error de conexión al intentar eliminar al artista.');
    }
  };

  // Registrar nuevo artista
  const handleRegister = async (e) => {
    e.preventDefault();
    if (!newArtistName || !newArtistSlug) {
      setFeedback({ type: 'error', text: 'El nombre y el slug son obligatorios.' });
      return;
    }

    setSubmitting(true);
    setFeedback({ type: null, text: '' });

    try {
      const res = await fetch('/api/superadmin/artists', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newArtistName,
          slug: newArtistSlug,
          custom_domain: newArtistDomain || null
        })
      });
      const data = await res.json();

      if (data.success) {
        setFeedback({ type: 'success', text: `¡Artista "${newArtistName}" registrado exitosamente!` });
        setNewArtistName('');
        setNewArtistDomain('');
        // Recargar la lista completa para traer al nuevo artista
        await fetchArtists();
      } else {
        setFeedback({ type: 'error', text: data.error || 'Error al registrar artista.' });
      }
    } catch (err) {
      console.error('Registration failed:', err);
      setFeedback({ type: 'error', text: 'Error de red al registrar el artista.' });
    } finally {
      setSubmitting(false);
    }
  };

  // Filtrar artistas en tiempo real
  const filteredArtists = artists.filter(art => 
    art.name.toLowerCase().includes(search.toLowerCase()) ||
    art.slug.toLowerCase().includes(search.toLowerCase())
  );

  // Calcular métricas ejecutivas
  const totalClients = artists.length;
  const activeClients = artists.filter(a => a.billing_status === 'active').length;
  const suspendedClients = artists.filter(a => a.billing_status === 'suspended').length;
  const projectedMRR = activeClients * 15000; // MRR proyectado en pesos, ej. $15.000 por cliente activo

  // Determinar la URL local o producción para abrir la tienda del artista
  const getArtistUrl = (slug, customDomain) => {
    if (typeof window === 'undefined') return '#';
    const host = window.location.host; // ej. localhost:3000 o tiendadjs.com
    const protocol = window.location.protocol; // http: o https:
    
    if (customDomain) {
      return `${protocol}//${customDomain}`;
    }

    if (host.includes('localhost') || host.includes('127.0.0.1')) {
      return `${protocol}//${slug}.localhost:3000`;
    }

    // Producción en Vercel o dominio oficial
    if (host.includes('vercel.app')) {
      return `${protocol}//${slug}.tienda-djs.vercel.app`;
    }
    return `${protocol}//${slug}.tiendadjs.com`;
  };

  return (
    <div className="superadmin-container">
      <div className="superadmin-content">
        
        {/* Header */}
        <header className="superadmin-header">
          <h1 className="superadmin-title">TIENDA DJS — SUPERADMIN</h1>
          <p className="superadmin-subtitle">Consola ejecutiva para el control de facturación, suspensión y altas de clientes SaaS.</p>
        </header>

        {/* Executive Metrics Cards */}
        <section className="superadmin-metrics-grid">
          
          <div className="metric-card">
            <div className="metric-title">Clientes Registrados</div>
            <div className="metric-value">{totalClients}</div>
            <div className="metric-change neutral">Total acumulado</div>
            <div className="metric-glow violet"></div>
          </div>

          <div className="metric-card">
            <div className="metric-title">Suscripciones Activas</div>
            <div className="metric-value" style={{ color: '#10b981' }}>{activeClients}</div>
            <div className="metric-change positive">Facturación activa</div>
            <div className="metric-glow emerald"></div>
          </div>

          <div className="metric-card">
            <div className="metric-title">Cuentas Suspendidas</div>
            <div className="metric-value" style={{ color: '#f43f5e' }}>{suspendedClients}</div>
            <div className="metric-change neutral">Por falta de pago</div>
            <div className="metric-glow rose"></div>
          </div>

          <div className="metric-card">
            <div className="metric-title">MRR Proyectado</div>
            <div className="metric-value">${projectedMRR.toLocaleString('es-AR')}</div>
            <div className="metric-change positive">AR/mes estimado</div>
            <div className="metric-glow violet"></div>
          </div>

        </section>

        {/* Core Layout Grid */}
        <div className="superadmin-grid">
          
          {/* Left Panel: Clients/Tenants List */}
          <section className="section-panel">
            <div className="section-header">
              <h2 className="section-title">Cartera de Artistas / Clientes</h2>
              <input 
                type="text" 
                placeholder="Buscar artista o slug..." 
                className="search-input"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            {loading ? (
              <div className="empty-state">Cargando base de datos en tiempo real...</div>
            ) : filteredArtists.length === 0 ? (
              <div className="empty-state">No se encontraron artistas registrados.</div>
            ) : (
              <div className="artists-list">
                {filteredArtists.map((artist) => (
                  <div key={artist.id} className="artist-item">
                    
                    <div className="artist-info">
                      <div className="artist-name-row">
                        <span className="artist-name">{artist.name}</span>
                        <span className={`status-badge ${artist.billing_status || 'active'}`}>
                          {artist.billing_status === 'active' ? 'Activo' : 'Suspendido'}
                        </span>
                      </div>
                      
                      <div className="artist-details">
                        <div className="artist-detail-item">
                          <span>Slug:</span>
                          <span style={{ fontFamily: 'monospace', color: '#a78bfa' }}>{artist.slug}</span>
                        </div>
                        {artist.custom_domain && (
                          <div className="artist-detail-item">
                            <span>Dominio:</span>
                            <span style={{ color: '#10b981' }}>{artist.custom_domain}</span>
                          </div>
                        )}
                        <div className="artist-detail-item">
                          <span>Alta:</span>
                          <span>{new Date(artist.created_at).toLocaleDateString('es-AR')}</span>
                        </div>
                      </div>
                    </div>

                    <div className="artist-actions">
                      <button 
                        onClick={() => toggleStatus(artist.id, artist.billing_status)}
                        className={`btn-toggle ${artist.billing_status === 'active' ? 'suspend-hover' : 'activate-hover'}`}
                      >
                        {artist.billing_status === 'active' ? 'Suspender Servicio' : 'Activar Servicio'}
                      </button>
                      <a 
                        href={getArtistUrl(artist.slug, artist.custom_domain)} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="btn-view"
                      >
                        Ver Sitio
                      </a>
                      <button 
                        onClick={() => handleDelete(artist.id, artist.name)}
                        className="btn-delete"
                      >
                        Eliminar
                      </button>
                    </div>

                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Right Panel: Add New Artist Form */}
          <section className="section-panel" style={{ height: 'fit-content' }}>
            <h2 className="section-title" style={{ marginBottom: '24px' }}>Registrar Nuevo Cliente / Artista</h2>
            
            <form onSubmit={handleRegister}>
              
              <div className="form-group">
                <label className="form-label">Nombre del Artista</label>
                <input 
                  type="text" 
                  placeholder="Ej. Lozano, DJ Martinez" 
                  className="form-input"
                  value={newArtistName}
                  onChange={(e) => setNewArtistName(e.target.value)}
                  required 
                />
              </div>

              <div className="form-group">
                <label className="form-label">Slug de la Tienda (Automático)</label>
                <input 
                  type="text" 
                  placeholder="ej-lozano" 
                  className="form-input"
                  value={newArtistSlug}
                  onChange={(e) => setNewArtistSlug(e.target.value.toLowerCase().replace(/\s+/g, '-'))}
                  required 
                />
                <div className="slug-preview">
                  URL temporal: <span className="slug-preview-highlight">{newArtistSlug || 'slug'}.localhost:3000</span>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Dominio Propio (Opcional)</label>
                <input 
                  type="text" 
                  placeholder="Ej. lozanomusic.com" 
                  className="form-input"
                  value={newArtistDomain}
                  onChange={(e) => setNewArtistDomain(e.target.value)}
                />
              </div>

              <button 
                type="submit" 
                className="btn-primary" 
                disabled={submitting}
              >
                {submitting ? 'Creando bases...' : 'Registrar e Inicializar'}
              </button>

            </form>

            {feedback.text && (
              <div className={`feedback-message ${feedback.type}`}>
                {feedback.text}
              </div>
            )}

          </section>

        </div>

      </div>
    </div>
  );
}
