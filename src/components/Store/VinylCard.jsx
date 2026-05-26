import { useState, useRef } from 'react';
import WaveformPlayer from './WaveformPlayer';
import { useCart } from '../../context/CartContext';
import './VinylCard.css';

export default function VinylCard({ track }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const cardRef = useRef(null);
  const { addItem, openCart } = useCart();

  const handleMouseMove = (e) => {
    const card = cardRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5; // -0.5 to 0.5
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setTilt({ x: x * 15, y: -y * 15 }); // 15 degrees max tilt
  };

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0 });
  };

  const handlePlayToggle = (e) => {
    e.stopPropagation();
    setIsPlaying(!isPlaying);
  };

  const handleAddToCart = (e) => {
    e.stopPropagation();
    addItem(track);
    openCart();
  };

  return (
    <article
      ref={cardRef}
      className="vinyl-card glass"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        transform: `perspective(1000px) rotateX(${tilt.y}deg) rotateY(${tilt.x}deg)`,
      }}
      data-cursor-hover
    >
      {/* Vinyl Disc Backdrop Spinning when playing */}
      <div className={`vinyl-card__disc-wrap ${isPlaying ? 'vinyl-card__disc-wrap--playing' : ''}`}>
        <div
          className="vinyl-card__disc"
          style={{
            background: `radial-gradient(circle, #111 30%, ${track.coverColor} 60%, #000 80%)`,
          }}
        >
          <div className="vinyl-card__disc-grooves" />
          <div className="vinyl-card__disc-label">
            <div className="vinyl-card__disc-center" />
          </div>
        </div>
      </div>

      {/* Front Jacket Card */}
      <div className="vinyl-card__jacket">
        <div className="vinyl-card__cover" style={{ borderColor: track.coverColor }}>
          <div className="vinyl-card__cover-glow" style={{ background: track.coverColor }} />
          <span className="vinyl-card__type font-mono">{track.type}</span>
          <button
            className={`vinyl-card__play-btn ${isPlaying ? 'vinyl-card__play-btn--playing' : ''}`}
            onClick={handlePlayToggle}
            aria-label={isPlaying ? 'Pausar preview' : 'Reproducir preview'}
          >
            {isPlaying ? (
              <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
                <rect x="6" y="4" width="4" height="16" rx="1" />
                <rect x="14" y="4" width="4" height="16" rx="1" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
                <polygon points="8,5 19,12 8,19" />
              </svg>
            )}
          </button>
        </div>

        <div className="vinyl-card__details">
          <div className="vinyl-card__header">
            <h3 className="vinyl-card__title font-display">{track.title}</h3>
            <span className="vinyl-card__price font-mono">
              ${track.price.toLocaleString('es-AR')}
            </span>
          </div>

          <div className="vinyl-card__meta font-mono">
            <span>{track.genre}</span>
            <span>{track.bpm} BPM</span>
            {track.duration !== '—' && <span>{track.duration}</span>}
          </div>

          {/* Visual Waveform player */}
          <div className="vinyl-card__waveform-container">
            <WaveformPlayer isPlaying={isPlaying} color={track.coverColor} />
          </div>

          <button className="vinyl-card__add-btn font-mono" onClick={handleAddToCart}>
            <span>COMPRAR</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          </button>
        </div>
      </div>
    </article>
  );
}
