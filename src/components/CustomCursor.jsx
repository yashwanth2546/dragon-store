import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

export function CustomCursor() {
  const [pos, setPos] = useState({ x: -100, y: -100 });
  const [hovered, setHovered] = useState(false);
  const [down, setDown] = useState(false);
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    if (!window.matchMedia('(pointer: fine)').matches) return;
    setEnabled(true);
    document.body.classList.add('custom-cursor');

    const move = (e) => setPos({ x: e.clientX, y: e.clientY });
    const over = (e) => {
      const t = e.target.closest('a, button, [role="button"], input, .interactive');
      setHovered(!!t);
    };
    const downFn = () => setDown(true);
    const upFn = () => setDown(false);

    window.addEventListener('mousemove', move);
    window.addEventListener('mouseover', over);
    window.addEventListener('mousedown', downFn);
    window.addEventListener('mouseup', upFn);
    return () => {
      document.body.classList.remove('custom-cursor');
      window.removeEventListener('mousemove', move);
      window.removeEventListener('mouseover', over);
      window.removeEventListener('mousedown', downFn);
      window.removeEventListener('mouseup', upFn);
    };
  }, []);

  if (!enabled) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-[70]">
      {/* Core dot */}
      <motion.div
        className="fixed left-0 top-0 h-1.5 w-1.5 rounded-full bg-gold-bright"
        animate={{ x: pos.x - 3, y: pos.y - 3, scale: down ? 0.6 : 1 }}
        transition={{ type: 'spring', damping: 35, stiffness: 500, mass: 0.1 }}
        style={{ boxShadow: '0 0 12px rgba(242,204,87,0.9)' }}
      />
      {/* Ring */}
      <motion.div
        className="fixed left-0 top-0 rounded-full border"
        animate={{
          x: pos.x - (hovered ? 26 : 16),
          y: pos.y - (hovered ? 26 : 16),
          width: hovered ? 52 : 32,
          height: hovered ? 52 : 32,
          scale: down ? 0.8 : 1,
        }}
        transition={{ type: 'spring', damping: 22, stiffness: 220, mass: 0.25 }}
        style={{
          borderColor: hovered ? 'rgba(242,204,87,0.9)' : 'rgba(217,168,60,0.5)',
          backgroundColor: hovered ? 'rgba(217,168,60,0.12)' : 'transparent',
        }}
      />
    </div>
  );
}
