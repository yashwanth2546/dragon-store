import React from 'react';
import { motion } from 'framer-motion';
import { Gauge, Timer, Cpu, Crosshair, Zap } from 'lucide-react';

const macroPoints = [
  {
    title: 'Rapid Trigger',
    desc: 'Press and release are read per key, not per travel cycle — double-taps land without a thought.',
  },
  {
    title: '0.1mm actuation',
    desc: 'The magnetic field is sampled 8,000 times a second. Zero contact, zero debounce, zero excuse.',
  },
  {
    title: 'Rapid fire reads',
    desc: 'Every keystroke is decided by physics, not firmware. What you feel is what hits the server.',
  },
];

const stats = [
  { icon: Gauge, value: '0.1mm', label: 'Actuation' },
  { icon: Timer, value: '0.3ms', label: 'Latency' },
  { icon: Cpu, value: '8K', label: 'Reads / sec' },
];

export function MacroSpecSection() {
  return (
    <section id="spec-section" className="relative overflow-hidden bg-bg-2 py-24 sm:py-36">
      <div className="absolute -left-40 top-1/3 h-[40%] w-[40%] rounded-full bg-violet-deep/20 blur-[160px]" />
      <div className="absolute -right-32 bottom-0 h-[35%] w-[35%] rounded-full bg-violet/10 blur-[150px]" />

      <div className="relative mx-auto max-w-[1600px] px-5 sm:px-10 lg:px-16">
        {/* Header */}
        <div className="mb-16 max-w-4xl">
          <motion.p
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="mb-4 font-tech text-xs uppercase tracking-[0.35em] text-violet"
          >
            / 02 — Built Different
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
            className="font-display uppercase leading-[0.95] tracking-tight text-[clamp(2.6rem,6.5vw,5.5rem)] text-ink"
          >
            The macro is the
            <br />
            <span className="text-gradient-violet glow-text">weapon.</span>
          </motion.h2>
        </div>

        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
          {/* ===== Macro shot ===== */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-line bg-surface"
          >
            <img
              src="/product/macro-wheel.png"
              alt="Brushed-gold scroll wheel macro"
              className="absolute inset-0 h-full w-full object-cover opacity-80"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-bg via-transparent to-bg/40" />

            {/* Scope overlay */}
            <div className="pointer-events-none absolute inset-0">
              <div className="absolute left-1/2 top-1/2 h-3/4 w-px -translate-x-1/2 -translate-y-1/2 bg-gradient-to-b from-transparent via-violet/40 to-transparent" />
              <div className="absolute left-1/2 top-1/2 h-px w-3/4 -translate-x-1/2 -translate-y-1/2 bg-gradient-to-r from-transparent via-violet/40 to-transparent" />
            </div>

            <div className="absolute left-4 top-4 z-10 flex items-center gap-2 rounded-sm border border-violet/30 bg-bg/60 px-3 py-1.5 font-tech text-[10px] uppercase tracking-[0.25em] text-violet-bright backdrop-blur">
              <span className="h-1.5 w-1.5 animate-ping-soft rounded-full bg-violet" />
              Hall-Effect · Macro Analysis
            </div>

            {/* Caption */}
            <div className="absolute bottom-4 left-4 z-10 flex items-center gap-2 font-tech text-[10px] uppercase tracking-[0.25em] text-dim">
              <Crosshair className="h-3.5 w-3.5 text-violet" />
              Brushed-gold scroll · 0.1mm detent
            </div>
          </motion.div>

          {/* ===== Manifesto ===== */}
          <div className="flex flex-col gap-8">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.15 }}
            >
              <p className="max-w-lg font-body text-lg leading-relaxed text-mut">
                We don't sell gear. We hand you the round. Every switch, sensor and
                shell is chosen so you react{' '}
                <span className="text-ink">0.3ms sooner</span> — because in esports the
                macro isn't a feature, <span className="text-violet-bright">it's a weapon.</span>
              </p>
            </motion.div>

            {/* Macro bullets */}
            <ul className="flex flex-col gap-4">
              {macroPoints.map((m, i) => (
                <motion.li
                  key={m.title}
                  initial={{ opacity: 0, x: 40 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.2 + i * 0.12 }}
                  className="flex items-start gap-4 rounded-lg border border-line bg-surface p-5"
                >
                  <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-violet/15 font-tech text-sm font-bold text-violet-bright">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <div>
                    <h3 className="font-tech text-sm font-semibold uppercase tracking-wide text-ink">
                      {m.title}
                    </h3>
                    <p className="mt-1 font-body text-sm leading-relaxed text-mut">{m.desc}</p>
                  </div>
                </motion.li>
              ))}
            </ul>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
              {stats.map((s, i) => (
                <motion.div
                  key={s.label}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.1 + i * 0.1 }}
                  className="flex flex-col gap-1 rounded-lg border border-line bg-surface p-4"
                >
                  <s.icon className="h-4 w-4 text-violet" />
                  <span className="font-display text-2xl text-ink">{s.value}</span>
                  <span className="font-tech text-[10px] uppercase tracking-[0.2em] text-dim">{s.label}</span>
                </motion.div>
              ))}
            </div>

            {/* Manifesto strip */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="flex items-center justify-between rounded-xl border border-violet/30 bg-violet/5 p-6"
            >
              <div className="flex items-center gap-3">
                <Zap className="h-5 w-5 text-violet-bright" />
                <p className="font-tech text-xs uppercase tracking-[0.25em] text-dim">
                  Level up your game
                </p>
              </div>
              <p className="font-tech text-sm font-semibold text-emerald">✓ Rapid trigger engaged</p>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
