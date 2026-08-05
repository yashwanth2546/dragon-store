import React from 'react';
import { motion } from 'framer-motion';
import { Keyboard, Mouse, Square, Headphones, KeySquare, Cable, ArrowUpRight } from 'lucide-react';

const categories = [
  { name: 'Keyboards', icon: Keyboard, count: '48', desc: 'Hall-effect & hot-swap' },
  { name: 'Mice', icon: Mouse, count: '36', desc: 'From 49g ultralights' },
  { name: 'Mousepads', icon: Square, count: '25', desc: 'Glass & hybrid control' },
  { name: 'Headsets & IEMs', icon: Headphones, count: '30', desc: 'Tuned for FPS audio' },
  { name: 'Keycaps', icon: KeySquare, count: '60+', desc: 'PBT & doubleshot' },
  { name: 'Accessories', icon: Cable, count: '120+', desc: 'Cables, grips & mods' },
];

export function CategoryGrid() {
  return (
    <section id="categories" className="relative overflow-hidden bg-bg py-24 sm:py-32">
      <div className="absolute inset-0 bg-grid bg-grid-fade opacity-30" />

      <div className="relative mx-auto max-w-[1600px] px-5 sm:px-10 lg:px-16">
        <div className="mb-14 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <motion.p
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="mb-4 font-tech text-xs uppercase tracking-[0.35em] text-violet"
            >
              / 03 — The Arsenal
            </motion.p>
            <motion.h2
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
              className="font-display uppercase leading-[0.95] tracking-tight text-[clamp(2.4rem,5.5vw,4.5rem)] text-ink"
            >
              Every weapon.
              <span className="text-mut"> Every round.</span>
            </motion.h2>
          </div>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="max-w-xs font-body text-sm leading-relaxed text-mut"
          >
            From the first click to the final frag — one catalogue, curated by
            players, for players.
          </motion.p>
        </div>

        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
          {categories.map((cat, i) => (
            <motion.a
              key={cat.name}
              href="#product-showcase"
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ delay: i * 0.07, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="interactive group relative flex flex-col gap-4 overflow-hidden rounded-xl border border-line bg-surface p-5 transition-all duration-300 hover:border-violet/50 hover:shadow-[0_0_40px_-10px_rgba(168,85,247,0.4)]"
            >
              {/* hover glow */}
              <div className="absolute -right-10 -top-10 h-24 w-24 rounded-full bg-violet/20 blur-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

              <div className="flex items-center justify-between">
                <div className="rounded-lg border border-line bg-bg/60 p-2.5 text-mut transition-colors group-hover:border-violet/40 group-hover:text-violet-bright">
                  <cat.icon className="h-5 w-5" />
                </div>
                <ArrowUpRight className="h-4 w-4 text-dim transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-violet" />
              </div>

              <div>
                <h3 className="font-tech text-base font-semibold uppercase tracking-wide text-ink">
                  {cat.name}
                </h3>
                <div className="mt-2 flex items-baseline gap-1.5">
                  <span className="font-display text-xl text-violet-bright">{cat.count}</span>
                  <span className="font-body text-[11px] text-dim">models</span>
                </div>
                <p className="mt-1 font-body text-[11px] leading-snug text-mut">{cat.desc}</p>
              </div>
            </motion.a>
          ))}
        </div>
      </div>
    </section>
  );
}
