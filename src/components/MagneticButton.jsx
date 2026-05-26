import { useRef, useCallback } from 'react';

export default function MagneticButton({ children, className = '', ...props }) {
  const btnRef = useRef(null);

  const handleMove = useCallback((e) => {
    const btn = btnRef.current;
    if (!btn) return;
    const rect = btn.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = (e.clientX - cx) * 0.3;
    const dy = (e.clientY - cy) * 0.3;
    btn.style.transform = `translate(${dx}px, ${dy}px)`;
  }, []);

  const handleLeave = useCallback(() => {
    const btn = btnRef.current;
    if (!btn) return;
    btn.style.transition = 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)';
    btn.style.transform = 'translate(0, 0)';
    setTimeout(() => {
      if (btn) btn.style.transition = '';
    }, 500);
  }, []);

  return (
    <button
      ref={btnRef}
      className={`magnetic-btn ${className}`}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      {...props}
    >
      {children}
    </button>
  );
}
