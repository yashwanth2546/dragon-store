import React, { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Rotate3D } from 'lucide-react';
import { KeyboardArt } from './KeyboardArt';

function ProductVisual({ product }) {
  if (product.visual === 'keyboard-art') {
    return <KeyboardArt variant={product.artVariant} className="h-full w-full" />;
  }
  return (
    <img
      src={product.image}
      alt={product.name}
      className="h-full w-full object-cover"
      draggable={false}
    />
  );
}

export function ProductCard({ product, index, onAddToCart }) {
  const [selectedVariant, setSelectedVariant] = useState(product.variants[0].value);
  const [tilt, setTilt] = useState({ rx: 0, ry: 0 });
  const [hovered, setHovered] = useState(false);
  const wrapRef = useRef(null);

  const handleMove = (e) => {
    const el = wrapRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    setTilt({ rx: -py * 11, ry: px * 16 });
  };

  const reset = () => {
    setHovered(false);
    setTilt({ rx: 0, ry: 0 });
  };

  return (
    <motion.article
      initial={{ opacity: 0, y: 70 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.8, delay: index * 0.14, ease: [0.16, 1, 0.3, 1] }}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-line bg-surface transition-all duration-500 hover:border-violet/40 hover:shadow-[0_0_60px_-15px_rgba(168,85,247,0.35)]"
    >
      {/* Index number */}
      <span className="pointer-events-none absolute right-5 top-4 z-20 font-display text-5xl text-white/5 transition-colors group-hover:text-violet/20">
        {String(index + 1).padStart(2, '0')}
      </span>

      {/* ===== HOVER-SPIN VIEWPORT ===== */}
      <div
        ref={wrapRef}
        data-tilt-wrap
        onMouseMove={handleMove}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={reset}
        className="relative aspect-[4/3] overflow-hidden border-b border-line [perspective:1100px]"
      >
        {/* Ambient glow */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_45%,rgba(168,85,247,0.16),transparent_65%)]" />
        <div className="absolute inset-0 bg-grid bg-grid-fade opacity-60" />

        {/* Tilted product plane */}
        <div
          data-tilt
          className="absolute inset-0 will-change-transform"
          style={{
            transform: `rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg) scale(${hovered ? 1.07 : 1})`,
            transformStyle: 'preserve-3d',
            transition: 'transform 0.25s cubic-bezier(0.22,1,0.36,1)',
          }}
        >
          <ProductVisual product={product} />
        </div>

        {/* Rotating light sheen (hover-spin) */}
        <div
          aria-hidden
          className={`pointer-events-none absolute inset-0 ${hovered ? 'animate-spin-slow' : ''}`}
          style={{
            opacity: hovered ? 1 : 0,
            transition: 'opacity 0.35s ease',
            background:
              'conic-gradient(from 0deg, transparent 0deg, rgba(255,255,255,0.10) 55deg, rgba(168,85,247,0.08) 90deg, transparent 130deg)',
            mixBlendMode: 'screen',
          }}
        />

        {/* Badges */}
        <div className="absolute left-4 top-4 z-20 flex flex-col gap-2">
          {product.badges?.map((badge) => (
            <span
              key={badge}
              className="w-fit rounded-sm border border-violet/40 bg-bg/60 px-2 py-1 font-tech text-[10px] uppercase tracking-[0.2em] text-violet-bright backdrop-blur"
            >
              {badge}
            </span>
          ))}
        </div>

        {/* Hint */}
        <div className="absolute right-4 top-4 z-20 flex items-center gap-1.5 font-tech text-[10px] uppercase tracking-[0.2em] text-dim opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          <Rotate3D className="h-3 w-3 text-violet" />
          360° Inspect
        </div>
      </div>

      {/* ===== INFO ===== */}
      <div className="relative flex flex-1 flex-col gap-4 p-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="font-tech text-xl font-semibold uppercase tracking-wide text-ink transition-colors group-hover:text-violet-bright">
              {product.name}
            </h3>
            <p className="mt-1 font-body text-xs text-dim">{product.type}</p>
          </div>
          <div className="flex shrink-0 items-center gap-1 rounded-sm border border-line px-2 py-1 font-tech text-xs text-mut">
            <span className="text-violet">★</span> {product.rating}
          </div>
        </div>

        {/* Specs */}
        <ul className="flex flex-wrap gap-1.5">
          {product.specs.map((spec) => (
            <li
              key={spec}
              className="rounded-sm border border-line bg-bg/40 px-2 py-1 font-tech text-[11px] tracking-wide text-mut"
            >
              {spec}
            </li>
          ))}
        </ul>

        {/* Price */}
        <div className="flex items-baseline gap-2.5">
          <span className="font-display text-3xl text-ink">
            ₹{product.price.toLocaleString('en-IN')}
          </span>
          {product.oldPrice && (
            <span className="font-body text-sm text-dim line-through">
              ₹{product.oldPrice.toLocaleString('en-IN')}
            </span>
          )}
          {product.discount && (
            <span className="rounded-sm bg-rose/15 px-1.5 py-0.5 font-tech text-[11px] font-semibold text-rose">
              −{product.discount}%
            </span>
          )}
        </div>

        {/* Variant */}
        <div className="flex items-center gap-2">
          <span className="font-tech text-[10px] uppercase tracking-[0.25em] text-dim">Variant</span>
          <div className="flex gap-1.5">
            {product.variants.map((v) => (
              <button
                key={v.value}
                onClick={() => setSelectedVariant(v.value)}
                className={`rounded-sm border px-2.5 py-1 font-tech text-xs transition-colors ${
                  selectedVariant === v.value
                    ? 'border-violet bg-violet/15 text-violet-bright'
                    : 'border-line text-mut hover:border-violet/40 hover:text-ink'
                }`}
              >
                {v.label}
              </button>
            ))}
          </div>
        </div>

        {/* CTA */}
        <button
          onClick={() => onAddToCart(product, selectedVariant)}
          className="interactive mt-auto flex items-center justify-center gap-2 rounded-lg border border-violet/40 bg-violet/10 py-3.5 font-tech text-sm font-semibold uppercase tracking-widest text-violet-bright transition-all hover:bg-violet hover:text-bg glow-violet"
        >
          <Plus className="h-4 w-4" />
          Add to cart
        </button>
      </div>
    </motion.article>
  );
}
