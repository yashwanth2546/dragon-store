import React from 'react';
import { motion } from 'framer-motion';
import { MousePointerClick, Activity, Timer, Gauge } from 'lucide-react';
import { CloudMotif } from './CloudMotif';

const metrics = [
  { icon: Timer, label: 'Click-to-action latency', ryuValue: '0.3ms', standardValue: '8.2ms', pct: 96 },
  { icon: Gauge, label: 'Polling rate', ryuValue: '16,000Hz', standardValue: '1,000Hz', pct: 94 },
  { icon: MousePointerClick, label: 'Sensor precision', ryuValue: 'PAW3950', standardValue: 'PAW3311', pct: 92 },
];

export function BenchmarkSection() {
  return (
    <section id="benchmarks" className="relative overflow-hidden border-y border-line bg-bg-2 py-24 sm:py-32">
      <CloudMotif />
      <div className="absolute -right-40 top-0 h-[50%] w-[45%] rounded-full bg-gold/15 blur-[160px]" />

      <div className="relative mx-auto max-w-[1600px] px-5 sm:px-10 lg:px-16">
        <div className="grid gap-12 lg:grid-cols-5 lg:gap-16">
          {/* Sticky header */}
          <div className="lg:col-span-2">
            <div className="lg:sticky lg:top-32">
              <motion.p
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="mb-4 font-tech text-xs uppercase tracking-[0.35em] text-gold"
              >
                / 04 — Measured Advantage
              </motion.p>
              <motion.h2
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
                className="font-display uppercase leading-[0.95] tracking-tight text-[clamp(2.4rem,5.5vw,4.5rem)] text-ink"
              >
                Numbers
                <br />
                <span className="text-gradient-gold glow-text">don't lie.</span>
              </motion.h2>

              <motion.p
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.15 }}
                className="mt-6 max-w-sm font-body text-sm leading-relaxed text-mut"
              >
                Every RyuGear product is benched in-house before it ships. If it can't hold
                a frame advantage, it doesn't make the wall.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.25 }}
                className="mt-8 flex items-center gap-3 rounded-lg border border-gold/30 bg-gold/5 p-4"
              >
                <Activity className="h-5 w-5 shrink-0 text-gold" />
                <p className="font-tech text-xs leading-relaxed text-mut">
                  <span className="font-semibold text-gold-bright">RyuGear Benchmark Lab</span>
                  <br />
                  Hyderabad · avg. 96% faster than stock peripherals
                </p>
              </motion.div>
            </div>
          </div>

          {/* Bars */}
          <div className="flex flex-col gap-6 lg:col-span-3">
            {metrics.map((m, i) => (
              <motion.div
                key={m.label}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.4 }}
                transition={{ delay: i * 0.1, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                className="rounded-xl border border-line bg-surface p-7"
              >
                <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="rounded-lg border border-line bg-bg/60 p-2 text-gold">
                      <m.icon className="h-4 w-4" />
                    </div>
                    <span className="font-tech text-xs uppercase tracking-[0.2em] text-mut">{m.label}</span>
                  </div>
                  <span className="rounded-sm border border-line px-2 py-0.5 font-tech text-[10px] uppercase tracking-[0.2em] text-dim">
                    Vs stock
                  </span>
                </div>

                <div className="flex items-baseline gap-3">
                  <span className="font-display text-3xl font-semibold text-gold-bright">{m.ryuValue}</span>
                  <span className="font-body text-sm text-dim line-through">{m.standardValue}</span>
                </div>

                <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-bg">
                  <motion.div
                    initial={{ width: 0 }}
                    whileInView={{ width: `${m.pct}%` }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.4 + i * 0.15, duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                    className="h-full rounded-full bg-gradient-to-r from-gold-deep to-gold-bright shadow-[0_0_12px_rgba(217,168,60,0.6)]"
                  />
                </div>

                <div className="mt-2 flex justify-between font-tech text-[10px] uppercase tracking-[0.2em] text-dim">
                  <span className="text-gold">{m.pct}% faster</span>
                  <span>Stock</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
