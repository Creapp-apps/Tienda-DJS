import { useRef, useState } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import VinylCard from '../components/Store/VinylCard';
import { useSiteData } from '../context/SiteDataContext';
import './ArtistVault.css';

gsap.registerPlugin(ScrollTrigger);

export default function ArtistVault() {
  const sectionRef = useRef(null);
  const { siteData } = useSiteData();
  const [activeFilter, setActiveFilter] = useState('ALL');

  const filters = ['ALL', 'EDIT', 'REMIX PACK', 'EXTENDED', 'SAMPLE PACK'];

  useGSAP(() => {
    if (!sectionRef.current) return;
    /* Section title reveal */
    const title = sectionRef.current.querySelector('.vault__title');
    if (title) {
      gsap.from(title, {
        y: 40,
        opacity: 0,
        duration: 1,
        ease: 'expo.out',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 80%',
        },
      });
    }
  }, { scope: sectionRef });

  const filteredTracks = activeFilter === 'ALL'
    ? siteData.tracksData
    : siteData.tracksData.filter(track => track.type.toUpperCase() === activeFilter);

  return (
    <section ref={sectionRef} className="vault section" id="vault">
      <div className="container">
        <span className="section-label">Artist Vault</span>
        <h2 className="vault__title">Material Digital</h2>

        {/* Tab Filters */}
        <div className="vault__filters">
          {filters.map((filter) => (
            <button
              key={filter}
              className={`vault__filter-btn font-mono ${activeFilter === filter ? 'vault__filter-btn--active' : ''}`}
              onClick={() => setActiveFilter(filter)}
            >
              {filter}
            </button>
          ))}
        </div>

        {/* Tracks Grid */}
        <div className="vault__grid">
          {filteredTracks.map((track) => (
            <VinylCard key={track.id} track={track} />
          ))}
        </div>
      </div>
    </section>
  );
}
