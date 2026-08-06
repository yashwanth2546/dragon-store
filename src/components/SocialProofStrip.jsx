import React from 'react';
import { Star, Quote } from 'lucide-react';
import { motion } from 'framer-motion';
import { CloudMotif } from './CloudMotif';

const reviews = [
  { author: 'Aryan K.', city: 'Hyderabad', text: 'The ACE 68 GT is a different game. 0.1mm actuation won me a 1v5 clutch in Valorant.' },
  { author: 'Rohit S.', city: 'Bengaluru', text: 'EWEADN Z7 at 52g feels like cheating. The real carbon shell is genuinely insane.' },
  { author: 'Priya M.', city: 'Mumbai', text: 'First custom keyboard I ever owned. RyuGear made it stupidly easy.' },
  { author: 'Sameer T.', city: 'Delhi', text: 'Ordered Monday, delivered Thursday. Packing was impeccable. 10/10.' },
  { author: 'Vikram R.', city: 'Pune', text: 'PAW3950 tracking is flawless. No spinouts even at insane sensitivity.' },
  { author: 'Kavya N.', city: 'Chennai', text: 'IEMs tuned for FPS audio — footsteps hit like surround on a budget.' },
  { author: 'Arjun D.', city: 'Kolkata', text: 'Support configured rapid trigger with me in minutes. Elite service.' },
  { author: 'Neha B.', city: 'Jaipur', text: 'My K/D went up. That\'s not a joke, that\'s a RyuGear review.' },
];

function MarqueeRow({ items, reverse = false }) {
  return (
    <div className="flex overflow-hidden">
      <div
        className={`marquee-track gap-4 pr-4 ${reverse ? 'marquee-reverse' : ''}`}
        style={{ '--marquee-speed': reverse ? '48s' : '42s' }}
      >
        {[...items, ...items].map((r, i) => (
          <figure
            key={`${r.author}-${i}`}
            className="w-[320px] shrink-0 rounded-xl border border-line bg-surface p-5 sm:w-[380px]"
          >
            <div className="mb-3 flex items-center justify-between">
              <div className="flex gap-0.5 text-gold">
                {[0, 1, 2, 3, 4].map((s) => (
                  <Star key={s} className="h-3 w-3 fill-gold" />
                ))}
              </div>
              <Quote className="h-4 w-4 text-dim" />
            </div>
            <blockquote className="font-body text-sm leading-relaxed text-mut">{r.text}</blockquote>
            <figcaption className="mt-4 flex items-center gap-2.5">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-gold-deep to-gold-bright font-tech text-[11px] font-bold text-bg">
                {r.author[0]}
              </span>
              <span className="font-tech text-[10px] uppercase tracking-[0.15em] text-dim">
                {r.author} · {r.city}
              </span>
            </figcaption>
          </figure>
        ))}
      </div>
    </div>
  );
}

export function SocialProofStrip() {
  const half = Math.ceil(reviews.length / 2);

  return (
    <section className="relative overflow-hidden bg-bg py-24 sm:py-32">
      <CloudMotif />
      <div className="mx-auto max-w-[1600px] px-5 sm:px-10 lg:px-16">
        <div className="mb-14 flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
          <div>
            <motion.p
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="mb-4 font-tech text-xs uppercase tracking-[0.35em] text-gold"
            >
              / 05 — The Community
            </motion.p>
            <motion.h2
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
              className="font-display uppercase leading-[0.95] tracking-tight text-[clamp(2.4rem,5.5vw,4.5rem)] text-ink"
            >
              Rated by players.
              <span className="text-gold-bright"> Backed by pros.</span>
            </motion.h2>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.92 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="flex flex-wrap items-center justify-center gap-x-6 gap-y-4 rounded-xl border border-gold/30 bg-gradient-to-br from-gold/10 to-transparent p-5 sm:p-6"
          >
            <div className="text-center">
              <span className="font-display text-4xl font-semibold text-gold-bright sm:text-5xl">5.0</span>
              <div className="mt-1 flex justify-center gap-0.5 text-gold">
                {[0, 1, 2, 3, 4].map((s) => (
                  <Star key={s} className="h-3.5 w-3.5 fill-gold" />
                ))}
              </div>
            </div>
            <div className="hidden h-12 w-px bg-line sm:block" />
            <div className="text-center">
              <span className="font-display text-4xl font-semibold text-gradient-gold sm:text-5xl">130+</span>
              <p className="mt-1 font-tech text-[10px] uppercase tracking-[0.2em] text-gold-muted">
                Verified reviews
                <br />
                across India
              </p>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Marquee */}
      <div className="relative flex flex-col gap-4">
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-20 bg-gradient-to-r from-bg to-transparent sm:w-32" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-20 bg-gradient-to-l from-bg to-transparent sm:w-32" />
        <MarqueeRow items={reviews.slice(0, half)} />
        <MarqueeRow items={reviews.slice(half)} reverse />
      </div>
    </section>
  );
}
