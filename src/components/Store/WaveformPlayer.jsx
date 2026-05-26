import { useRef, useState, useEffect } from 'react';
import './WaveformPlayer.css';

export default function WaveformPlayer({ isPlaying, color = '#8B5CF6' }) {
  const canvasRef = useRef(null);
  const animRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);
    };
    resize();

    const bars = 48;
    const barWidth = 3;
    const gap = 2;
    let phase = 0;

    const draw = () => {
      const w = canvas.width / dpr;
      const h = canvas.height / dpr;
      ctx.clearRect(0, 0, w, h);

      const totalWidth = bars * (barWidth + gap);
      const startX = (w - totalWidth) / 2;

      for (let i = 0; i < bars; i++) {
        const x = startX + i * (barWidth + gap);

        let barH;
        if (isPlaying) {
          barH = (Math.sin(phase + i * 0.3) * 0.4 + 0.5) * h * 0.8;
          barH = Math.max(barH, 4);
        } else {
          /* Static waveform shape */
          const norm = i / bars;
          barH = (Math.sin(norm * Math.PI) * 0.6 + 0.2) * h * 0.5;
          barH = Math.max(barH, 3);
        }

        const y = (h - barH) / 2;

        /* Gradient per bar */
        const grad = ctx.createLinearGradient(x, y, x, y + barH);
        grad.addColorStop(0, color);
        grad.addColorStop(1, `${color}44`);

        ctx.fillStyle = isPlaying ? grad : `${color}55`;
        ctx.beginPath();
        ctx.roundRect(x, y, barWidth, barH, 1.5);
        ctx.fill();
      }

      if (isPlaying) {
        phase += 0.08;
      }
      animRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [isPlaying, color]);

  return (
    <canvas
      ref={canvasRef}
      className="waveform-canvas"
      aria-hidden="true"
    />
  );
}
