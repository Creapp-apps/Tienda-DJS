import { useRef, useState, useEffect } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import MagneticButton from '../components/MagneticButton';
import { useSiteData } from '../context/SiteDataContext';
import './TourTracker.css';

gsap.registerPlugin(ScrollTrigger);

export default function TourTracker() {
  const sectionRef = useRef(null);
  const { siteData } = useSiteData();

  useGSAP(() => {
    const rows = sectionRef.current.querySelectorAll('.tour__row');
    rows.forEach((row, i) => {
      gsap.from(row, {
        x: i % 2 === 0 ? -60 : 60,
        opacity: 0,
        duration: 0.8,
        ease: 'expo.out',
        scrollTrigger: {
          trigger: row,
          start: 'top 85%',
        },
      });
    });

    /* Separator line animation */
    const lines = sectionRef.current.querySelectorAll('.tour__separator');
    lines.forEach((line) => {
      gsap.from(line, {
        scaleX: 0,
        transformOrigin: 'left center',
        duration: 1,
        ease: 'expo.out',
        scrollTrigger: {
          trigger: line,
          start: 'top 90%',
        },
      });
    });
  }, { scope: sectionRef });

  const getStatusLabel = (status) => {
    switch (status) {
      case 'on-sale': return 'Tickets';
      case 'soon': return 'Pronto';
      case 'sold-out': return 'Agotado';
      default: return 'Info';
    }
  };

  return (
    <section ref={sectionRef} className="tour section" id="tour">
      <div className="container">
        <span className="section-label">Tour Dates</span>
        <h2 className="tour__title">Próximos Shows</h2>

        <div className="tour__list">
          {siteData.tourDates.map((date, i) => (
            <div key={date.id}>
              <div
                className={`tour__row ${date.status === 'sold-out' ? 'tour__row--past' : ''}`}
              >
                <div className="tour__date-col">
                  <span className="tour__date font-display">{date.date}</span>
                  <span className="tour__year font-mono">{date.year}</span>
                </div>

                <div className="tour__info-col">
                  <span className="tour__venue">{date.venue}</span>
                  <span className="tour__city font-mono">{date.city}</span>
                </div>

                <div className="tour__action-col">
                  {date.status === 'sold-out' ? (
                    <span className="tour__sold-out font-mono">SOLD OUT</span>
                  ) : (
                    <MagneticButton
                      className={`tour__ticket-btn ${date.status === 'soon' ? 'tour__ticket-btn--soon' : ''}`}
                      data-cursor-hover
                    >
                      {getStatusLabel(date.status)}
                    </MagneticButton>
                  )}
                </div>
              </div>
              {i < siteData.tourDates.length - 1 && <div className="tour__separator" />}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
